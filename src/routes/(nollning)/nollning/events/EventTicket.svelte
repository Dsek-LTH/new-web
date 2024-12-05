<script lang="ts">
  import { enhance } from "$app/forms";
  import BuyButton from "$lib/components/BuyButton.svelte";
  import Price from "$lib/components/Price.svelte";
  import type { TicketWithMoreInfo } from "$lib/server/shop/getTickets";

  export let ticket: TicketWithMoreInfo;
  export let index: number;
  let isSubmitting = false;
</script>

<form
  method="POST"
  action="?/addToCart"
  class="tooltip -m-2 -mx-4 flex flex-nowrap items-center justify-between gap-1 p-2 px-4"
  class:bg-base-200={index % 2 === 0}
  data-tip={ticket.description ?? ""}
  use:enhance={() => {
    isSubmitting = true;
    return ({ update }) => {
      update();
      isSubmitting = false;
    };
  }}
>
  <input type="hidden" name="ticketId" value={ticket.id} />
  <div class="relative text-left">
    <span class="mr-2">
      {ticket.title}
    </span>
    {#if ticket.description}
      <div
        class="i-mdi-question-mark-circle absolute top-1/2 -translate-y-1/2 text-lg"
      ></div>
    {/if}
  </div>
  <div class="flex items-center gap-2">
    <Price price={ticket.price} />
    <BuyButton class="text-right" {isSubmitting} {ticket} />
  </div>
</form>
