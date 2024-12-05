<script lang="ts">
  import { invalidateAll } from "$app/navigation";
  import { page } from "$app/stores";
  import DsekLogo from "$lib/components/DsekLogo.svelte";
  import { i18n } from "$lib/utils/i18n";
  import * as m from "$paraglide/messages";
  import { languageTag } from "$paraglide/runtime";
  import "./nolla.css";

  let checked = false;

  const routes = [
    { text: m.nolla_nav_start(), link: "/nolla" },
    { text: m.nolla_nav_nollning(), link: "/nolla/nollning" },
    { text: m.nolla_nav_sektionen(), link: "/nolla/sektionen" },
    { text: m.nolla_nav_todo(), link: "/nolla/todo" },
  ];
  $: drawerRoutes = [
    ...routes,
    { text: m.nolla_nav_wellbeing(), link: "/nolla/wellbeing" },
    { text: m.nolla_wordlist_header(), link: "/nolla/wordlist" },
  ];
</script>

<div
  class="nolla-pre-reveal drawer flex-1 font-nolla-sans"
  data-theme="nollningPreReveal"
>
  <input id="my-drawer-3" type="checkbox" class="drawer-toggle" bind:checked />
  <div class="drawer-content flex flex-col">
    <!-- Navbar -->
    <nav class="container navbar mx-auto w-full p-6 lg:py-12">
      <div class="flex-none lg:hidden">
        <a href="/nolla">
          <DsekLogo
            class="mx-4 hidden size-16 sm:block lg:hidden"
            variant="full"
          />
        </a>
        <label
          for="my-drawer-3"
          aria-label="open sidebar"
          class="btn btn-square btn-ghost"
        >
          <span class="i-mdi-menu text-4xl"></span>
        </label>
      </div>
      <ul
        class="hidden w-full gap-24 text-2xl font-semibold *:bg-gradient-to-r *:from-primary *:to-primary *:bg-[length:0_2px] *:bg-bottom *:bg-no-repeat *:transition-all lg:flex"
      >
        {#each routes as route}
          <li class="hover:bg-[length:100%_2px]">
            <a href={route.link}>{route.text}</a>
          </li>
        {/each}
      </ul>
      <div class="flex flex-1 items-stretch justify-end gap-4">
        <!-- svelte-ignore a11y_consider_explicit_label -->
        <a
          class="neo-brutal-btn aspect-square"
          href={i18n.route($page.url.pathname)}
          hreflang={languageTag() === "sv" ? "en" : "sv"}
          on:click={() => invalidateAll()}
        >
          <span
            class:i-flag-gb-4x3={languageTag() !== "sv"}
            class:i-flag-se-4x3={languageTag() === "sv"}
            class="h-8 w-8"
          ></span>
        </a>

        <a href="/" class="neo-brutal-btn">
          dsek.se
          <span class="i-mdi-arrow-right ml-2 h-8 w-8"></span>
        </a>
      </div>
    </nav>
    <main class="container mx-auto flex-1 px-4 py-16 sm:px-8">
      <slot />
    </main>
  </div>
  <!-- Drawer -->
  <nav class="drawer-side">
    <label for="my-drawer-3" aria-label="close sidebar" class="drawer-overlay"
    ></label>
    <ul
      class="menu menu-lg min-h-full w-80 bg-base-200 p-4 text-2xl font-semibold"
    >
      {#each drawerRoutes as route}
        <li>
          <a on:click={() => (checked = false)} href={route.link} class=""
            >{route.text}</a
          >
        </li>
      {/each}
    </ul>
  </nav>
</div>
