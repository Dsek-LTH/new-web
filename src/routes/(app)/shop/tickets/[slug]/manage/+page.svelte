<script lang="ts">
  import SetPageTitle from "$lib/components/nav/SetPageTitle.svelte";
  import ConsumablesTable from "./ConsumablesTable.svelte";

  export let data;
  $: ticket = data.ticket;
  /* Don't know how to show these yet or if we even want that
  $: inCart = data.inCart;
  $: reservations = data.reservations;
  */
</script>

<SetPageTitle title={ticket.title} />

<div class="flex justify-between">
  <h1 class="text-2xl">{ticket.title}</h1>

  <a href="edit" class="btn btn-secondary">Redigera biljett</a>
</div>
{#if ticket.description}
  <p class="text-lg">{ticket.description}</p>
{/if}

{#if ticket.questions.length > 0}
  <div class="rounded-box bg-base-200 p-4">
    <h3 class="text-lg font-semibold">Frågor</h3>
    <ul class="ml-4 list-decimal">
      {#each ticket.questions as question}
        <li class="mt-4">
          <h2 class="text-lg font-medium">
            {question.title}
            {#if question.removedAt !== null}<span class="opacity-50"
                >(borttagen)</span
              >{/if}
          </h2>
          <p>{question.description}</p>
        </li>
      {/each}
    </ul>
  </div>
{/if}

<p>
  {data.purchasedConsumables.length} köpta <br />
  {#if data.consumablesInCart.length > 0}
    {#if data.consumablesInCart.length > 1}
      {data.consumablesInCart.length} i kundvagner<br />
    {:else}
      1 i kundvagn<br />
    {/if}
  {/if}
  {#if data.reservations.length > 0}
    {#if data.reservations.length > 1}
      {data.reservations.length} reservationer<br />
    {:else}
      1 reservation<br />
    {/if}
  {/if}
</p>
<a href="manage/download-csv" class="btn btn-primary btn-sm mt-2"
  ><span class="i-mdi-download"></span> Ladda ner CSV</a
>

<ConsumablesTable
  questions={ticket.questions}
  consumables={data.purchasedConsumables}
  title="Köpta biljetter"
/>

{#if data.consumablesInCart.length > 0}
  <ConsumablesTable consumables={data.consumablesInCart} title="I kundvagn" />
{/if}

{#if data.reservations.length > 0}
  <ConsumablesTable consumables={data.reservations} title="Reservationer" />
{/if}
