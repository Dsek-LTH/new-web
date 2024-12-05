<script lang="ts">
  import { page } from "$app/stores";
  import { POST_REVEAL_PREFIX } from "$lib/components/postReveal/types";
  import { getFullName } from "$lib/utils/client/member";
  import type { PhadderGroup } from "@prisma/client";
  import LanguageSwitcher from "../../LanguageSwitcher.svelte";
  import * as m from "$paraglide/messages";

  let checked = false;
  $: topInsets = $page.data.appInfo?.insets?.top ?? 0;
  $: member = $page.data.member;
  $: nollaInGroup = $page.data["phadderGroup"] as Promise<
    Pick<PhadderGroup, "name"> | undefined
  >;
</script>

<!-- PostRevealDesktopLeftNavbar also has some duplicated stuff so remember to change both -->

<div class="drawer-end">
  <input
    id="nolla-account-drawer"
    type="checkbox"
    class="drawer-toggle"
    bind:checked
  />
  <div class="drawer-side z-20">
    <label
      for="nolla-account-drawer"
      aria-label="close sidebar"
      class="drawer-overlay"
    ></label>

    <!-- Drawer content -->
    <aside
      class="flex min-h-full max-w-72 flex-col items-stretch rounded-box rounded-r-none bg-base-100 px-4 pb-6 md:max-w-80"
      style={`padding-top: calc(1.5rem + ${topInsets}px)`}
    >
      {#if member}
        <div class="flex items-start justify-start gap-2">
          <label
            for="nolla-account-drawer"
            aria-label="open account sidebar"
            class="btn btn-circle aspect-square size-10 !p-0"
          >
            <span class="i-mdi-account-outline size-8"></span>
          </label>
          <div>
            <span class="line-clamp-1 text-left font-medium"
              >{getFullName({
                ...member,
              })}</span
            >
            {#await nollaInGroup then group}
              {#if group}
                <span class="text-neutral">{group?.name}</span>
              {/if}
            {/await}
          </div>
        </div>
      {/if}
      <ul class="menu -mx-4 mt-4 items-start gap-2">
        <li>
          <a on:click={() => (checked = false)} href="/members/me">
            <span class="i-mdi-account text-2xl"></span>
            {m.navbar_userMenu_profile()}
          </a>
        </li>
        <li>
          <a
            on:click={() => (checked = false)}
            href="{POST_REVEAL_PREFIX}/settings"
          >
            <span class="i-mdi-settings-outline text-2xl"></span>
            {m.navbar_userMenu_settings()}</a
          >
        </li>
        <li>
          <a
            on:click={() => (checked = false)}
            href="{POST_REVEAL_PREFIX}/shop/inventory"
          >
            <span class="i-mdi-treasure-chest-outline text-2xl"></span>
            {m.navbar_userMenu_inventory()}</a
          >
        </li>
      </ul>
      <a href="/home" class="btn-primary-dark btn mt-8 self-stretch">
        D-sek <span class="i-mdi-arrow-right"></span>
      </a>
      <LanguageSwitcher class=" mt-8 bg-base-200" />
    </aside>
  </div>
</div>
