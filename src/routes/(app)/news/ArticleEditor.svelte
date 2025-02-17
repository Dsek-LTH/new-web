<script lang="ts">
  import AuthorSignature from "$lib/components/socials/AuthorSignature.svelte";
  import TagChip from "$lib/components/TagChip.svelte";
  import * as m from "$paraglide/messages";
  import type { Tag } from "@prisma/client";
  import type { SuperValidated } from "sveltekit-superforms";
  import Article from "./Article.svelte";
  import ArticleForm from "./ArticleForm.svelte";
  import type { AuthorOption } from "$lib/news/getArticles";
  import type { ArticleSchema } from "$lib/news/schema";
  import { superForm } from "$lib/utils/client/superForms";

  export let data: SuperValidated<ArticleSchema>;
  export let authorOptions: AuthorOption[];
  export let allTags: Tag[];
  export let superform = superForm(data, {
    dataType: "json",
  });
  let articleImages: string[] = [];
  let articleVideo: string | undefined = undefined;
  const { form } = superform;
</script>

<main
  class="container mx-auto flex flex-col gap-8 px-4 pt-8 lg:flex-row [&>*]:flex-1"
>
  <section>
    <ArticleForm
      {superform}
      {allTags}
      {authorOptions}
      bind:articleImages
      bind:articleVideo
    >
      <slot slot="form-end" name="form-end" />
    </ArticleForm>
  </section>
  <section class="-mt-4">
    <span class="italic">{m.news_preview()}</span>
    <Article
      article={{
        id: "",
        slug: "",
        header: $form.header,
        headerEn: $form.headerEn,
        body: $form.body,
        bodyEn: $form.bodyEn,
        authorId: $form.author.id,
        publishedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        removedAt: null,
        status: "draft",
        imageUrls: $form.imageUrls ?? articleImages,
        imageUrl: $form.imageUrl ?? null,
        youtubeUrl: articleVideo ?? $form.youtubeUrl ?? null,
      }}
    >
      <AuthorSignature
        links={false}
        slot="author"
        member={$form.author.member}
        position={$form.author.mandate?.position}
        customAuthor={$form.author.customAuthor}
        type={$form.author.type}
      />

      <div slot="tags" class="flex flex-row flex-wrap gap-2">
        {#each $form.tags as selectedTag}
          {@const tag = allTags.find((t) => t.id === selectedTag.id)}
          <TagChip {tag} />
        {/each}
      </div>
    </Article>
  </section>
</main>
