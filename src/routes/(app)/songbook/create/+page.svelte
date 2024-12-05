<script lang="ts">
  import Autocomplete from "$lib/components/Autocomplete.svelte";
  import Input from "$lib/components/Input.svelte";
  import Labeled from "$lib/components/Labeled.svelte";
  import PageHeader from "$lib/components/nav/PageHeader.svelte";
  import * as m from "$paraglide/messages";
  import { superForm } from "$lib/utils/client/superForms";

  import type { PageData } from "./$types";
  export let data: PageData;

  const { form, errors, constraints, enhance } = superForm(data.form);
</script>

<PageHeader title={m.songbook_createNewSong()} />

<main>
  <section>
    <form
      method="POST"
      action="?/create"
      class="form-control gap-2"
      use:enhance
    >
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
        />
      </Labeled>
      <Labeled label="Text" error={$errors.lyrics}>
        <textarea
          id="lyrics"
          name="lyrics"
          class="textarea textarea-bordered h-80 hover:border-base-content"
          bind:value={$form.lyrics}
          {...$constraints.lyrics}
        ></textarea>
      </Labeled>
      <button class="btn btn-primary mt-4" type="submit"
        >{m.songbook_create()}</button
      >
    </form>
  </section>
</main>
