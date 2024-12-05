<script lang="ts">
  import { page } from "$app/stores";
  import Notification from "$lib/components/Notification.svelte";
  import NotificationModal from "$lib/components/NotificationModal.svelte";
  import PostRevealNotification from "$lib/components/postReveal/PostRevealNotification.svelte";
  import { superForm } from "$lib/utils/client/superForms";
  import type { NotificationGroup } from "$lib/utils/notifications/group";
  import type { NotificationSchema } from "$lib/zod/schemas";
  import * as m from "$paraglide/messages";
  import { flip } from "svelte/animate";
  import type { SuperValidated } from "sveltekit-superforms";
  import { twMerge } from "tailwind-merge";

  export let notifications: Promise<NotificationGroup[]>;
  export let form: SuperValidated<NotificationSchema>;
  export let useModalInstead = false;
  export let externalModal: HTMLDialogElement | undefined = undefined;
  export let buttonClass: string | undefined = undefined;
  export let postReveal = false;
  let internalModal: HTMLDialogElement;

  // Get the number of unread notifications, which is then used to indicate the user

  // this is a somewhat ugly way to keep focus on the bell button after a notification is removed
  // if this is not here, whenever an action is taken (such as removing a notification), the form will cause the elements to lose focus and the menu will close
  let bellButton: HTMLButtonElement;
  const onDeleted = () => {
    bellButton.focus();
  };
  $: (() => {
    if ($page.form?.form?.data?.notificationId !== undefined) {
      // a notification was removed
      setTimeout(() => {
        // needs to be done next update cycle, otherwise it doesn' work. In practice, is still instant
        onDeleted();
      });
    }
  })();

  const { enhance: deleteEnhance } = superForm(form, {
    onUpdate: onDeleted,
    id: "deleteNotification",
  });

  const { enhance: readEnhance } = superForm(form, {
    id: "readNotifications",
  });
</script>

<div class="dropdown">
  <!-- When user clicks on the bell icon, it will update all notifications as read -->
  <button
    bind:this={bellButton}
    type="button"
    on:click={externalModal || useModalInstead
      ? () => (externalModal ?? internalModal).showModal()
      : undefined}
    tabindex="0"
    class={twMerge("btn btn-ghost *:text-xl", buttonClass)}
    data-dropdown-toggle="dropdown"
  >
    <slot>
      {#await notifications}
        <span class="i-mdi-bell-outline"></span>
      {:then notifications}
        {@const unreadCount = notifications.filter(
          (data) => data.readAt == null,
        ).length}
        {#if unreadCount <= 0}
          <span class="i-mdi-bell-outline"></span>
        {/if}
        {#if unreadCount > 0}
          <span class="i-mdi-bell-ring-outline animate-bounce"></span>
          <span
            class="absolute right-0 top-0 flex h-6 w-6 items-center justify-center rounded-box bg-red-600 text-center !text-sm"
            >{unreadCount}</span
          >
        {/if}
      {/await}
    </slot>
  </button>

  {#if !externalModal && useModalInstead}
    <NotificationModal {postReveal} bind:modal={internalModal} />
  {:else if !externalModal}
    <!-- svelte-ignore a11y-no-noninteractive-tabindex -->
    <ul
      tabindex="0"
      class="menu dropdown-content !fixed right-0 z-[1] max-h-[80svh] w-full flex-nowrap overflow-clip rounded-box bg-base-100 p-0 shadow sm:!absolute sm:w-[27rem]"
    >
      {#await notifications}
        <span class="loading loading-lg"></span>
      {:then notifications}
        {#if notifications.length > 0}
          <div class="overflow-y-auto">
            {#each notifications as notification (notification.id)}
              <li animate:flip={{ duration: 200 }}>
                {#if postReveal}
                  <PostRevealNotification {notification} {form} />
                {:else}
                  <Notification {notification} {form} />
                {/if}
              </li>
            {/each}
          </div>
          <!-- Read all notifications (notifications are read on visit otherwise) -->
          {#if notifications?.filter((n) => n.readAt === null)?.length > 0}
            <form
              method="POST"
              action="/notifications?/readNotifications"
              use:readEnhance
              data-sveltekit-keepfocus
            >
              {#each notifications as notification (notification.id)}
                {#if notification.readAt === null}
                  {#each notification.individualIds as id}
                    <input type="hidden" name="notificationIds" value={id} />
                  {/each}
                {/if}
              {/each}
              <button
                class="btn btn-ghost no-animation z-10 w-full rounded-none border-0 border-t border-gray-700 *:text-2xl"
              >
                {m.navbar_bell_markAllAsRead()}
                <span class="i-mdi-bell-check-outline"></span>
              </button>
            </form>
          {/if}
          <!-- Deletes all notifications -->
          {#if notifications?.flatMap((n) => n.individualIds).length > 0}
            <form
              method="POST"
              action="/notifications?/deleteNotification"
              use:deleteEnhance
              data-sveltekit-keepfocus
            >
              {#each notifications as notification (notification.id)}
                {#each notification.individualIds as id}
                  <input type="hidden" name="notificationIds" value={id} />
                {/each}
              {/each}
              <button
                class="btn btn-ghost no-animation z-10 w-full rounded-none border-0 border-t border-gray-700 *:text-2xl"
              >
                {m.navbar_bell_deleteAll()}
                <span class="i-mdi-delete-outline"></span>
              </button>
            </form>
          {/if}
        {:else}
          <li class="p-4">
            {m.navbar_bell_noNotifications()}
          </li>
        {/if}
      {/await}
    </ul>
  {/if}
</div>
