<script lang="ts">
  import { page } from "$app/stores";
  import MarkdownBody from "$lib/components/MarkdownBody.svelte";
  import MemberAvatar from "$lib/components/socials/MemberAvatar.svelte";
  import apiNames from "$lib/utils/apiNames";
  import { isAuthorized } from "$lib/utils/authorization";
  import { tagRegex } from "$lib/utils/client/commentTagging";
  import { relativeDate } from "$lib/utils/client/datetime";
  import { getFullName } from "$lib/utils/client/member";
  import type { RemoveCommentSchema } from "$lib/zod/comments";
  import type { ArticleComment, EventComment, Member } from "@prisma/client";
  import type { SuperValidated } from "sveltekit-superforms";
  import { superForm } from "$lib/utils/client/superForms";

  export let type: "NEWS" | "EVENT";
  export let comment: ArticleComment | EventComment;
  export let author: Member;
  /**
   * A list of all members that have been tagged in the comment. Can be more than JUST this comment's tagged members.
   */
  export let taggedMembers: Member[];
  export let onReply: () => void;
  export let removeCommentForm: SuperValidated<RemoveCommentSchema>;
  const { errors, constraints, enhance } = superForm(removeCommentForm, {
    id: comment.id,
  });

  const getReplacementValue = (studentId: string) => {
    const member: Member | undefined = taggedMembers.find(
      (member) => member.studentId === studentId,
    );
    if (!member) return "@Unknown User";
    // Logic to return the replacement value based on the UUID
    // For example, this could be a lookup in a map or an API call
    return `@${getFullName(member)}`; // Replace this with actual logic
  };

  function replaceTag(inputText: string) {
    return inputText.replace(tagRegex, (_, __, studentId) => {
      // Use the UUID to get the replacement value
      const replacement = getReplacementValue(studentId);
      // Replace the text in brackets with the replacement value
      return `[${replacement}](/members/${studentId})`;
    });
  }
  $: fixedContent = replaceTag(comment.content ?? "");
</script>

<!-- svelte-ignore a11y_consider_explicit_label -->
<section
  aria-label="Comment by {getFullName(author)}"
  class="relative mb-4"
  id="comment-section"
>
  <div class="grid grid-cols-[auto_1fr_auto] items-start gap-2">
    <a href="/members/{author.studentId}">
      <MemberAvatar member={author} class="w-8 rounded-lg" />
    </a>

    <div class="min-w-0 text-xs">
      <a
        href="/members/{author.studentId}"
        class="link link-primary block truncate no-underline"
        title={getFullName(author)}
      >
        {getFullName(author)}
      </a>
      <span class="font-semibold opacity-50"
        >{relativeDate(comment.published)}</span
      >
    </div>

    <div class="flex gap-1">
      {#if isAuthorized(apiNames[type].COMMENT, $page.data.user)}
        <button class="btn btn-square btn-ghost btn-md" on:click={onReply}>
          <span class="i-mdi-reply text-xl"></span>
        </button>
      {/if}
      {#if isAuthorized(apiNames[type].COMMENT_DELETE, $page.data.user)}
        <form method="POST" action="?/removeComment" use:enhance>
          <input
            type="hidden"
            name="commentId"
            value={comment.id}
            {...$constraints.commentId}
          />
          {#if $errors.commentId}
            <p class="text-error">{$errors.commentId}</p>
          {/if}
          <button type="submit" class="btn btn-square btn-ghost btn-md">
            <span class="i-mdi-delete text-xl"></span>
          </button>
        </form>
      {/if}
    </div>
  </div>

  <MarkdownBody body={fixedContent}></MarkdownBody>
</section>
