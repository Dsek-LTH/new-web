<script lang="ts">
  import { page } from "$app/stores";
  import MarkdownBody from "$lib/components/MarkdownBody.svelte";
  import type { TicketWithMoreInfo } from "$lib/server/shop/getTickets";
  import apiNames from "$lib/utils/apiNames";
  import { isAuthorized } from "$lib/utils/authorization";
  import type { Event, Tag } from "@prisma/client";
  import dayjs from "dayjs";
  // import EventTicket from "./EventTicket.svelte";
  import TagChip from "$lib/components/TagChip.svelte";
  import { NOLLNING_TAG_PREFIX } from "$lib/components/postReveal/types";
  import * as m from "$paraglide/messages";

  export let event: Event & {
    tags: Tag[];
  } & {
    tickets: TicketWithMoreInfo[];
  };
</script>

<div
  class="collapse collapse-arrow rounded-btn border-2 border-base-200 bg-base-200 bg-transparent has-[input[type='radio']:checked]:border-base-content"
>
  <input type="radio" name="nolla-event-list" />
  <div class="collapse-title flex flex-col">
    <!-- Format date as Weekday HH:mm such as Monday 17.15 -->
    <span class="text-sm font-medium capitalize text-primary"
      >{dayjs(event.startDatetime).format("dddd HH:mm")} - {dayjs(
        event.endDatetime,
      ).format("HH:mm")}</span
    >
    <span class="text-base">{event.title}</span>
    {#if event.location}
      <span class="text-sm font-medium text-neutral">{event.location}</span>
    {/if}
    <div class="mt-4 flex gap-2">
      {#each event.tags as tag}
        {#if !tag.name.startsWith(NOLLNING_TAG_PREFIX)}
          <TagChip {tag} />
        {/if}
      {/each}
    </div>
  </div>
  <div class="collapse-content flex flex-col">
    {#if event.shortDescription}
      <span class="text-xl font-medium text-neutral"
        >{event.shortDescription}</span
      >
    {/if}
    <p>
      <MarkdownBody body={event.description} class="leading-tight" />
    </p>
    <!-- <div class="mt-4 flex flex-col flex-wrap gap-4">
      {#if isAuthorized(apiNames.WEBSHOP.PURCHASE, $page.data.user)}
        {#each event.tickets as ticket, index (ticket.id)}
          <EventTicket {ticket} {index} />
        {/each}
      {/if}
    </div> -->
    {#if event.link}
      <a href={event.link} class="btn btn-primary mt-4 self-start">
        {m.nollning_events_ticketCTA()}
      </a>
    {/if}
    {#if isAuthorized(apiNames.EVENT.UPDATE, $page.data.user)}
      <!-- svelte-ignore a11y_consider_explicit_label -->
      <a href="/events/{event.slug}" class="btn btn-secondary mt-8 self-start">
        <span class="i-mdi-edit"></span>
      </a>
    {/if}
  </div>
</div>
