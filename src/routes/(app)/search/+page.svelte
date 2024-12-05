<script lang="ts">
  import type { ActionData } from "./$types";
  export let form: ActionData;
</script>

<form method="POST" class="mx-auto mt-8 max-w-md">
  <label class="input input-bordered mb-2 flex w-full items-center gap-2">
    <span class="i-mdi-magnify size-6"></span>
    <!-- svelte-ignore a11y-autofocus -->
    <input
      autofocus
      type="text"
      name="input"
      placeholder="Sök efter medlemmar"
      class="bg-transparent"
    />
  </label>
  <button class="btn mb-2 w-full">Sök</button>
  {#if form !== null}
    {#if form.users.length > 0}
      <ul class="mb-2 flex flex-col gap-1">
        {#each form.users as user}
          <li>
            <a
              href={"/members/" + user.studentId}
              class="btn flex justify-between"
            >
              <div>{user.firstName} {user.lastName}</div>
              <div class="text-primary">({user.studentId})</div>
            </a>
          </li>
        {/each}
      </ul>
    {:else}
      <div class="text-center">Inga resultat</div>
    {/if}
  {/if}
</form>
