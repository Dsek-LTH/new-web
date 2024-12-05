<script lang="ts">
  import PageHeader from "$lib/components/nav/PageHeader.svelte";
  import Pagination from "$lib/components/Pagination.svelte";
  import SearchBar from "$lib/components/SearchBar.svelte";
  import apiNames from "$lib/utils/apiNames";
  import { isAuthorized } from "$lib/utils/authorization";
  import Disclaimer from "./Disclaimer.svelte";
  import SongElement from "./SongElement.svelte";
  import * as m from "$paraglide/messages";
  import type { PageData } from "./$types";

  function isCatSelected(catId: string): boolean {
    return data.categories.includes(catId);
  }

  let { data }: { data: PageData } = $props();
  let form: HTMLFormElement;
</script>

<div class="flex flex-row">
  <PageHeader title={m.songBook()} />
  {#if isAuthorized(apiNames.SONG.CREATE, data.user)}
    <div class="ml-auto">
      <a href="/songbook/create">
        <button class="btn">{m.songbook_createNewSong()}</button>
      </a>
    </div>
  {/if}
</div>

<p class="text-xl font-bold">
  {m.songbook_hereYoullFind()}
</p>
<Disclaimer />

<form method="GET" bind:this={form} data-sveltekit-keepfocus>
  {#if isAuthorized(apiNames.SONG.DELETE, data.user)}
    <div class="my-4 flex items-center justify-end gap-2">
      <input
        class="checkbox"
        type="checkbox"
        name="show-deleted"
        value="true"
        checked={data.params.includes("show-deleted")}
        onchange={() => form.requestSubmit()}
      />
      <label class="label" for="show-deleted">
        {m.songbook_showDeleted()}
      </label>
    </div>
  {/if}

  <div class="my-4 flex flex-wrap justify-between">
    {#each Object.keys(data.categoryMap) as catId}
      <label
        class="m-1 flex-grow cursor-pointer rounded-lg px-2 py-1 text-center ring-neutral-700 transition hover:scale-105 hover:bg-neutral-700 md:ring-1"
        class:bg-neutral-600={isCatSelected(catId)}
      >
        {data.categoryMap[catId]}
        <input
          hidden
          type="checkbox"
          name="category"
          value={catId}
          checked={isCatSelected(catId)}
          onchange={() => form.requestSubmit()}
        />
      </label>
    {/each}
  </div>

  <SearchBar />
</form>

{#each data.songs as song}
  <div class="rounded-lg hover:ring-2 hover:ring-primary">
    <a href={`/songbook/${song.slug}`}>
      <SongElement {song} />
    </a>
  </div>
{/each}

<Pagination count={data.pageCount} />
