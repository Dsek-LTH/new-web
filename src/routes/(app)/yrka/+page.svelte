<script lang="ts">
  import Input from "$lib/components/Input.svelte";
  import Labeled from "$lib/components/Labeled.svelte";
  import PageHeader from "$lib/components/nav/PageHeader.svelte";
  import { superForm } from "$lib/utils/client/superForms";
  import type { PageData } from "./$types";
  export let data: PageData;
  const { form, errors, constraints, enhance, submitting } = superForm(
    data.form,
    {
      resetForm: true,
    },
  );
</script>

<PageHeader title="Yrka på ett sektionsmöte" />
<form use:enhance method="POST" class="form-control gap-4">
  <Input
    label="Yrkandetitel"
    name="title"
    placeholder="Toapaus"
    explanation="Detta är för att hjälpa talmannen i sin inkorg"
    bind:value={$form.title}
    error={$errors.title}
    {...$constraints.title}
  />
  <Labeled label="Ditt yrkande" error={$errors.content}>
    <textarea
      id="content"
      name="content"
      class="textarea textarea-bordered min-h-[12rem] pt-8"
      placeholder="att ta en 5 minuter toapaus"
      bind:value={$form.content}
      {...$constraints.content}
    ></textarea>
    <span class="absolute left-4 top-12 text-sm italic opacity-50"
      >Jag yrkar på:
    </span>
  </Labeled>
  <button type="submit" class="btn btn-outline btn-primary self-start">
    {#if $submitting}
      <span class="loading"></span>
    {:else}
      Skicka
    {/if}
  </button>
</form>
