<script lang="ts">
  import type { FileData } from "$lib/files/fileHandler";
  import * as m from "$paraglide/messages";
  export let files: { next: FileData[]; last: FileData[] };
</script>

<div
  class="flex justify-between gap-2 rounded-2xl border-t-4 bg-base-300 p-4 max-lg:border-t-primary max-md:flex-col md:flex-1 lg:border-t-secondary"
>
  <div>
    <h2 class="text-md flex items-center font-light">
      <a href="/documents" class="text-xl font-bold hover:underline"
        >{files.next[0]?.id.split("/")[2] ?? ""}</a
      >
      &nbsp;- {m.home_meetingNext()}
    </h2>
    <ul class="menu p-0">
      {#each files.next.slice(0, 4) as file}
        <li class="inline-block max-w-full">
          <a href={file.thumbnailUrl}>
            <span
              class="i-mdi-document size-6 max-lg:text-primary lg:text-secondary"
            ></span>
            <span class="overflow-x-hidden text-ellipsis whitespace-nowrap">
              {file.name}
            </span>
          </a>
        </li>
      {/each}
    </ul>
  </div>
  <div>
    <h2
      class="text-md flex items-center place-self-end pt-4 font-light md:pt-0"
    >
      <a href="/documents" class="text-xl font-bold hover:underline"
        >{files.last[0]?.id.split("/")[2] ?? ""}</a
      >
      &nbsp;- {m.home_meetingPrev()}
    </h2>
    <ul class="menu p-0">
      {#each files.last.slice(0, 4) as file}
        <li class="inline-block max-w-full">
          <a href={file.thumbnailUrl} class="text-ellipsis">
            <span
              class="i-mdi-document size-6 max-lg:text-primary lg:text-secondary"
            ></span>
            <span class="overflow-x-hidden text-ellipsis whitespace-nowrap">
              {file.name}
            </span>
          </a>
        </li>
      {/each}
    </ul>
  </div>
</div>
