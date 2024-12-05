<!--
  @component

  This component shows a confirmation dialog with a `title`, `description`,
  and two buttons. For a basic HTML dialog form, you can use the `formTarget`
  and `formData` props to submit a form with a confirm button.
  
  If you need to customize the dialog, you can use the slots to
  provide a custom `title`, `description`, and `action` buttons.

  @slot `title`
    The title of the dialog. Defaults to `h1`
  
  @slot `description`
    The description of the dialog. Defaults to `p`
  
  @slot `action`
    The action buttons of the dialog. Defaults to two buttons:
    - A cancel button that closes the dialog
    - A confirm button in a form that submits the form and closes the dialog

-->
<script lang="ts">
  import { enhance } from "$app/forms";
  import * as m from "$paraglide/messages";
  import { twMerge } from "tailwind-merge";

  /** The title of the dialog displayed at the top. */
  export let title = "Are you sure?";

  /** The description of the dialog displayed below the title. */
  export let description = "";

  /** The text of the confirm button. */
  export let confirmText = m.ok();

  /** The text of the cancel button. */
  export let cancelText = m.cancel();

  /** The target URL for the confirm button. */
  export let formTarget: string | undefined = undefined;

  /** The form data to submit with the confirm button. */
  export let formData: Record<string, string> = {};

  /** Not recommended. Prefer using `formTarget` and `formData`. */
  export let onClose: (() => void) | undefined = undefined;

  /** Not recommended. Prefer using `formTarget` and `formData`. */
  export let onConfirm: (() => void) | undefined = undefined;

  /** Classes to apply to the confirm button. */
  export let confirmClass: string | undefined = undefined;

  /** The dialog element. */
  export let modal: HTMLDialogElement;
</script>

<dialog bind:this={modal} class="modal modal-bottom sm:modal-middle">
  <div class="modal-box">
    <slot name="title">
      <h1 class="mb-4 text-lg font-bold">{title}</h1>
    </slot>

    <slot name="description">
      <p>{description}</p>
    </slot>

    <div class="modal-action">
      <slot name="action">
        <button
          class="btn"
          on:click={() => {
            modal?.close();
            onClose?.();
          }}
        >
          {cancelText}
        </button>
        <form method="POST" action={formTarget} use:enhance>
          {#each Object.entries(formData) as [name, value]}
            <input type="hidden" {name} {value} />
          {/each}
          <button
            type="submit"
            class={twMerge("btn btn-primary", confirmClass)}
            on:click={() => {
              modal?.close();
              onConfirm?.();
            }}
          >
            {confirmText}
          </button>
        </form>
      </slot>
    </div>
  </div>

  <!-- svelte-ignore a11y_consider_explicit_label -->
  <form method="dialog" class="modal-backdrop">
    <button class="cursor-auto"></button>
  </form>
</dialog>
