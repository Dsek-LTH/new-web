<script lang="ts">
  import { invalidate } from "$app/navigation";
  import { page } from "$app/stores";
  import LiveTimeSince from "$lib/components/LiveTimeSince.svelte";
  import AuthorAvatars from "$lib/components/socials/AuthorAvatars.svelte";
  import { i18n } from "$lib/utils/i18n";
  import type { NotificationGroup } from "$lib/utils/notifications/group";
  import type { NotificationSchema } from "$lib/zod/schemas";
  import type { SuperValidated } from "sveltekit-superforms";
  import { superForm } from "$lib/utils/client/superForms";
  import { browser } from "$app/environment";
  type NotificationItem = Pick<
    NotificationGroup,
    | "link"
    | "title"
    | "message"
    | "createdAt"
    | "id"
    | "individualIds"
    | "readAt"
    | "authors"
  >;

  export let notification: NotificationItem;
  export let form: SuperValidated<NotificationSchema> | undefined = undefined;
  export let allowDelete = true;
  export let onClick: (() => void) | undefined = undefined;

  let readForm: HTMLFormElement;
  const readNotification = () => {
    // read notification
    readForm?.requestSubmit();
    if (browser) invalidate("/api/notifications/my");
  };

  // Handle "reading" notification when visiting relevant link
  $: isUnread = notification.readAt === null;
  $: isPathSame = i18n.route($page.url.pathname) === notification.link;
  $: (() => {
    if (isUnread && isPathSame) {
      setTimeout(() => {
        readNotification();
      });
    }
  })();

  // can be used for reading as well, same types
  $: superformDelete =
    form && allowDelete
      ? superForm(form, {
          id: notification.id.toString() + "-delete",
        })
      : undefined;
  $: enhanceDelete = superformDelete?.enhance;
  $: superformRead = form
    ? superForm(form, {
        id: notification.id.toString() + "-read",
      })
    : undefined;
  $: enhanceRead = superformRead?.enhance;

  $: authors = notification.authors.filter(Boolean) as Array<
    NonNullable<NotificationItem["authors"][number]>
  >;
</script>

<div class="relative flex w-full items-stretch rounded-none p-2">
  {#if superformRead && enhanceRead}
    <form
      bind:this={readForm}
      method="POST"
      action="/notifications?/readNotifications"
      use:enhanceRead
      class="hidden"
      aria-hidden="true"
    >
      {#if notification.individualIds.length > 1}
        {#each notification.individualIds as id}
          <input type="hidden" name="notificationIds" value={id} />
        {/each}
      {:else}
        <input type="hidden" name="notificationId" value={notification.id} />
      {/if}
    </form>
  {/if}

  <a
    href={notification.link}
    on:click={onClick}
    class="flex max-w-full flex-1 items-center gap-4 overflow-hidden"
  >
    <div>
      <AuthorAvatars {authors} />
    </div>
    <div
      class="flex h-full flex-1 flex-col flex-nowrap items-stretch justify-center {isUnread
        ? 'font-medium'
        : 'opacity-80'}"
    >
      <span class="mt-1 line-clamp-1 text-base">{notification.title}</span>
      <span class="mb-1 line-clamp-2 text-ellipsis break-words text-xs"
        >{notification.message}</span
      >
      <span class="line-clamp-1 text-xs text-gray-500">
        <LiveTimeSince timeStamp={notification.createdAt.getTime()} />
      </span>
    </div>
  </a>
  {#if superformDelete && enhanceDelete}
    <!-- Deletes this notification -->
    <form
      class="flex items-stretch"
      method="POST"
      action="/notifications?/deleteNotification"
      use:enhanceDelete
    >
      {#if notification.individualIds.length > 1}
        {#each notification.individualIds as id}
          <input type="hidden" name="notificationIds" value={id} />
        {/each}
      {:else}
        <input type="hidden" name="notificationId" value={notification.id} />
      {/if}
      <!-- svelte-ignore a11y_consider_explicit_label -->
      <button class="btn btn-ghost -mr-2 rounded-none !px-2 *:text-2xl">
        <span class="i-mdi-delete-outline mx-0 opacity-50"></span>
      </button>
    </form>
  {/if}
</div>
