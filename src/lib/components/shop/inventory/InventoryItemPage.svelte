<script lang="ts">
  import { getFullName } from "$lib/utils/client/member";
  import * as m from "$paraglide/messages";
  import dayjs from "dayjs";
  import QRCode from "../../QRCode.svelte";
  import SetPageTitle from "$lib/components/nav/SetPageTitle.svelte";
  import { eventLink } from "$lib/utils/redirect";
  import Price from "$lib/components/Price.svelte";
  import type { InventoryItemLoadData } from "$lib/server/shop/inventory/getInventory";
  import type { page } from "$app/stores";
  import { getFileUrl } from "$lib/files/client";

  export let data: InventoryItemLoadData & typeof $page.data;
  $: consumable = data.consumable;
  $: shoppable = consumable.shoppable;
  $: event = shoppable.event;
</script>

<SetPageTitle title={shoppable.title} />

<div class="mx-auto md:container md:mt-8 md:grid md:grid-cols-2">
  <img
    src={getFileUrl(event.imageUrl) ??
      "https://minio.api.dsek.se/news/public/8c97c4c6-d4f4-44f5-9658-cff70110ad85.webp"}
    alt="{event.title} cover photo"
    class="aspect-video object-cover md:rounded-xl"
  />

  <main class="m-4 flex flex-col gap-4">
    <div>
      <h1 class="text-xl font-bold">{shoppable.title}</h1>
      <h2>
        {m.inventory_ownedBy()}
        {data.member ? getFullName(data.member) : m.inventory_anonymousUser()}
      </h2>
      <h3 class="text-sm">
        {m.inventory_boughtAt()}
        {dayjs(consumable.purchasedAt).fromNow()}
        <span class="block opacity-50 md:inline"
          >({dayjs(consumable.purchasedAt).format("YYYY-MM-DD HH:MM")})</span
        >
      </h3>
    </div>
    <div
      class="-mt-2 flex flex-wrap items-center gap-2 text-sm text-base-content/60 *:flex *:items-center *:gap-1"
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

    {#if shoppable.description}
      <p>{shoppable.description}</p>
    {/if}

    {#if consumable.questionResponses.length > 0}
      <section
        class="space-y-2 self-start rounded-box bg-base-200 p-4 shadow-lg"
      >
        <h3 class="text-lg font-semibold">Svar</h3>
        <ul>
          {#each consumable.questionResponses as response (response.id)}
            <li>
              <b>{response.question.title}</b>
              <span
                >{response.answer}
                {#if response.extraPrice}(<Price price={response.extraPrice} />)
                {/if}</span
              >
            </li>
          {/each}
        </ul>
      </section>
    {/if}

    <QRCode data={shoppable.title} />
  </main>
</div>
