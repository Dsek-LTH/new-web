import apiNames from "$lib/utils/apiNames";
import * as m from "$paraglide/messages";

// bottom-nav: Show in the bottom navigation bar
// home-link: Show on the home page
// none: Don't show anywhere
type AppBehaviour = "bottom-nav" | "home-link" | "none";

type Route = {
  title: string;
  path: string | null;
  icon: string;
  accessRequired: string | null;
  appBehaviour?: AppBehaviour;
  children?: Route[];
};
export const getRoutes = (): Route[] =>
  [
    {
      title: m.home(),
      path: "/",
      icon: "i-mdi-home",
      accessRequired: null,
      appBehaviour: "none",
    },
    {
      title: m.news(),
      path: "/news",
      icon: "i-mdi-newspaper",
      accessRequired: apiNames.NEWS.READ,
      appBehaviour: "bottom-nav",
    },
    {
      title: m.events(),
      path: "/events",
      icon: "i-mdi-calendar",
      accessRequired: apiNames.EVENT.READ,
      appBehaviour: "bottom-nav",
    },
    {
      title: m.tickets(),
      path: "/shop/tickets",
      icon: "i-mdi-ticket",
      accessRequired: apiNames.WEBSHOP.PURCHASE,
      appBehaviour: "bottom-nav",
    },
    {
      title: m.documents(),
      path: null,
      icon: "i-mdi-text-box-multiple",
      appBehaviour: "none",
      accessRequired: null,
      children: [
        {
          title: m.documents_governingDocuments(),
          path: "/documents/governing",
          icon: "i-mdi-gavel",
          accessRequired: null,
          appBehaviour: "home-link",
        },
        {
          title: m.documents_meetingDocuments(),
          path: "/documents",
          icon: "i-mdi-text-box-multiple",
          accessRequired: null,
          appBehaviour: "home-link",
        },
        {
          title: m.documents_requirementProfiles(),
          path: "/documents/requirements",
          icon: "i-mdi-vote",
          accessRequired: null,
          appBehaviour: "home-link",
        },
      ],
    },
    {
      title: m.theGuild(),
      path: null,
      icon: "dsek-icon",
      accessRequired: null,
      appBehaviour: "none",
      children: [
        {
          title: m.theBoard(),
          path: "/board",
          icon: "i-mdi-account-tie",
          accessRequired: null,
          appBehaviour: "home-link",
        },
        {
          title: m.committees(),
          path: "/committees",
          icon: "i-mdi-account-group",
          accessRequired: null,
          appBehaviour: "home-link",
        },
        {
          title: m.bookings(),
          path: "/booking",
          icon: "i-mdi-calendar-cursor",
          accessRequired: apiNames.BOOKINGS.READ,
          appBehaviour: "home-link",
        },
        {
          title: m.songBook(),
          path: "/songbook",
          icon: "i-mdi-library-music",
          accessRequired: null,
          appBehaviour: "home-link",
        },
      ],
    },
    {
      title: m.admin(),
      path: null,
      icon: "i-mdi-security",
      accessRequired: apiNames.ADMIN.READ,
      appBehaviour: "none",
      children: [
        {
          title: m.access(),
          path: "/admin/access",
          icon: "i-mdi-key",
          accessRequired: apiNames.ACCESS_POLICY.READ,
        },
        {
          title: m.doors(),
          path: "/admin/doors",
          icon: "i-mdi-door-open",
          accessRequired: apiNames.DOOR.READ,
        },
        {
          title: m.emailAliases(),
          path: "/admin/email-alias",
          icon: "i-mdi-email",
          accessRequired: apiNames.EMAIL_ALIAS.READ,
        },
        {
          title: m.alerts(),
          path: "/admin/alerts",
          icon: "i-mdi-alert-circle",
          accessRequired: apiNames.ALERT,
        },
      ],
    },
  ] as const;

export const appBottomNavRoutes = (routes: Route[]): Route[] =>
  [
    {
      title: "Hem",
      icon: "dsek-icon",
      path: "/app/home",
      accessRequired: null,
    } as Route,
  ]
    .concat(
      routes
        .flatMap((route) =>
          route.children ? [route, ...route.children] : route,
        )
        .filter((route) => {
          return route.appBehaviour === "bottom-nav";
        }),
    )
    .concat([
      {
        title: "Konto",
        icon: "i-mdi-account-circle",
        path: "/app/account",
        accessRequired: null,
      },
    ]);
