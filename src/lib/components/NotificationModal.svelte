<script lang="ts">
  import { page } from "$app/stores";
  import Notification from "$lib/components/Notification.svelte";
  import PostRevealNotification from "$lib/components/postReveal/PostRevealNotification.svelte";
  import * as m from "$paraglide/messages";
  // eslint-disable-next-line no-restricted-imports -- It's a top level layout so I would say this is fine
  import type { GlobalAppLoadData } from "../../routes/(app)/+layout.server";

  export let modal: HTMLDialogElement;
  $: pageData = $page.data as typeof $page.data & GlobalAppLoadData;
  $: notifications = pageData["notifications"];
  $: mutateNotificationForm = pageData["mutateNotificationForm"];
  export let allowDelete = true;
  export let postReveal = false;
</script>

<dialog id="notificationModal" class="modal" bind:this={modal}>
  <div
    class="modal-box relative flex h-[calc(100dvh-8rem)] w-[calc(100dvw-2rem)] flex-col flex-nowrap"
  >
    <ul class="-mx-6 flex-nowrap overflow-y-auto">
      {#if notifications !== null}
        {#await notifications}
          <span class="loading loading-lg"></span>
        {:then notifications}
          {#if notifications.length > 0}
            {#each notifications as notification (notification.id)}
              <li>
                {#if postReveal}
                  <PostRevealNotification
                    onClick={() => modal.close()}
                    {allowDelete}
                    {notification}
                    form={mutateNotificationForm ?? undefined}
                  />
                {:else}
                  <Notification
                    onClick={() => modal.close()}
                    {allowDelete}
                    {notification}
                    form={mutateNotificationForm ?? undefined}
                  />
                {/if}
              </li>
            {/each}
          {:else}
            <li class="p-4">{m.navbar_bell_noNotifications()}</li>
          {/if}
        {/await}
      {:else}
        <li class="p-4">{m.navbar_bell_noNotifications()}</li>
      {/if}
    </ul>
    <form method="dialog">
      <button
        class="btn btn-circle btn-ghost btn-sm absolute right-2 top-2 z-10 bg-base-100"
        >✕</button
      >
    </form>
  </div>
  <form method="dialog" class="modal-backdrop">
    <button>close</button>
  </form>
</dialog>
