<script lang="ts">
  import Autocomplete from "$lib/components/Autocomplete.svelte";
  import Input from "$lib/components/Input.svelte";
  import Labeled from "$lib/components/Labeled.svelte";
  import SetPageTitle from "$lib/components/nav/SetPageTitle.svelte";
  import apiNames from "$lib/utils/apiNames";
  import { isAuthorized } from "$lib/utils/authorization";
  import { superForm } from "$lib/utils/client/superForms";
  import * as m from "$paraglide/messages";
  import type { PageData } from "./$types";
  export let data: PageData;

  const {
    form,
    errors,
    constraints,
    enhance: updateEnhance,
  } = superForm(data.form);

  let removeModal: HTMLDialogElement | undefined = undefined;
</script>

<SetPageTitle title={data.song.title} />
<svelte:head>
  <meta name="description" content={data.song.lyrics} />
</svelte:head>

<form
  method="POST"
  action="?/update"
  class="form-control gap-2"
  use:updateEnhance
>
  <input type="hidden" name="id" value={data.song.id} />
  <Input
    name="title"
    label={m.songbook_title()}
    bind:value={$form.title}
    {...$constraints.title}
    error={$errors.title}
  />
  <Labeled
    label={m.songbook_melody()}
    error={$errors.melody}
    explanation={m.songbook_melodyExplanation()}
  >
    <Autocomplete
      name="melody"
      bind:value={$form.melody}
      options={data.existingMelodies}
      {...$constraints.melody}
      error={$errors.melody}
      searchValue={data.song.melody ?? ""}
    />
  </Labeled>
  <Labeled
    label={m.songbook_category()}
    error={$errors.category}
    explanation={m.songbook_categoryExplanation()}
  >
    <Autocomplete
      name="category"
      bind:value={$form.category}
      options={data.existingCategories}
      {...$constraints.category}
      error={$errors.category}
      searchValue={data.song.category ?? ""}
    />
  </Labeled>
  <Labeled label={m.songbook_lyrics()} error={$errors.lyrics}>
    <textarea
      id="lyrics"
      name="lyrics"
      class="textarea textarea-bordered h-80"
      bind:value={$form.lyrics}
      {...$constraints.lyrics}
    ></textarea>
  </Labeled>

  <div class="flex justify-between">
    <div class="flex gap-2">
      <button class="btn btn-primary" type="submit">{m.songbook_save()}</button>
      <a class="btn" type="button" href={`/songbook/${data.song.slug}`}>
        {m.songbook_cancel()}
      </a>
    </div>
    {#if isAuthorized(apiNames.SONG.DELETE, data.user)}
      {#if data.song.deletedAt === null}
        <button
          class="btn"
          type="button"
          on:click={() => removeModal?.showModal()}
        >
          {m.songbook_removeSong()}
        </button>
      {:else}
        <button class="btn" type="submit" form="restoreSong">
          {m.songbook_restoreFromGarbageCan()}
        </button>
      {/if}
    {/if}
  </div>
</form>

<form
  method="POST"
  action="?/restore"
  id="restoreSong"
  class="form-control gap-2"
>
  <input type="hidden" name="id" value={data.song.id} />
</form>

<dialog bind:this={removeModal} class="modal modal-bottom sm:modal-middle">
  <div class="modal-box">
    <h3 class="text-lg font-bold">{m.songbook_removeSong()}</h3>
    <p class="py-4">
      {m.songbook_areYouSure()}
      <!-- eslint-disable-next-line svelte/no-at-html-tags -- Sanitized client-side -->
      <b class="capitalize">{@html data.song.title}</b>?
    </p>
    <div class="modal-action">
      <form method="POST" action="?/delete" class="form-control gap-2">
        <input type="hidden" name="id" value={data.song.id} />
        <div class="flex gap-2">
          <button
            class="btn"
            type="button"
            on:click={() => removeModal?.close()}
          >
            {m.songbook_cancel()}
          </button>
          <button class="btn btn-error" type="submit" formaction="?/delete">
            {m.songbook_remove()}
          </button>
        </div>
      </form>
    </div>
  </div>
  <form method="dialog" class="modal-backdrop">
    <!-- svelte-ignore a11y_consider_explicit_label -->
    <button class="cursor-auto"></button>
  </form>
</dialog>
