<script lang="ts">
  import NotificationModal from "$lib/components/NotificationModal.svelte";
  import { getRoutes } from "./routes";
  import PostRevealDesktopLeftNavbar from "./PostRevealDesktopLeftNavbar.svelte";

  $: routes = getRoutes();

  const prefix = "/nollning";
  let notificationModal: HTMLDialogElement;
  let checkbox: HTMLInputElement;
</script>

<NotificationModal bind:modal={notificationModal} />

<div class="drawer">
  <input
    bind:this={checkbox}
    id="my-drawer-3"
    type="checkbox"
    class="drawer-toggle"
  />
  <div class="drawer-content flex flex-col">
    <!-- Navbar -->
    <div
      class="navbar sticky top-0 z-20 bg-base-100 shadow-[0_4px_4px_#191B2740]"
    >
      <label
        for="my-drawer-3"
        aria-label="open sidebar"
        class="btn btn-circle aspect-square size-10 bg-base-200 !p-0 lg:hidden"
      >
        <span class="i-mdi-menu size-7"></span>
      </label>
      <div class="container relative mx-auto">
        <ul
          class="menu menu-horizontal hidden w-full justify-center gap-2 lg:flex"
        >
          {#each routes as route}
            <li>
              <a
                class="btn btn-ghost text-xl font-bold"
                href={`${prefix}${route.path}`}
              >
                {route.title}
              </a>
            </li>
          {/each}
        </ul>
        <PostRevealDesktopLeftNavbar />
      </div>
    </div>
    <!-- Page content here -->
    <main class="*:scrollbar-hide relative flex-1 bg-base-100">
      <!-- so absolute positioning is outside padding -->
      <div class="scrollbar-hide px-6 py-6">
        <slot />
      </div>
    </main>
  </div>
  <div class="drawer-side z-30">
    <label for="my-drawer-3" aria-label="close sidebar" class="drawer-overlay"
    ></label>
    <ul class="menu min-h-full w-80 bg-base-100 p-4">
      <!-- Sidebar content here -->
      {#each routes as route}
        <li>
          <a
            on:click={() => (checkbox.checked = false)}
            class="btn btn-ghost justify-start text-xl font-bold"
            href={`${prefix}${route.path}`}
          >
            {route.title}
          </a>
        </li>
      {/each}
    </ul>
  </div>
</div>
