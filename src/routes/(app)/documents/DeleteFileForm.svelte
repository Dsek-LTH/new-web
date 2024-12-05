<script lang="ts">
  import type { SuperValidated } from "sveltekit-superforms";
  import { superForm } from "$lib/utils/client/superForms";
  import * as m from "$paraglide/messages";
  import type { DeleteSchema } from "./+page.server";

  export let data: SuperValidated<DeleteSchema>;
  export let fileId: string;
  export let fileName: string;
  let deleteModal: HTMLDialogElement | undefined = undefined;
  const { enhance } = superForm(data, {
    id: fileId,
  });
</script>

<!-- svelte-ignore a11y_consider_explicit_label -->
<button
  on:click={() => {
    deleteModal?.showModal();
  }}
  class="pointer-events-auto"
  ><span class="i-mdi-delete-outline align-middle text-xl text-error"></span>
</button>
<dialog bind:this={deleteModal} class="modal modal-bottom sm:modal-middle">
  <div class="modal-box">
    <h3 class="text-lg font-bold">{m.documents_deleteFile()}</h3>
    <p class="py-4">
      <!-- eslint-disable-next-line svelte/no-at-html-tags -->
      {@html m.documents_deleteAreYouSure({ fileName })}
    </p>
    <div class="modal-action">
      <form method="POST" action="?/deleteFile" use:enhance>
        <input type="hidden" name="id" value={fileId} /><button
          type="submit"
          class="btn btn-error"
          on:click={() => deleteModal?.close()}>{m.documents_delete()}</button
        >
      </form>
    </div>
  </div>
  <form method="dialog" class="modal-backdrop">
    <!-- svelte-ignore a11y_consider_explicit_label -->
    <button></button>
  </form>
</dialog>
