<script lang="ts">
  import { page } from "$app/stores";
  import type { UserShopItemCounts } from "$lib/server/shop/countUserShopItems";
  import { i18n } from "$lib/utils/i18n";
  import NavIcon from "$lib/components/NavIcon.svelte";
  import { appBottomNavRoutes, getRoutes } from "./routes";
  $: shopItemCounts = $page.data["shopItemCounts"] as UserShopItemCounts;
  $: routes = getRoutes();
  $: routesToShow = appBottomNavRoutes(routes);
  $: currentRoute = i18n.route($page.url.pathname);
  $: currentRouteIndex = routesToShow.findIndex(
    (route) => route.path === currentRoute,
  );
  $: bottomInsets = $page.data.appInfo?.insets?.bottom ?? 0;
</script>

<nav
  class="btm-nav left-2 right-2 w-[calc(100%-1rem)] overflow-hidden rounded-lg bg-base-300 bg-opacity-60 filter backdrop-blur"
  style="bottom: {bottomInsets || 16}px;"
>
  <div
    class="absolute bottom-1 h-px w-[15%] bg-primary transition-all ease-out"
    class:opacity-0={currentRouteIndex === -1}
    style="left: {currentRouteIndex * (100 / routesToShow.length) + 2.5}%;"
  ></div>
  {#each routesToShow as route (route.path)}
    {#await shopItemCounts?.inCart}
      <a href={route.path}>
        <NavIcon icon={route.icon} />
        <!-- <span class="btm-nav-label text-[0.5rem] uppercase">{route.title}</span> -->
      </a>
    {:then inCart}
      {#if inCart && route.specialBehaviour === "cart-badge"}
        <!-- shop icon -->
        <a href={route.path}>
          <div class="indicator">
            <NavIcon icon={route.icon} />
            <span class="badge indicator-item badge-error">
              {inCart}
            </span>
            <!-- <span class="btm-nav-label text-[0.5rem] uppercase">{route.title}</span> -->
          </div>
        </a>
      {:else}
        <a href={route.path}>
          <NavIcon icon={route.icon} />
          <!-- <span class="btm-nav-label text-[0.5rem] uppercase">{route.title}</span> -->
        </a>
      {/if}
    {/await}
  {/each}
</nav>
