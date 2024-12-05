<script lang="ts">
  import { page } from "$app/stores";
  import type { Member } from "@prisma/client";
  import type { SuperValidated } from "sveltekit-superforms";
  import { superForm } from "$lib/utils/client/superForms";
  import type { LikeSchema } from "./likes";
  import apiNames from "$lib/utils/apiNames";
  import { isAuthorized } from "$lib/utils/authorization";
  import * as m from "$paraglide/messages";

  export let likers: Member[];
  $: authorized = isAuthorized(apiNames.NEWS.LIKE, $page.data.user);
  export let articleId: string;
  export let likeForm: SuperValidated<LikeSchema>;
  const { errors, constraints, enhance } = superForm(likeForm, {
    id: articleId, // needs to be unique since there could be multiple like buttons on a page
    invalidateAll: true,
  });
  $: isLiked = likers.some(
    (member) => member.studentId === $page.data.user?.studentId,
  );
</script>

<form method="POST" action="?/{isLiked ? 'dislike' : 'like'}" use:enhance>
  <input type="hidden" value={articleId} name="articleId" {...$constraints} />
  {#if $errors.articleId}
    <div class="text-error">{$errors.articleId}</div>
  {/if}
  <div
    class:tooltip={!authorized}
    class="m-4 hover:opacity-50 hover:transition-opacity"
    data-tip={m.news_logInToLike()}
  >
    <!-- svelte-ignore a11y_consider_explicit_label -->
    <button disabled={!authorized} type="submit">
      <label class="swap">
        <input type="checkbox" disabled={!authorized} checked={isLiked} />
        <span class="swap-on i-mdi-thumb-up h-10 w-10"> </span>
        <span class="swap-off i-mdi-thumb-up-outline h-10 w-10"> </span>
      </label>
    </button>
  </div>
</form>
