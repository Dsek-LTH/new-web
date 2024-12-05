<script lang="ts" module>
  export interface LabeledAttributes {
    class?: ClassNameValue;
    label?: string | null;
    explanation?: string | null;
    error?: string | string[] | undefined;
    fullWidth?: boolean;
    invisibleText?: boolean;
    required?: boolean;
  }
</script>

<script lang="ts">
  import { twMerge, type ClassNameValue } from "tailwind-merge";

  let {
    class: clazz = "",
    label = null,
    explanation = null,
    error = undefined,
    fullWidth = false,
    invisibleText = false,
    required = false,
    for: _for = undefined,
  }: {
    for?: string | undefined;
  } & LabeledAttributes = $props();
</script>

<label
  class={twMerge(
    "form-control relative",
    fullWidth ? "w-full md:w-auto " : "",
    clazz,
  )}
  for={_for}
>
  {#if label}
    <div class="label">
      <span class="label-text" class:invisible={invisibleText}>
        {label}{#if required}
          <span class="font-bold">*</span>
        {/if}
        {#if explanation}
          <span
            class="badge badge-neutral tooltip aspect-square px-1"
            data-tip={explanation}
          >
            ?
          </span>
        {/if}
      </span>
    </div>
  {/if}
  <slot {label} />
  {#if error !== undefined}
    <div class="label">
      <span
        class="form-error label-text-alt text-error"
        class:invisible={invisibleText}
      >
        {#if typeof error === "string"}{error}{:else}{error.join(", ")}{/if}
      </span>
    </div>
  {/if}
</label>
