<script lang="ts">
  import { enhance } from "$app/forms";
  import LoadingButton from "$lib/components/LoadingButton.svelte";
  import TagChip from "$lib/components/TagChip.svelte";
  import SetPageTitle from "$lib/components/nav/SetPageTitle.svelte";
  import AuthorSignature from "$lib/components/socials/AuthorSignature.svelte";
  import CommentSection from "$lib/components/socials/CommentSection.svelte";
  import * as m from "$paraglide/messages";
  import Article from "../Article.svelte";
  import LikeButton from "../LikeButton.svelte";
  import LikersList from "../LikersList.svelte";
  import type { PageData } from "./$types";

  export let data: PageData;

  $: article = data.article;
  $: author = article.author;
  let isRemoving = false;
</script>

<SetPageTitle title={article.header} />

<article>
  <Article {article}>
    <AuthorSignature
      slot="author"
      member={author.member}
      position={author.mandate?.position}
      customAuthor={author.customAuthor}
      type={article.author.type}
    />

    <div slot="actions" class="flex flex-row">
      {#if data.canEdit}
        <!-- svelte-ignore a11y_consider_explicit_label -->
        <a
          href={`/news/${article.slug}/edit`}
          class="btn btn-square btn-ghost btn-md"
          title={m.news_edit()}
        >
          <span class="i-mdi-edit text-xl"></span>
        </a>
      {/if}
      {#if data.canDelete}
        <form
          method="POST"
          action="?/removeArticle"
          use:enhance={() => {
            isRemoving = true;
            return ({ update }) => {
              update();
              isRemoving = false;
            };
          }}
        >
          <LoadingButton
            isLoading={isRemoving}
            type="submit"
            class="btn btn-square btn-ghost btn-md"
            title={m.news_delete()}
          >
            <span class="i-mdi-delete text-xl"></span>
          </LoadingButton>
        </form>
      {/if}
    </div>

    <div slot="tags" class="flex flex-row flex-wrap gap-2">
      {#each article.tags as tag}
        <TagChip {tag} />
      {/each}
    </div>
    <div slot="after-body" class="mt-4">
      <div class="flex flex-col items-start gap-2">
        <LikersList likers={article.likers} />
        <LikeButton
          likers={article.likers}
          likeForm={data.likeForm}
          articleId={article.id}
        />
      </div>
      <div class="mt-4 flex flex-col gap-2">
        <CommentSection
          type="NEWS"
          comments={article.comments}
          taggedMembers={data.allTaggedMembers}
          commentForm={data.commentForm}
          removeCommentForm={data.removeCommentForm}
        />
      </div>
    </div>
  </Article>
</article>
