<script lang="ts">
  import { enhance } from "$app/forms";
  import LoadingButton from "$lib/components/LoadingButton.svelte";

  export let groupId: string;
  let isLoading = false;
</script>

<form
  method="POST"
  action="?/delete"
  use:enhance={({ cancel }) => {
    if (!confirm("Är du säker på att du vill ta bort gruppen?")) {
      cancel();
    }
    let timeout = setTimeout(() => {
      isLoading = true;
    }, 500);
    return ({ update }) => {
      update();
      clearTimeout(timeout);
      isLoading = false;
    };
  }}
>
  <input type="hidden" name="id" value={groupId} />
  <LoadingButton
    type="submit"
    class="btn btn-square btn-error btn-sm"
    {isLoading}
  >
    <span class="i-mdi-trash"></span>
  </LoadingButton>
</form>
