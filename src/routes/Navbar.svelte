<script lang="ts">
  import { page } from "$app/stores";
  import LoadingButton from "$lib/components/LoadingButton.svelte";
  import NavIcon from "$lib/components/NavIcon.svelte";
  import Search from "$lib/components/Search.svelte";
  import { isAuthorized } from "$lib/utils/authorization";
  import * as m from "$paraglide/messages";
  import { signIn } from "@auth/sveltekit/client";
  import type { GlobalAppLoadData } from "./(app)/+layout.server";
  import DarkLightToggle from "./DarkLightToggle.svelte";
  import LanguageSwitcher from "./LanguageSwitcher.svelte";
  import NotificationBell from "./NotificationBell.svelte";
  import UserMenu from "./UserMenu.svelte";
  import { getRoutes } from "./routes";
  $: pageData = $page.data as typeof $page.data & GlobalAppLoadData;
  $: notifications = pageData["notifications"];
  $: mutateNotificationForm = pageData["mutateNotificationForm"];
  $: shopItemCounts = pageData["shopItemCounts"];
  $: routes = getRoutes();
</script>

<div
  class="sticky top-0 z-10 bg-base-300 bg-opacity-60 filter backdrop-blur transition-all"
>
  <div class="container navbar mx-auto">
    <!-- Open drawer icon -->
    <div class="block xl:hidden">
      <label
        for="main-drawer"
        aria-label="open sidebar"
        class="btn btn-square btn-ghost"
      >
        <span class="i-mdi-menu h-8 w-8 text-primary"></span>
      </label>
    </div>
    <div class="block flex-1 bg-red-500 xl:hidden"></div>

    <!-- Navbar content -->
    <div class="container hidden flex-1 xl:block">
      {#each routes as route (route.title)}
        {#if !route.accessRequired || isAuthorized(route.accessRequired, $page.data.user)}
          {#if route?.children?.length}
            <div class="dropdown dropdown-hover">
              <!-- svelte-ignore a11y-no-noninteractive-tabindex -->
              <label tabindex="0" class="btn btn-ghost">
                <NavIcon icon={route.icon} />
                {route.title}</label
              >
              <!-- svelte-ignore a11y-no-noninteractive-tabindex -->
              <ul
                tabindex="0"
                class="menu dropdown-content z-[1] w-52 rounded-box bg-base-200 p-2 shadow"
              >
                {#each route.children as child (child.title)}
                  {#if !child.accessRequired || isAuthorized(child.accessRequired, $page.data.user)}
                    <li>
                      <a
                        href={child.path}
                        class="btn-ghost active:!bg-primary/10"
                      >
                        <NavIcon icon={child.icon} />
                        {child.title}</a
                      >
                    </li>
                  {/if}
                {/each}
              </ul>
            </div>
          {:else}
            <a class="btn btn-ghost" href={route.path}>
              <NavIcon icon={route.icon} />
              {route.title}
            </a>
          {/if}
        {/if}
      {/each}
    </div>
    <Search />
    <div class="flex">
      <div class="hidden xl:flex">
        <!-- This will be shown in the drawer instead. -->
        <DarkLightToggle />
        <LanguageSwitcher />
      </div>

      {#if notifications !== null}
        <NotificationBell {notifications} form={mutateNotificationForm} />
      {/if}
      {#if $page.data.user && $page.data.member}
        <UserMenu
          user={$page.data.user}
          member={$page.data.member}
          {shopItemCounts}
        />
      {:else}
        <LoadingButton class="btn btn-ghost" onClick={() => signIn("keycloak")}>
          {m.navbar_logIn()}
        </LoadingButton>
      {/if}
    </div>
  </div>
</div>
