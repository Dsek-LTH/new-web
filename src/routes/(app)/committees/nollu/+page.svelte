<script lang="ts">
  import apiNames from "$lib/utils/apiNames";
  import { isAuthorized } from "$lib/utils/authorization";
  import CommitteePage from "../CommitteePage.svelte";
  import type { PageData } from "./$types";
  import PhadderGroup from "./PhadderGroup.svelte";
  export let data: PageData;
</script>

<CommitteePage {data}>
  <section class="-mx-4 mt-4 rounded-box bg-base-200 p-4">
    <div class="flex justify-between">
      <h3 class="text-xl font-medium">Phaddergrupper</h3>
      {#if isAuthorized(apiNames.NOLLNING.MANAGE_PHADDER_GROUPS, data.user)}
        <!-- svelte-ignore a11y_consider_explicit_label -->
        <a
          href="/committees/nollu/groups#{data.year}"
          class="btn btn-secondary btn-sm"
        >
          <span class="i-mdi-edit"></span>
        </a>
      {/if}
    </div>
    <ul
      class="grid gap-x-2 gap-y-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
    >
      {#each data.phadderGroups as group (group.id)}
        <PhadderGroup {group} />
      {/each}
    </ul>
  </section>
</CommitteePage>
