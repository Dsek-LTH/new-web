<script lang="ts">
  import ScrollIndicatedBox from "$lib/components/layout/ScrollIndicatedBox.svelte";
  import MemberAvatar from "$lib/components/socials/MemberAvatar.svelte";
  import { getFullName } from "$lib/utils/client/member";
  import type { Mandate, Member, Position } from "@prisma/client";
  import { page } from "$app/stores";
  import * as m from "$paraglide/messages";

  export let position: Position;
  export let mandates: Array<
    Mandate & {
      member: Member;
    }
  >;
  let mandatesBox: HTMLDivElement; // Function to check whether the element is overflowing
  $: year =
    parseInt($page.url.searchParams.get("year") ?? "") ||
    new Date().getFullYear();
</script>

<article class="card bg-base-200 shadow-xl transition-all">
  <div class="card-body">
    <h2 class="card-title">
      {#if position.boardMember}
        <!-- svelte-ignore a11y_consider_explicit_label -->
        <a href="/board" class="shrink-0">
          <div class="tooltip" data-tip={m.committees_boardMember()}>
            <span class="i-mdi-account-tie"></span>
          </div>
        </a>
      {/if}
      <div class="grid min-w-0 grid-cols-[1fr_auto] items-center gap-1">
        <a
          class="link-hover link link-primary truncate"
          href="/positions/{position.id}"
          title={position.name}
        >
          {position.name}
        </a>
        {#if mandates.length > 1}
          <span class="shrink-0">({mandates.length} st)</span>
        {/if}
      </div>
    </h2>
    {#if position.email}
      <div class="-mt-2 grid">
        <div class="min-w-0">
          <a
            class="link-hover link link-primary block truncate text-sm sm:text-base"
            href="mailto:{position.email}"
            title={position.email}
          >
            {position.email}
          </a>
        </div>
      </div>
    {/if}
    <p class="flex-grow-0">{position.description ?? ""}</p>
    <ScrollIndicatedBox element={mandatesBox}>
      <div class="max-h-80 overflow-y-auto" bind:this={mandatesBox}>
        <ul class="menu menu-vertical p-0">
          {#each mandates as mandate (mandate.id)}
            <li>
              <a href="/members/{mandate.member.studentId}">
                <div
                  class="grid w-full grid-cols-[auto_1fr] items-center gap-2"
                >
                  <MemberAvatar member={mandate.member} />
                  <div class="min-w-0">
                    <h3
                      class="truncate font-medium"
                      title={getFullName(mandate.member)}
                    >
                      {getFullName(mandate.member)}
                    </h3>
                    <h4 class="text-xs">
                      {#if mandate.startDate.getFullYear() !== year}
                        <i>{mandate.startDate.toLocaleDateString(["sv"])}</i>
                      {:else}
                        {mandate.startDate.toLocaleDateString(["sv"])}
                      {/if}
                      &#8702;
                      {#if mandate.endDate.getFullYear() !== year}
                        <i>{mandate.endDate.toLocaleDateString(["sv"])}</i>
                      {:else}
                        {mandate.endDate.toLocaleDateString(["sv"])}
                      {/if}
                    </h4>
                  </div>
                </div>
              </a>
            </li>
          {/each}
        </ul>
      </div>
    </ScrollIndicatedBox>
  </div>
</article>
