import * as Sentry from "@sentry/sveltekit";
import { env } from "$env/dynamic/private";
import keycloak from "$lib/server/keycloak";
import authorizedPrismaClient from "$lib/server/authorizedPrisma";
import { i18n } from "$lib/utils/i18n";
import { createMember } from "$lib/utils/member";
import { redirect } from "$lib/utils/redirect";
import { themes, type Theme } from "$lib/utils/themes";
import {
  isAvailableLanguageTag,
  setLanguageTag,
  sourceLanguageTag,
} from "$paraglide/runtime";
import Keycloak, { type KeycloakProfile } from "@auth/core/providers/keycloak";
import type { TokenSet } from "@auth/core/types";
import { SvelteKitAuth } from "@auth/sveltekit";
import { PrismaClient } from "@prisma/client";
import { error, type Handle, type HandleServerError } from "@sveltejs/kit";
import { sequence } from "@sveltejs/kit/hooks";
import { enhance } from "@zenstackhq/runtime";
import RPCApiHandler from "@zenstackhq/server/api/rpc";
import zenstack from "@zenstackhq/server/sveltekit";
import { randomBytes } from "crypto";
import schedule from "node-schedule";
import loggingExtension from "./database/prisma/loggingExtension";
import translatedExtension from "./database/prisma/translationExtension";
import { getAccessPolicies } from "./hooks.server.helpers";
import { getDerivedRoles } from "$lib/utils/authorization";
import meilisearchSync from "$lib/search/sync";
import {
  PrismaClientKnownRequestError,
  PrismaClientValidationError,
} from "@prisma/client/runtime/library";
import { verifyCostCenterData } from "./routes/(app)/expenses/verification";
import { dev } from "$app/environment";

Sentry.init({
  dsn: "https://763ca90d83f725f70b31f0fd40e7ffda@o4508757277212672.ingest.de.sentry.io/4508757278523472",
  tracesSampleRate: 1,
});

// TODO: This function should perhaps only be called during dev? Build? I'm not sure
if (dev) verifyCostCenterData();

const { handle: authHandle } = SvelteKitAuth({
  secret: env.AUTH_SECRET,
  trustHost: true,
  providers: [
    Keycloak({
      clientId: env.KEYCLOAK_CLIENT_ID,
      clientSecret: env.KEYCLOAK_CLIENT_SECRET,
      issuer: env.KEYCLOAK_CLIENT_ISSUER,
      profile: (profile: KeycloakProfile, tokens: TokenSet) => {
        return {
          id_token: tokens.id_token,
          id: profile.sub,
          given_name: profile.given_name,
          family_name: profile.family_name,
          email: profile.email,
          student_id: profile.preferred_username,
          // The keycloak client doesn't guarantee this field
          // to be present, but we assume it always is.
          group_list: profile["group_list"] ?? [],
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.student_id = user.student_id;
        token.group_list = user.group_list ?? [];
        token.id_token = user.id_token;
        token.given_name = user.given_name;
        token.family_name = user.family_name;
        token.email = user.email;
      }
      return token;
    },
    session(params) {
      const { session } = params;
      if ("token" in params && params.session?.user) {
        const { token } = params;
        session.user.student_id = token.student_id;
        session.user.email = token.email ?? "";
        session.user.group_list = token.group_list;
        session.user.given_name = token.given_name;
        session.user.family_name = token.family_name;
      }
      return session;
    },
  },
  events: {
    async signOut(message) {
      if (!("token" in message)) {
        return;
      }
      const idToken = message.token?.id_token;
      const params = new URLSearchParams();
      params.append("id_token_hint", idToken as string);
      await fetch(
        `${
          env.KEYCLOAK_CLIENT_ISSUER
        }/protocol/openid-connect/logout?${params.toString()}`,
      );
    },
  },
});

const prismaClient = authorizedPrismaClient;
const databaseHandle: Handle = async ({ event, resolve }) => {
  const lang = isAvailableLanguageTag(event.locals.paraglide?.lang)
    ? event.locals.paraglide?.lang
    : sourceLanguageTag;
  event.locals.language = lang;
  setLanguageTag(lang);
  const session = await event.locals.getSession();
  const prisma = prismaClient
    .$extends(translatedExtension(lang))
    .$extends(loggingExtension(session?.user.student_id)) as PrismaClient;

  if (!session?.user) {
    let externalCode = event.cookies.get("externalCode"); // Retrieve the externalCode from cookies
    if (!externalCode) {
      // Generate a new externalCode if it doesn't exist
      externalCode = randomBytes(16).toString("hex");
      event.cookies.set("externalCode", externalCode, {
        httpOnly: false, // Make the cookie accessible to client-side JavaScript
        path: "/", // Cookie is available on all pages
        secure: process.env["NODE_ENV"] === "production", // Only send cookie over HTTPS in production
      });
    }
    const roles = getDerivedRoles(undefined, false);
    const policies = await getAccessPolicies(prisma, roles);
    const user = {
      studentId: undefined,
      memberId: undefined,
      policies,
      externalCode: externalCode, // For anonymous users
      roles,
    };
    event.locals.prisma = enhance(prisma, {
      user,
    });
    event.locals.user = user;
  } else {
    const existingMember = await prisma.member.findUnique({
      where: { studentId: session.user.student_id },
    });
    const member =
      existingMember ||
      (await createMember(prisma, {
        studentId: session.user.student_id,
        firstName: session.user.given_name,
        lastName: session.user.family_name,
        email: session.user.email,
      }));

    if (
      i18n.route(event.url.pathname) != "/onboarding" &&
      (!member.classProgramme || !member.classYear) // consider adding email here, but make sure to fix onboarding as well
    ) {
      redirect(302, "/onboarding");
    }

    const roles = getDerivedRoles(
      session.user.group_list,
      !!session.user.student_id,
      member.classYear ?? undefined,
    );
    const user = {
      studentId: session.user.student_id,
      memberId: member!.id,
      policies: await getAccessPolicies(prisma, roles, session.user.student_id),
      roles,
    };

    event.locals.prisma = enhance(prisma, { user });
    event.locals.user = user;
    event.locals.member = member!;
  }

  return resolve(event);
};

const apiHandle = zenstack.SvelteKitHandler({
  prefix: "/api/model",
  getPrisma: (event) => event.locals.prisma,
  handler: (req) => {
    if (req.method !== "GET") error(403); // until we have proper field-level policies, only allow reads
    return RPCApiHandler()(req);
  },
});

const APP_INSETS_REGEX = /APP-INSETS\s*\(([^)]*)\)/;
const appHandle: Handle = async ({ event, resolve }) => {
  const userAgent = event.request.headers.get("user-agent");
  if (userAgent?.startsWith("DSEK-APP") || env.MOCK_IS_APP === "true") {
    event.locals.isApp = true;
    const insetsJson = APP_INSETS_REGEX.exec(userAgent ?? "")?.[1];
    const insets = JSON.parse(insetsJson ?? "{}");
    event.locals.appInfo = {
      insets: {
        top: insets?.top ? Number(insets.top) : 0,
        bottom: insets?.bottom ? Number(insets.bottom) : 0,
        left: insets?.left ? Number(insets.left) : 0,
        right: insets?.right ? Number(insets.right) : 0,
      },
    };
  } else {
    event.locals.isApp = false;
    event.locals.appInfo = undefined;
  }
  return resolve(event);
};

const themeHandle: Handle = async ({ event, resolve }) => {
  let theme = event.cookies.get("theme");

  if (!theme || !themes.includes(theme as Theme)) {
    theme = "dark";
  }
  // get theme from cookies and send to frontend to show correct icon in theme switch
  event.locals.theme = theme as Theme;

  return resolve(event, {
    transformPageChunk: ({ html }) => {
      return html.replace("%theme%", theme);
    },
  });
};

// run a keycloak sync every day at midnight
schedule.scheduleJob("0 0 * * *", () => keycloak.sync(authorizedPrismaClient));
schedule.scheduleJob("0 0 * * *", meilisearchSync);

export const handleError: HandleServerError = Sentry.handleErrorWithSentry(
  ({ error }) => {
    if (error instanceof PrismaClientKnownRequestError) {
      const { message, name, code } = error;
      console.log("prisma known request error", { message, name, code });
      return {
        message: message,
      };
    } else if (error instanceof PrismaClientValidationError) {
      console.error("prisma validation error", error.message, error.name);
      return {
        message: "Database validation error, see logs for more info",
      };
    }
    return {
      message: error instanceof Error ? error.message : `${error}`,
    };
  },
);

export const handle = sequence(
  Sentry.sentryHandle(),
  authHandle,
  i18n.handle(),
  databaseHandle,
  apiHandle,
  appHandle,
  themeHandle,
);
