import { env } from "$env/dynamic/private";
import keycloak from "$lib/server/keycloak";
import { i18n } from "$lib/utils/i18n";
import { isAvailableLanguageTag, sourceLanguageTag } from "$paraglide/runtime";
import Keycloak, { type KeycloakProfile } from "@auth/core/providers/keycloak";
import type { TokenSet } from "@auth/core/types";
import { SvelteKitAuth } from "@auth/sveltekit";
import { PrismaClient } from "@prisma/client";
import { error, type Handle } from "@sveltejs/kit";
import { redirect } from "$lib/utils/redirect";
import { sequence } from "@sveltejs/kit/hooks";
import { enhance } from "@zenstackhq/runtime";
import RPCApiHandler from "@zenstackhq/server/api/rpc";
import zenstack from "@zenstackhq/server/sveltekit";
import { randomBytes } from "crypto";
import schedule from "node-schedule";
import translatedExtension from "./database/prisma/translationExtension";
import { getAccessPolicies } from "./hooks.server.helpers";

const authHandle = SvelteKitAuth({
  secret: env.AUTH_SECRET,
  trustHost: true,
  providers: [
    Keycloak({
      clientId: env.KEYCLOAK_CLIENT_ID,
      clientSecret: env.KEYCLOAK_CLIENT_SECRET,
      issuer: env.KEYCLOAK_CLIENT_ISSUER,
      profile: (profile: KeycloakProfile, tokens: TokenSet) => {
        return {
          access_token: tokens.access_token,
          id_token: tokens.id_token,
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          student_id: profile.preferred_username,
          // The keycloak client doesn't guarantee these fields
          // to be present, but we assume they always are.
          image: profile["image"],
          group_list: profile["group_list"] ?? [],
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.student_id = user?.student_id;
        token.group_list = user?.group_list ?? [];
        token.access_token = user?.access_token;
        token.id_token = user?.id_token;
        token.email = user.email;
      }
      return token;
    },
    session(params) {
      const { session } = params;
      if ("token" in params && params.session?.user) {
        const { token } = params;
        session.user.student_id = token.student_id;
        session.user.email = token.email;
        session.user.group_list = token.group_list;
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

const prismaClient = new PrismaClient({ log: ["info"] });
const databaseHandle: Handle = async ({ event, resolve }) => {
  const lang = isAvailableLanguageTag(event.locals.paraglide?.lang)
    ? event.locals.paraglide?.lang
    : sourceLanguageTag;
  const prisma = prismaClient.$extends(
    translatedExtension(lang),
  ) as PrismaClient;
  const session = await event.locals.getSession();

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
    const policies = await getAccessPolicies(prisma);
    event.locals.prisma = enhance(
      prisma,
      {
        user: {
          studentId: undefined,
          memberId: undefined,
          policies,
          externalCode: externalCode, // For anonymous users
        },
      },
      { logPrismaQuery: process.env["NODE_ENV"] === "production" }, // Log queries in production
    );
    event.locals.user = {
      studentId: undefined,
      memberId: undefined,
      policies,
      externalCode: externalCode,
    };
  } else {
    const existingMember = await prisma.member.findUnique({
      where: { studentId: session.user.student_id },
    });
    const member =
      existingMember ||
      (await prisma.member.create({
        data: {
          studentId: session.user.student_id,
          firstName: session.user.name?.split(" ")[0],
          email: session.user.email,
        },
      }));

    if (
      event.url.pathname != "/onboarding" &&
      (!member.classProgramme || !member.classYear) // consider adding email here, but make sure to fix onboarding as well
    ) {
      redirect(302, i18n.resolveRoute("/onboarding"));
    }

    const user = {
      studentId: session.user.student_id,
      memberId: member!.id,
      policies: await getAccessPolicies(
        prisma,
        session.user.student_id,
        session.user.group_list,
      ),
    };
    event.locals.prisma = enhance(
      prisma,
      { user },
      { logPrismaQuery: process.env["NODE_ENV"] === "production" },
    );
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

schedule.scheduleJob("* */24 * * *", () =>
  keycloak.updateMandate(prismaClient),
);

export const handle = sequence(
  authHandle,
  i18n.handle(),
  databaseHandle,
  apiHandle,
);
