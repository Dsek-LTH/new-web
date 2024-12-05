<script lang="ts">
  import CommitteeSymbol from "$lib/components/images/CommitteeSymbol.svelte";
  import { languageTag } from "$paraglide/runtime";
  import type { MandateWithPositionAndCommitte } from "./types";

  export let year: string;
  export let mandates: MandateWithPositionAndCommitte[];
</script>

<section class="mb-4">
  <h1 class="text-xl font-semibold">{year}</h1>
  <div class="flex flex-col items-stretch gap-0">
    {#each mandates as mandate (mandate.id)}
      {#if mandate.position}
        <div
          class="tooltip -mx-4 whitespace-pre"
          data-tip={mandate.position.committee?.name +
            `\n${mandate.startDate.toLocaleDateString(
              languageTag(),
            )} - ${mandate.endDate.toLocaleDateString(languageTag())}`}
        >
          <a
            href="/positions/{mandate.position.id}"
            class="btn btn-ghost w-full justify-start gap-2 normal-case text-primary"
          >
            {#if mandate.position.committee}
              <figure class="h-8 w-8 overflow-hidden">
                <CommitteeSymbol committee={mandate.position.committee} />
              </figure>
            {/if}
            <div class="flex flex-1 gap-4">
              <span
                class="gap-4 overflow-x-hidden text-ellipsis whitespace-nowrap text-left font-medium"
              >
                {mandate.position.name}
              </span>
              {#if mandate.phadderIn}
                {@const group = mandate.phadderIn}
                <!-- TODO: FIX when you actually can debug this -->
                <!-- eslint-disable-next-line svelte/valid-compile -->
                <!-- svelte-ignore node_invalid_placement_ssr -->
                <a
                  href="/committees/nollu?year={new Date(
                    mandate.startDate,
                  ).getFullYear()}"
                  class="-my-[1em] flex items-center gap-1 text-base-content"
                >
                  <span class="text-2xl">(</span>
                  {#if group.imageUrl}
                    <img
                      src={group.imageUrl}
                      class=" max-h-[2em] max-w-[2em] rounded-sm"
                      alt="Group logo"
                    />
                  {/if}
                  {group.name}
                  <span class="text-2xl">)</span>
                </a>
              {/if}
            </div>
          </a>
        </div>
      {/if}
    {/each}
  </div>
</section>
