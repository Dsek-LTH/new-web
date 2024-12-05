<script lang="ts">
  import { enhance } from "$app/forms";

  export let itemId: string;
</script>

<form method="POST" action="?/removeItem" use:enhance>
  <input type="hidden" name="id" value={itemId} />
  <!-- svelte-ignore a11y_consider_explicit_label -->
  <button type="submit" class="btn btn-ghost">
    <span class="i-mdi-trash-can text-xl"></span>
  </button>
</form>
