<script lang="ts">
  import { page } from "$app/stores";
  import { codeToMessage } from "$lib/utils/codeToMessage";
  import * as m from "$paraglide/messages";
</script>

<main class="gap mx-auto flex flex-1 flex-col items-center gap-2 pt-20">
  <h1 class="text-6xl font-bold">{$page.status}</h1>
  <h3>
    {($page.error?.statusDescription ?? $page.status in codeToMessage)
      ? codeToMessage[$page.status]
      : ""}
  </h3>
  {#if $page.error?.message}
    <h2 class="mt-4 text-center text-xl">{$page.error.message}</h2>
  {/if}

  <div class="flex flex-row gap-5 pt-10">
    <a href="/" class="btn btn-primary text-lg">
      {m.home()} <span class="i-mdi-house"></span>
    </a>

    <button class="btn btn-secondary text-lg" on:click={() => history.back()}>
      {m.back()} <span class="i-mdi-keyboard-backspace"></span>
    </button>
  </div>
  <div class="pt-16 text-center text-lg">
    <div class="pb-2">{m.error_should_not_happen()}</div>
    <div class="flex flex-row items-center gap-3">
      <a
        href="https://github.com/Dsek-LTH/web/issues/new"
        class="btn btn-ghost text-lg"
      >
        {m.error_create_issue()} <span class="i-mdi-bug"></span>
      </a>

      <span class="text-xl font-extrabold">{m.error_or()}</span>
      <a href="mailto:dwww@dsek.se" class="btn btn-ghost text-lg"
        >{m.error_contact()} <span class="i-mdi-email"></span></a
      >
    </div>
  </div>
</main>
