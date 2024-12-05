<script lang="ts">
  import type { Meeting } from "@prisma/client";
  import * as m from "$paraglide/messages";
  export let upcoming: Pick<Meeting, "title"> | null;
  export let previous: Pick<Meeting, "title"> | null;
</script>

<a class="pop-out flex gap-6 rounded-2xl bg-base-300 p-6" href="/documents">
  <span class="i-mdi-gavel self-center text-2xl"></span>

  <article class="flex-1">
    <p>{m.home_meetingNext()}</p>
    <h2 class="text-xl font-bold">
      {#if upcoming}
        {upcoming.title}
      {:else}
        TBD
      {/if}
    </h2>
  </article>

  {#if previous}
    <article>
      <p class="font-light">{m.home_meetingPrev()}</p>
      <h2 class="text-xl font-light">
        {previous.title}
      </h2>
    </article>
  {/if}
</a>
