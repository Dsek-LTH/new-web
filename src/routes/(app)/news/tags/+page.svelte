<script lang="ts">
  import { superForm } from "$lib/utils/client/superForms";
  import TagEditorRow from "./TagEditorRow.svelte";
  import * as m from "$paraglide/messages";

  import type { PageData } from "./$types";
  import SetPageTitle from "$lib/components/nav/SetPageTitle.svelte";
  export let data: PageData;
  const { form, errors, constraints, enhance, submitting } = superForm(
    data.createForm,
    {
      resetForm: true,
    },
  );
</script>

<SetPageTitle title={m.news_tags_newsTags()} />

<div class="overflow-x-auto">
  <table class="table">
    <!-- head -->
    <thead>
      <tr class="bg-base-200">
        <th>{m.news_tags_preview()}</th>
        <th>{m.news_tags_name()}</th>
        <th>{m.news_tags_name()} (EN)</th>
        <th>{m.news_tags_color()}</th>
        <th></th>
      </tr>
    </thead>
    <tbody>
      {#each data.tags as tag (tag.id)}
        <TagEditorRow {tag} data={data.updateForm} />
      {/each}
    </tbody>
  </table>
</div>

<section class="flex flex-col gap-4 py-4">
  <h2 class="text-xl font-bold">{m.news_tags_addNew()}</h2>
  <form class="form-control gap-4" method="POST" action="?/create" use:enhance>
    <label class="join">
      <span class="label join-item bg-base-200 px-4"
        >{m.news_tags_newTag()}</span
      >
      <input
        type="text"
        name="name"
        placeholder={m.news_tags_tagName()}
        class="input join-item input-bordered input-primary w-80"
        bind:value={$form.name}
        {...$constraints.name}
      />
      <button
        type="submit"
        class="btn btn-primary join-item"
        disabled={$submitting}
      >
        {m.news_tags_create()}</button
      >
    </label>
    {#if $errors.name}
      <p class="text-error">{$errors.name}</p>
    {/if}
  </form>
</section>
