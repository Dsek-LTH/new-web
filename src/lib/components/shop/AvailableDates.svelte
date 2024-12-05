<script lang="ts">
  import DateInput from "$lib/components/DateInput.svelte";
  import Labeled from "$lib/components/Labeled.svelte";
  import type { TicketSchema } from "$lib/utils/shop/types";
  import { formFieldProxy, type SuperForm } from "sveltekit-superforms/client";

  export let superform: SuperForm<TicketSchema>;
  const {
    value: availableFrom,
    errors: availableFromErrors,
    constraints: availableFromConstraints,
  } = formFieldProxy(superform, "availableFrom");
  const {
    value: availableTo,
    errors: availableToErrors,
    constraints: availableToConstraints,
  } = formFieldProxy(superform, "availableTo");
</script>

<div
  class="flex flex-col justify-between gap-4 md:flex-row md:items-end [&>*]:flex-1"
>
  <Labeled label="Tillgång från" error={$availableFromErrors}>
    <DateInput
      bind:date={$availableFrom}
      name="availableFrom"
      {...$availableFromConstraints}
    />
  </Labeled>

  {#if $availableTo != undefined}
    <Labeled label="Tillgänglig till" error={$availableToErrors}>
      <DateInput
        bind:date={$availableTo}
        name="availableTo"
        {...$availableToConstraints}
      />
    </Labeled>
    <button
      type="button"
      class="btn"
      on:click={() => ($availableTo = undefined)}
    >
      Ta bort sluttid
    </button>
  {:else}
    <button
      type="button"
      class="btn"
      on:click={() => ($availableTo = $availableFrom)}
    >
      <span class="i-mdi-plus text-xl"></span>
      Lägg till sluttid
    </button>
  {/if}
</div>
