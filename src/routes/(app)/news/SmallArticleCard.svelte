<script lang="ts">
  import AuthorSignature from "$lib/components/socials/AuthorSignature.svelte";
  import type { Article } from "$lib/news/getArticles";
  import { goto } from "$lib/utils/redirect";
  import dayjs from "dayjs";
  import { markdownToTxt } from "markdown-to-txt";
  import ArticleImages from "./ArticleImages.svelte";
  export let article: Article;
</script>

<article
  class="row-span-2 grid h-full grid-rows-subgrid gap-0 overflow-hidden rounded-xl bg-base-200"
>
  <div class="flex justify-between gap-4 bg-base-300 p-4">
    <div class="flex flex-wrap gap-2">
      {#each article.tags as tag}
        <span class="badge text-xs text-neutral-600">{tag.name}</span>
      {/each}
    </div>
  </div>

  {#if article.imageUrls.length > 0}
    <button on:click={() => goto("news/" + article.slug)} class="h-80 w-full">
      <ArticleImages images={article.imageUrls} header={article.header} />
    </button>
  {:else}
    <div class="flex flex-col items-stretch overflow-hidden p-8">
      <div class="flex-1">
        <button
          on:click={() => goto("news/" + article.slug)}
          class="group text-start"
        >
          <h1 class="text-2xl font-bold group-hover:underline">
            {article.header}
          </h1>
          <div class="prose mb-8 mt-2 line-clamp-3 prose-headings:text-sm">
            {markdownToTxt(article.body, { pedantic: true })}
          </div>
        </button>
      </div>

      <AuthorSignature
        member={article.author.member}
        position={article.author.mandate?.position}
        customAuthor={article.author.customAuthor ?? undefined}
        type={article.author.type}
      >
        <p
          class="my-1 self-end text-nowrap text-xs font-light text-neutral-600"
          slot="end"
        >
          {#if dayjs(article.createdAt).diff(dayjs(), "week") < -1}
            {dayjs(article.createdAt).format("YYYY-MM-DD")}
          {:else}
            {dayjs(article.createdAt).fromNow()}
          {/if}
        </p>
      </AuthorSignature>
    </div>
  {/if}
</article>
