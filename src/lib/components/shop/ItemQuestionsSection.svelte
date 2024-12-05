<script lang="ts">
  import ItemQuestion from "$lib/components/shop/ItemQuestion.svelte";
  import { QuestionType } from "$lib/utils/shop/types";
  import type { TicketSchema } from "$lib/utils/shop/types";
  import { arrayProxy, type SuperForm } from "sveltekit-superforms/client";

  export let superform: SuperForm<TicketSchema>;
  const { values, errors } = arrayProxy(superform, "questions");
</script>

<section class="space-y-2">
  <h3 class="text-lg font-semibold">Frågor</h3>
  <!-- eslint-disable-next-line @typescript-eslint/no-unused-vars -- We only need index -->
  {#each $values as _, index}
    <ItemQuestion
      {superform}
      field="questions[{index}]"
      onRemove={() => {
        $values = $values.filter((_, i) => i !== index);
      }}
    />
  {/each}
  <button
    class="btn btn-outline btn-primary"
    type="button"
    on:click={() => {
      $values = [
        ...$values,
        {
          type: QuestionType.Text,
          title: "",
          description: "",
          forExternalsOnly: false,
        },
      ];
    }}
  >
    <span class="i-mdi-plus"></span> Lägg till fråga
  </button>

  {#if $errors}
    {#each $errors as error}
      <div class="label">
        <span class="label-text-alt text-error">
          {error}
        </span>
      </div>
    {/each}
  {/if}
</section>
