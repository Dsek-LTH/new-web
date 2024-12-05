<script lang="ts">
  import { enhance } from "$app/forms";
  import dayjs from "dayjs";
  import BuyButton from "$lib/components/BuyButton.svelte";
  import Price from "$lib/components/Price.svelte";
  import { isAuthorized } from "$lib/utils/authorization";
  import apiNames from "$lib/utils/apiNames";
  import FoodPreferenceModal from "$lib/components/FoodPreferenceModal.svelte";
  import * as m from "$paraglide/messages";
  import SetPageTitle from "$lib/components/nav/SetPageTitle.svelte";
  import { eventLink } from "$lib/utils/redirect";
  import { getFileUrl } from "$lib/files/client";

  export let data;
  $: ticket = data.ticket;
  $: event = ticket.event;

  let isSubmitting = false;
</script>

<SetPageTitle title={ticket.title} />

<FoodPreferenceModal />

<div class="mx-auto md:container md:mt-8 md:grid md:grid-cols-2">
  <img
    src={getFileUrl(event.imageUrl) ??
      "https://minio.api.dsek.se/news/public/8c97c4c6-d4f4-44f5-9658-cff70110ad85.webp"}
    alt="{event.title} cover photo"
    class="aspect-video object-cover md:rounded-xl"
  />

  <main class="m-4 flex flex-col gap-4">
    <h1 class="text-xl font-bold">
      {ticket.title}
      <Price price={ticket.price} class="ml-4" />
    </h1>
    <div
      class="flex flex-wrap items-center gap-2 text-sm text-base-content/60 *:flex *:items-center *:gap-1"
    >
      <p>
        <span class="i-mdi-calendar"></span>
        <a href={eventLink(event)} class="link-hover">
          {event.title}
        </a>
      </p>

      <p>
        <span class="i-mdi-clock"></span>{dayjs(event.startDatetime).format(
          "dddd Do MMM",
        )}
      </p>

      {#if event.location}
        <p>
          <span class="i-mdi-map-marker"></span>
          <a
            href="https://maps.google.com/?q={event.location}"
            target="_blank"
            rel="noreferrer noopener"
            class="link-hover"
          >
            {event.location}
          </a>
        </p>
      {/if}
    </div>

    {#if ticket.description}
      <p>{ticket.description}</p>
    {/if}

    {#if ticket.authorId == data.member?.id || isAuthorized(apiNames.WEBSHOP.MANAGE, data.user)}
      <div class="flex gap-2 [&>*]:flex-1">
        <a href="{ticket.id}/manage" class="btn btn-primary"
          >{m.tickets_ticketPage_showAdmin()}</a
        >
        <a href="{ticket.id}/edit" class="btn btn-secondary"
          >{m.tickets_ticketPage_edit()}</a
        >
      </div>
    {/if}

    <form
      class="mt-8"
      method="POST"
      action="/shop/tickets?/addToCart"
      use:enhance={() => {
        isSubmitting = true;
        return ({ update }) => {
          update();
          isSubmitting = false;
        };
      }}
    >
      <input type="hidden" name="ticketId" value={ticket.id} />
      <BuyButton {ticket} {isSubmitting} />
    </form>
  </main>
</div>
