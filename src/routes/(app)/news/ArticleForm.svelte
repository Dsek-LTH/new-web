<script lang="ts">
  import FormFilesInput from "$lib/components/forms/FormFilesInput.svelte";
  import FormInput from "$lib/components/forms/FormInput.svelte";
  import FormMarkdown from "$lib/components/forms/FormMarkdown.svelte";
  import FormSubmitButton from "$lib/components/forms/FormSubmitButton.svelte";
  import Labeled from "$lib/components/Labeled.svelte";
  import LangTabs from "$lib/components/layout/LangTabs.svelte";
  import TagSelector from "$lib/components/TagSelector.svelte";
  import type { AuthorOption } from "$lib/news/getArticles";
  import type { ArticleSchema } from "$lib/news/schema";
  import * as m from "$paraglide/messages";
  import type { Tag } from "@prisma/client";
  import { type SuperForm } from "sveltekit-superforms";

  export let authorOptions: AuthorOption[];
  export let allTags: Tag[];
  export let superform: SuperForm<ArticleSchema>;
  export let articleImages: string[] = [];
  export let articleVideo: string | undefined = undefined;

  const { form, enhance, errors } = superform;

  const sameAuthorOption = (
    a: Pick<AuthorOption, "memberId" | "mandateId" | "customId" | "type">,
    b: Pick<AuthorOption, "memberId" | "mandateId" | "customId" | "type">,
  ) =>
    a.memberId === b.memberId &&
    a.mandateId === b.mandateId &&
    a.customId === b.customId &&
    a.type === b.type;

  const onFileSelected = (
    event: Event & {
      currentTarget: EventTarget & HTMLInputElement;
    },
  ) => {
    const images = event.currentTarget.files;
    articleImages = [];
    Array.from(images ?? []).forEach((image) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result;
        if (typeof result === "string") {
          articleImages = [...articleImages, result];
        }
      };
      reader.readAsDataURL(image);
    });
  };

  const onVideoSelected = (
    event: Event & {
      currentTarget: EventTarget & HTMLInputElement;
    },
  ) => {
    let videoUrl = event.currentTarget.value;
    if (!videoUrl) return;
    articleVideo = videoUrl;
  };
</script>

<form
  method="POST"
  class="form-control mb-8 gap-2"
  enctype="multipart/form-data"
  use:enhance
>
  <LangTabs>
    <svelte:fragment slot="sv">
      <FormInput {superform} field="header" label={m.news_header()} />
      <FormMarkdown {superform} field="body" label={m.news_description()} />
    </svelte:fragment>
    <svelte:fragment slot="en">
      <FormInput {superform} field="headerEn" label={m.news_header()} />
      <FormMarkdown {superform} field="bodyEn" label={m.news_description()} />
    </svelte:fragment>
  </LangTabs>

  <Labeled
    label={m.news_author()}
    error={$errors.author !== undefined ? m.news_invalidAuthor() : ""}
  >
    <select
      id="author"
      class="select select-bordered w-full max-w-xs"
      bind:value={$form.author}
      required
    >
      {#each authorOptions as authorOption}
        <option
          value={sameAuthorOption(authorOption, $form.author)
            ? $form.author
            : authorOption}
        >
          {#if authorOption.type === "Custom" && authorOption.customAuthor != null}
            {authorOption.customAuthor.name}
          {:else}
            {authorOption.member.firstName}
            {authorOption.member
              .lastName}{#if authorOption.mandate?.position.name},
              {authorOption.mandate?.position.name}
            {/if}
          {/if}
        </option>
      {/each}
    </select>
  </Labeled>
  <div class="flex w-full flex-col items-stretch">
    <Labeled
      for="tags"
      label={m.news_tags()}
      error={$errors.tags?._errors?.join(", ")}
    />
    <TagSelector name="tags" {allTags} bind:selectedTags={$form.tags} />
  </div>

  <FormFilesInput
    {superform}
    field="images"
    label="Bilder"
    onChange={onFileSelected}
    accept="image/*"
  />

  <FormInput
    {superform}
    field="youtubeUrl"
    label="Youtube video URL"
    onChange={onVideoSelected}
  />

  <slot name="form-end" />
  <FormSubmitButton {superform} class="btn btn-primary mt-4">
    {$form.slug ? m.save() : m.news_publish()}
  </FormSubmitButton>
</form>
