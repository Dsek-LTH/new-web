<script lang="ts">
  // import { browser } from "$app/environment";
  // import { invalidateAll } from "$app/navigation";
  import { page } from "$app/stores";
  import SetPageTitle from "$lib/components/nav/SetPageTitle.svelte";
  // import ScrollingNumber from "$lib/components/Timer/ScrollingNumber.svelte";
  // import Timer from "$lib/components/Timer/Timer.svelte";
  // import { now } from "$lib/stores/date";
  import { toast } from "$lib/stores/toast";
  import * as m from "$paraglide/messages";
  import Event from "./Event.svelte";
  import PostRevealSelect from "./PostRevealSelect.svelte";

  export let data;
  $: events = data.events;
  let weekCollapseOpen = false;
  $: weeks = Array(data.weeks)
    .fill(0)
    .map((_, i) => i);
  $: eventsSubscribeUrl = `${$page.url.origin}${$page.url.pathname}/subscribe`;

  // $: userTickets = events
  //   .flatMap((events) => events.tickets)
  //   .filter((ticket) => ticket.isInUsersCart);
  // $: itemsToPay = userTickets.flatMap((ticket) => ticket.userItemsInCart);
  // function firstTimer(timers: Array<Date | null>): [Date | null, number] {
  //   let first = timers[0];
  //   let index = 0;
  //   for (let [i, timer] of timers.entries()) {
  //     if (!first || (timer && timer < first)) {
  //       first = timer;
  //       index = i;
  //     }
  //   }
  //   return [first ?? null, index];
  // }

  // $: inQueue = userTickets
  //   .filter(
  //     (ticket) => ticket.gracePeriodEndsAt.valueOf() + 1000 < $now.valueOf(),
  //   )
  //   .flatMap((ticket) => ticket.userReservations);
  // $: inLottery = userTickets.filter(
  //   (ticket) =>
  //     /* Some extra padding */
  //     ticket.gracePeriodEndsAt.valueOf() + 1000 >= $now.valueOf(),
  // );

  // $: if (
  //   (browser && inLottery.some((ticket) => ticket.gracePeriodEndsAt >= $now)) ||
  //   inQueue.some((t) => t.order === null)
  // ) {
  //   setTimeout(() => {
  //     invalidateAll();
  //   }, 500);
  // }
</script>

<div class="mx-auto max-w-4xl">
  <SetPageTitle title={m.events()} />

  <div class="mb-4 flex items-start justify-between">
    <details
      class="dropdown"
      on:toggle={(event) => {
        if (event.target instanceof HTMLDetailsElement && event.target.open) {
          navigator.clipboard.writeText(eventsSubscribeUrl);
          toast(m.events_calendar_subscribe_copyToClipboard(), "success");
        }
      }}
    >
      <summary class="btn btn-lg !h-10"
        >{m.events_calendar_subscribe()}
        <span class="i-mdi-calendar-sync"></span>
      </summary>
      <div
        class="dropdown-content z-20 -ml-8 w-[calc(100dvw-1rem)] rounded-box bg-base-300 p-4 shadow md:max-w-2xl"
      >
        <p>
          {m.events_calendar_subscribe_details()}
        </p>
        <p
          class="my-2 w-full select-all overflow-x-auto rounded border p-2 font-mono text-sm"
        >
          {eventsSubscribeUrl}
        </p>
      </div>
    </details>
    <PostRevealSelect
      title="{m.events_calendar_week().toLowerCase()} {data.week}"
      bind:checked={weekCollapseOpen}
    >
      <ul class="flex flex-col">
        {#each weeks as i}
          {@const isCurrent = i === data.week}
          <li class:bg-primary={isCurrent} class="px-2 py-1 last:pb-2">
            <a
              class="font-medium"
              href="?week={i}"
              on:click={() => (weekCollapseOpen = false)}
              >{m.events_calendar_week().toLowerCase()} {i}</a
            >
          </li>
        {/each}
      </ul>
    </PostRevealSelect>
  </div>
  <div class="flex flex-col gap-4">
    {#if events.length > 0}
      {#each events as event (event.id)}
        <Event {event} />
      {/each}
    {:else}
      <span class="mt-8 text-center text-4xl">🤫</span>
    {/if}
  </div>
</div>

<!-- <div class="sticky inset-x-0 bottom-0 mt-8 flex flex-col">
  {#if itemsToPay.length > 0}
    {@const [firstToExpire, index] = firstTimer(
      itemsToPay.map((item) => item.expiresAt),
    )}
    {@const isFree =
      (userTickets.find((ticket) =>
        ticket.userItemsInCart.some((i) => i.id == itemsToPay[index]?.id),
      )?.price ?? 1) <= 0}
    <div class="self-end">
      {#if firstToExpire}
        <Timer
          class="text-error"
          milliseconds={firstToExpire.valueOf() - $now.valueOf()}
        />
      {/if}
    </div>
    <div class="flex rounded-btn bg-neutral p-2">
      <span class="flex-1">
        {m.tickets_feedback_lotteryWin()}<br />{isFree
          ? m.tickets_feedback_proceed()
          : m.tickets_feedback_proceedToPay()}
      </span>
      <a href="shop/cart" class="btn btn-error"
        >{isFree ? m.cart_get() : m.cart_pay()}
        <span class="i-mdi-arrow-right" /></a
      >
    </div>
  {:else if inQueue.length > 0}
    {@const position =
      (inQueue.reduce(
        (acc, next) =>
          acc < 0 || (next.order !== null && next.order < acc)
            ? (next.order ?? acc)
            : acc,
        -100,
      ) ?? -100) + 1}
    <div class="flex rounded-btn bg-neutral p-2">
      <span class="flex-1">
        {#if position >= 0}
          <span>
            {m.cart_reservation_queuePosition()}
            <ScrollingNumber number={position} />
          </span>
        {:else}
          {m.tickets_buyButton_inQueue()}
        {/if}
      </span>
      <a href="shop/cart" class="btn btn-primary"
        >{m.view()} <span class="i-mdi-arrow-right" /></a
      >
    </div>
  {:else if inLottery.length > 0}
    {@const [firstLottery] = firstTimer(
      inLottery.map((ticket) => ticket.gracePeriodEndsAt),
    )}
    <div class="flex items-center rounded-btn bg-neutral p-2">
      <span class="flex-1 text-lg">
        {m.cart_reservation_awaitingLottery()}
      </span>

      {#if firstLottery}
        <Timer
          class="text-lg"
          milliseconds={firstLottery.valueOf() - $now.valueOf()}
        />
      {/if}
    </div>
  {/if}
</div> -->
