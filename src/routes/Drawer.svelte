<script lang="ts">
  import { page } from "$app/stores";
  import { isAuthorized } from "$lib/utils/authorization";
  import DarkLightToggle from "./DarkLightToggle.svelte";
  import LanguageSwitcher from "./LanguageSwitcher.svelte";
  import NavIcon from "$lib/components/NavIcon.svelte";
  import { getRoutes } from "./routes";

  let checked = false;
  function close() {
    checked = !checked;
  }
  $: routes = getRoutes();
</script>

<input id="main-drawer" type="checkbox" class="drawer-toggle" bind:checked />
<div class="drawer-side z-20">
  <label for="main-drawer" aria-label="close sidebar" class="drawer-overlay"
  ></label>

  <ul class="menu min-h-full min-w-60 bg-base-200 p-0 font-semibold">
    <div class="flex gap-2 p-2 pb-0">
      <DarkLightToggle class="flex-1 bg-base-300 *:size-6" />
      <LanguageSwitcher class="flex-1 bg-base-300">
        <span class="i-mdi-translate size-6"></span>
      </LanguageSwitcher>
    </div>

    <div class="p-2 pr-6">
      {#each routes as route (route.title)}
        {#if !route.accessRequired || isAuthorized(route.accessRequired, $page.data.user)}
          {#if route?.children?.length}
            <li class="py-1">
              <details>
                <summary class="active:!bg-primary/10">
                  <NavIcon icon={route.icon} />
                  {route.title}
                </summary>
                <ul>
                  {#each route.children as child (child.title)}
                    {#if !child.accessRequired || isAuthorized(child.accessRequired, $page.data.user)}
                      <li class="py-1">
                        <a
                          on:click={close}
                          href={child.path}
                          class="active:!bg-primary/10"
                        >
                          <span class={`${child.icon} size-6 text-primary`}
                          ></span>
                          {child.title}
                        </a>
                      </li>
                    {/if}
                  {/each}
                </ul>
              </details>
            </li>
          {:else}
            <li class="py-1">
              <a
                on:click={close}
                href={route.path}
                class="active:!bg-primary/10"
              >
                <NavIcon icon={route.icon} />
                {route.title}
              </a>
            </li>
          {/if}
        {/if}
      {/each}
    </div>
  </ul>
</div>
