<script lang="ts">
  import FormInput from "$lib/components/forms/FormInput.svelte";
  import type { TicketSchema } from "$lib/utils/shop/types";
  import { fieldProxy, type SuperForm } from "sveltekit-superforms/client";

  export let superform: SuperForm<TicketSchema>;
  export let index: number;
  export let onRemove: () => void;
  const value = fieldProxy(superform, `accessPolicies[${index}]`);
  let isRole = $value.studentId === null;
</script>

<div class="join flex items-end gap-2">
  {#if isRole}
    <FormInput {superform} field="accessPolicies[{index}].role" label="Roll" />
    <!-- svelte-ignore a11y_consider_explicit_label -->
    <button
      type="button"
      class="btn tooltip"
      data-tip="Byt till person"
      on:click={() => {
        isRole = false;
        $value.role = null;
        $value.studentId = "";
      }}
    >
      <span class="i-mdi-person"></span>
    </button>
  {:else}
    <FormInput
      {superform}
      field="accessPolicies[{index}].studentId"
      label="StiL-ID"
    />
    <!-- svelte-ignore a11y_consider_explicit_label -->
    <button
      type="button"
      class="btn tooltip"
      data-tip="Byt till roll"
      on:click={() => {
        isRole = true;
        $value.studentId = null;
        $value.role = "";
      }}
    >
      <span class="i-mdi-group"></span>
    </button>
  {/if}
  <!-- svelte-ignore a11y_consider_explicit_label -->
  <button type="button" class="btn btn-error" on:click={onRemove}>
    <span class="i-mdi-trash"></span>
  </button>
</div>
