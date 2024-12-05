<script lang="ts">
  import type { UserShopItemCounts } from "$lib/server/shop/countUserShopItems";
  import { getFullName } from "$lib/utils/client/member";
  import { signOut } from "@auth/sveltekit/client";
  import type { Member } from "@prisma/client";
  import type { AuthUser } from "@zenstackhq/runtime";
  import * as m from "$paraglide/messages";
  import LoadingButton from "$lib/components/LoadingButton.svelte";
  import MemberAvatar from "$lib/components/socials/MemberAvatar.svelte";

  export let member: Member;
  export let user: AuthUser;
  export let shopItemCounts: UserShopItemCounts;

  $: amountInCart = Promise.all([
    shopItemCounts?.inCart,
    shopItemCounts?.reserved,
  ]).then(([inCart, reserved]) => (inCart ?? 0) + (reserved ?? 0));
</script>

<div class="dropdown dropdown-end dropdown-hover">
  <!-- svelte-ignore a11y-no-noninteractive-tabindex -->
  <label tabindex="0" class="btn btn-ghost">
    {#await amountInCart}
      <MemberAvatar {member} />
    {:then amountInCart}
      {#if amountInCart > 0}
        <div class="indicator">
          <span
            class="badge indicator-item badge-primary badge-sm indicator-start indicator-top"
            >{amountInCart}
          </span>
          <MemberAvatar {member} />
        </div>
      {:else}
        <MemberAvatar {member} />
      {/if}
    {/await}
  </label>
  <!-- svelte-ignore a11y-no-noninteractive-tabindex -->
  <div
    tabindex="0"
    class="card dropdown-content card-compact z-[1] min-w-[200px] max-w-[min(800px,calc(100vw-20px))] bg-base-200 p-2 text-center text-base-content shadow"
  >
    <div class="card-body">
      <p class="text-center font-semibold">{m.navbar_userMenu_loggedInAs()}</p>
      <div class="min-w-0">
        <h3 class="truncate text-xl font-bold" title={getFullName(member)}>
          {getFullName(member)}
        </h3>
      </div>
      <p class="text-sm">({user?.studentId})</p>
      <span class="divider m-1"></span>

      <div class="flex flex-col items-start gap-2">
        <a
          href={`/members/me`}
          class="btn btn-ghost w-full justify-start text-base-content"
        >
          <span class="i-mdi-account-circle size-6 text-primary"></span>
          {m.navbar_userMenu_profile()}
        </a>
        <a href="/settings" class="btn btn-ghost w-full justify-start">
          <span class="i-mdi-cog size-6 text-primary"></span>
          {m.navbar_userMenu_settings()}
        </a>
        <a href="/shop/inventory" class="btn btn-ghost w-full justify-start">
          <span class="i-mdi-treasure-chest size-6 text-primary"></span>
          {m.navbar_userMenu_inventory()}
        </a>
        {#await amountInCart then amountInCart}
          {#if amountInCart > 0}
            <a href="/shop/cart" class="btn btn-ghost w-full justify-start">
              <span class="i-mdi-cart size-6 text-primary"></span>
              <span>{m.navbar_userMenu_cart()}</span>
              <span class="badge badge-primary badge-sm">{amountInCart}</span>
            </a>
          {/if}
        {/await}
      </div>
      <span class="divider m-1"></span>
      <LoadingButton
        class="btn btn-ghost justify-start"
        onClick={() => signOut()}
      >
        <span class="i-mdi-logout size-6 text-primary"></span>
        {m.navbar_userMenu_logOut()}
      </LoadingButton>
    </div>
  </div>
</div>
