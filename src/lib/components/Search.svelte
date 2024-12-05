<script lang="ts">
  import type { Member } from "@prisma/client";

  let value = "";
  let users: Member[] = [];
  let dialog: HTMLDialogElement;

  async function getMembers() {
    if (value === "") {
      users = [];
      return;
    }
    const response = await fetch(
      "/api/members?" + new URLSearchParams({ search: value }),
    );
    users = await response.json();
  }

  function show() {
    dialog.showModal();
    document.body.style.overflow = "hidden";
  }

  function close() {
    dialog.close();
    document.body.style.overflow = "auto";
    value = "";
    users = [];
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.ctrlKey && event.key === "k") {
      event.preventDefault();
      show();
    } else if (event.key === "Escape") {
      close();
    }
  }
</script>

<svelte:document on:keydown={handleKeydown} />

<noscript>
  <style>
    .js {
      display: none;
    }
  </style>
  <!-- svelte-ignore a11y_consider_explicit_label -->
  <a href="/search" class="btn btn-ghost">
    <span class="i-mdi-magnify size-6"></span>
  </a>
</noscript>

<!-- svelte-ignore a11y_consider_explicit_label -->
<button class="js btn btn-ghost" on:click={show}>
  <span class="i-mdi-magnify size-6"></span>
</button>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
<dialog
  class="h-full max-w-md rounded-2xl bg-transparent text-base-content md:w-full"
  style="display: revert;"
  bind:this={dialog}
  on:click={close}
  tabindex="-1"
>
  <form
    class="rounded-2xl bg-base-100 p-2 shadow"
    on:click={(event) => event.stopPropagation()}
  >
    <div class="flex gap-2">
      <label class="input flex w-full items-center gap-2">
        <span class="i-mdi-magnify size-6"></span>
        <!-- svelte-ignore a11y-autofocus -->
        <input
          type="text"
          placeholder="Sök efter medlemmar"
          class="bg-transparent"
          autofocus
          bind:value
          on:input={getMembers}
        />
      </label>
      <button class="btn btn-ghost hidden sm:inline-flex" on:click={close}>
        <kbd class="kbd">ESC</kbd>
      </button>
    </div>
    {#if users.length > 0}
      <ul class="mt-2 flex flex-col gap-1">
        {#each users.slice(0, 10) as user}
          <li>
            <a
              href={"/members/" + user.studentId}
              class="btn flex justify-between"
              on:click={close}
            >
              <div>{user.firstName} {user.lastName}</div>
              <div class="text-primary">({user.studentId})</div>
            </a>
          </li>
        {/each}
        {#if users.length > 10}
          <li class="text-center">...</li>
        {/if}
      </ul>
    {/if}
  </form>
</dialog>

<style>
  dialog::backdrop {
    background: rgba(0, 0, 0, 0.2);
    backdrop-filter: blur(3px);
  }
</style>
