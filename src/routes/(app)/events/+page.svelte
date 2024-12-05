<script lang="ts">
  import { page } from "$app/stores";
  import apiNames from "$lib/utils/apiNames";
  import { isAuthorized } from "$lib/utils/authorization";
  import EventPage from "./EventPage.svelte";
  import * as m from "$paraglide/messages";
  import { toast } from "$lib/stores/toast";

  export let data;
  $: eventsSubscribeUrl = `${$page.url.origin}${$page.url.pathname}/subscribe`;
</script>

<EventPage {data}>
  <div
    class="scrollbar-hide -mx-4 flex items-center gap-2 overflow-x-auto px-4"
  >
    {#if isAuthorized(apiNames.EVENT.CREATE, data.user)}
      <a class="btn" href="/events/create">
        <span class="i-mdi-create"></span>{m.events_create()}
      </a>
    {/if}
    <a class="btn" href="/events/calendar">
      <span class="i-mdi-calendar"></span>{m.events_calendar()}
    </a>

    <details
      class="dropdown"
      on:toggle={(event) => {
        if (event.target instanceof HTMLDetailsElement && event.target.open) {
          navigator.clipboard.writeText(eventsSubscribeUrl);
          toast(m.events_calendar_subscribe_copyToClipboard(), "success");
        }
      }}
    >
      <summary class="btn flex-nowrap">
        <span class="i-mdi-calendar-sync"></span>{m.events_calendar_subscribe()}
      </summary>
      <div class="dropdown-content z-[1] rounded-box bg-base-300 p-4 shadow">
        <p>
          {m.events_calendar_subscribe_details()}
        </p>
        <p class="my-2 rounded border p-2 font-mono text-sm">
          {eventsSubscribeUrl}
        </p>
      </div>
    </details>
    {#if isAuthorized(apiNames.TAGS.CREATE, data.user) || isAuthorized(apiNames.TAGS.UPDATE, data.user)}
      <a class="btn" href="/news/tags">
        <span class="i-mdi-tag"></span>{m.events_tags()}
      </a>
    {/if}
    {#if isAuthorized(apiNames.TAGS.UPDATE, data.user)}
      <a class="btn" href="/events/all-events">
        <span class="i-mdi-administrator"></span>Alla events
      </a>
    {/if}
  </div>
</EventPage>
