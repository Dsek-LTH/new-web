<script lang="ts">
  import { page } from "$app/stores";
  import LoadingButton from "$lib/components/LoadingButton.svelte";
  import NavIcon from "$lib/components/NavIcon.svelte";
  import { signIn } from "@auth/sveltekit/client";
  import NotificationBell from "../../NotificationBell.svelte";
  import type { PostRevealLayoutData } from "./+layout.server";
  import { getFullName } from "$lib/utils/client/member";
  import { POST_REVEAL_PREFIX } from "$lib/components/postReveal/types";
  import LanguageSwitcher from "../../LanguageSwitcher.svelte";
  import type { PhadderGroup } from "@prisma/client";
  import * as m from "$paraglide/messages";

  $: pageData = $page.data as typeof $page.data & PostRevealLayoutData;
  $: member = $page.data.member;
  $: nollaInGroup = $page.data["phadderGroup"] as Promise<
    Pick<PhadderGroup, "name"> | undefined
  >;

  $: notifications = pageData["notifications"];
</script>

<!-- notification and account -->
<div class="absolute right-0 z-30 flex gap-2">
  {#if $page.data.user && $page.data.member}
    {#if notifications !== null}
      <NotificationBell
        postReveal
        {notifications}
        form={pageData["mutateNotificationForm"]}
        buttonClass="btn btn-circle bg-base-200 relative aspect-square size-10 !p-0"
      >
        {#await notifications}
          <span class="i-mdi-bell-outline size-7"></span>
        {:then notifications}
          {@const unreadCount = notifications.filter(
            (data) => data.readAt == null,
          ).length}
          <div class="indicator">
            {#if unreadCount > 0}
              <span
                class="translate badge indicator-item badge-primary badge-xs translate-x-0 translate-y-0"
              ></span>
            {/if}
            <span class="i-mdi-bell-outline size-7"></span>
          </div>
        {/await}
      </NotificationBell>
    {/if}
    <div class="dropdown dropdown-end dropdown-hover">
      <!-- svelte-ignore a11y-no-noninteractive-tabindex -->
      <!-- svelte-ignore a11y-label-has-associated-control -->
      <label
        tabindex="0"
        class="btn btn-circle aspect-square size-10 bg-base-200 !p-0"
      >
        <span class="i-mdi-account-outline size-8"></span>
      </label>
      <!-- svelte-ignore a11y-no-noninteractive-tabindex -->
      <ul
        tabindex="0"
        class="menu dropdown-content z-[1] w-52 rounded-box bg-base-200 p-2 shadow"
      >
        {#if member}
          <li class="pointer-events-none">
            <div class="flex !flex-col items-start gap-0">
              <span class="line-clamp-1 text-left font-medium">
                {getFullName(member)}
              </span>
              {#await nollaInGroup then group}
                {#if group}
                  <span class="text-neutral">{group.name}</span>
                {/if}
              {/await}
            </div>
          </li>
        {/if}
        <div class="divider m-0"></div>
        <li>
          <a href="/members/me"
            ><span class="i-mdi-account text-2xl"></span>
            {m.navbar_userMenu_profile()}</a
          >
        </li>
        <li>
          <a href="{POST_REVEAL_PREFIX}/settings"
            ><span class="i-mdi-settings-outline text-2xl"></span>
            {m.navbar_userMenu_settings()}</a
          >
        </li>
        <li>
          <a href="{POST_REVEAL_PREFIX}/shop/inventory"
            ><span class="i-mdi-treasure-chest-outline text-2xl"></span>
            {m.navbar_userMenu_inventory()}</a
          >
        </li>
        <li>
          <a href="/">
            D-sek <span class="i-mdi-arrow-right"></span>
          </a>
        </li>
        <li>
          <LanguageSwitcher />
        </li>
      </ul>
    </div>
  {:else}
    <LoadingButton
      class="btn btn-ghost gap-0"
      onClick={() => signIn("keycloak")}
    >
      <NavIcon class="text-inherit" icon="i-mdi-login" />
    </LoadingButton>
  {/if}
</div>
