<script lang="ts">
  import PageHeader from "$lib/components/nav/PageHeader.svelte";
  import MemberAvatar from "$lib/components/socials/MemberAvatar.svelte";
  import { getFullName } from "$lib/utils/client/member";
  import type { PageData } from "./$types";
  import * as m from "$paraglide/messages";
  export let data: PageData;
</script>

<PageHeader title={m.theBoard()} />
<!-- TODO: make this editable by board members with Markdown page -->
<section class="mb-5 space-y-5">
  <p>
    {m.board_description()}
  </p>
  <p>
    <!-- eslint-disable-next-line svelte/no-at-html-tags -->
    {@html m.board_reachAt()}
  </p>
</section>

<section class="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
  {#each data.boardPositions as boardMember (boardMember.position.id)}
    <div class="card bg-base-200 shadow-xl">
      {#if boardMember.studentId}
        <div class="group/photo card-body p-4 text-center">
          <a href="/members/{boardMember.studentId}" class="group/link">
            <figure class="transition-transform group-hover/photo:scale-90">
              <MemberAvatar member={boardMember} class="size-24 rounded-full" />
            </figure>
            <h2
              class="card-title mt-8 block text-pretty text-primary group-hover/link:underline"
            >
              {getFullName(boardMember)}
            </h2>
          </a>
          <div class="flex flex-col gap-1 px-2 text-base-content/90">
            <a
              class="hover:underline"
              href="/positions/{boardMember.position.id}"
            >
              {boardMember.position.name}
            </a>
            <a
              class="flex items-center justify-center gap-1 text-sm text-base-content/90 hover:underline"
              href="mailto:{boardMember.position.email}"
            >
              <span class="i-mdi-email"></span>
              {boardMember.position.email}
            </a>
          </div>
        </div>
      {:else}
        <!-- position is vacant -->
        <div class="group/photo">
          <figure class="mt-4 transition-transform group-hover/photo:scale-90">
            <!-- MemberAvatar renders well even with null-values -->
            <MemberAvatar member={boardMember} class="size-24 rounded-full" />
          </figure>
          <div class="card-body px-0 text-center">
            <h2 class="card-title mx-auto text-primary">V.A. Kant</h2>
            <div class="flex flex-col gap-1 px-2 text-base-content/90">
              <a
                class="hover:underline"
                href="/positions/{boardMember.position.id}"
              >
                {boardMember.position.name}
              </a>
              <a
                class="flex items-center justify-center gap-1 text-sm text-base-content/70 hover:underline"
                href="mailto:{boardMember.position.email}"
              >
                <span class="i-mdi-email"></span>
                {boardMember.position.email}
              </a>
            </div>
          </div>
        </div>
      {/if}
    </div>
  {/each}
</section>
