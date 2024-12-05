<script lang="ts">
  import { enhance } from "$app/forms";
  import Price from "$lib/components/Price.svelte";
  import ScrollingNumber from "$lib/components/Timer/ScrollingNumber.svelte";
  import Timer from "$lib/components/Timer/Timer.svelte";
  import type { CartReservation } from "$lib/utils/shop/types";
  import { now } from "$lib/stores/date";
  import * as m from "$paraglide/messages";
  import { invalidateAll } from "$app/navigation";
  import { getFileUrl } from "$lib/files/client";

  export let item: CartReservation;
  $: shoppable = item.shoppable;
  $: event = shoppable.event;

  $: lotteryAt = item.order !== null ? null : shoppable.gracePeriodEndsAt;

  $: if (lotteryAt && $now > lotteryAt) {
    invalidateAll();
  }
</script>

<li class="flex flex-wrap items-center gap-x-4">
  <div class="flex items-center gap-3">
    <div class="avatar">
      <div class="mask mask-squircle h-12 w-12">
        <img
          src={getFileUrl(event.imageUrl) ??
            "https://minio.api.dsek.se/news/public/8c97c4c6-d4f4-44f5-9658-cff70110ad85.webp"}
          alt="{event.title} event photo"
        />
      </div>
    </div>
    <div>
      <div class="font-bold">{shoppable.title}</div>
      <div class="text-sm opacity-50">
        {event.title}
      </div>
      <slot />
    </div>
  </div>

  <Price price={shoppable.price} class="text-lg" />

  <div class="text-2xl font-bold text-primary">
    {#if item.order !== null}
      {m.cart_reservation_queuePosition()}
      <ScrollingNumber number={item.order + 1} />
    {:else}
      {m.cart_reservation_awaitingLottery()}
      <Timer
        milliseconds={shoppable.gracePeriodEndsAt.valueOf() - $now.valueOf()}
      />
    {/if}
  </div>
  <form method="POST" action="?/removeReservation" use:enhance>
    <input type="hidden" name="id" value={item.id} />
    <!-- svelte-ignore a11y_consider_explicit_label -->
    <button type="submit" class="btn btn-ghost">
      <span class="i-mdi-trash-can text-xl"></span>
    </button>
  </form>
</li>
