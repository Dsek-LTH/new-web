<script lang="ts">
  import { enhance } from "$app/forms";
  import * as m from "$paraglide/messages";
  import SearchResultList from "$lib/components/search/SearchResultList.svelte";
  import {
    availableSearchIndexes,
    type SearchDataWithType,
  } from "$lib/search/searchTypes";
  import { mapIndexToMessage } from "$lib/search/searchHelpers";
  import { isSearchResultData } from "$lib/components/search/SearchUtils";

  let formElement: HTMLFormElement;
  let inputElement: HTMLInputElement;
  let listItems: HTMLAnchorElement[] = [];
  let timeout: ReturnType<typeof setTimeout> | null = null;

  let input = "";
  let limit = 20; // limits number of results per query, default in Meili is 20
  let offset = 0;
  let currentIndex = -1;
  let isSearching = false;
  let thereIsMore = true;

  let results: SearchDataWithType[] = [];
  let error: Record<string, unknown> | undefined = undefined;

  $: noResults = results.length === 0;

  $: toSearchOn = availableSearchIndexes.map((index) => {
    return {
      index,
      include: true,
    };
  });

  // Call handleSearch whenever checkboxes change
  // eslint-disable-next-line @typescript-eslint/no-unused-expressions -- This syntax is valid and it's a good use case here
  $: toSearchOn && handleSearch();

  function handleSearch() {
    // Cancel the previous timeout
    if (timeout) clearTimeout(timeout);
    offset = 0;
    // When user requests a search with empty string
    // Happens when the user deletes the last key of the input
    // We shouldn't search then
    if (!input) {
      isSearching = false;
      results = [];
      return;
    } else {
      // Do the search after 300ms
      timeout = setTimeout(() => {
        offset = 0;
        formElement.requestSubmit();
        currentIndex = -1;
      }, 300);
      isSearching = true;
    }
  }

  function showMore() {
    offset += limit;
    setTimeout(() => formElement.requestSubmit(), 0);
  }

  function onKeyDown(event: KeyboardEvent) {
    // Most probable case first: user just presses a key
    // We should then start searching
    // (the actual search is executed by input on:input)
    if (
      (currentIndex !== -1 && event.key.length === 1) ||
      ((event.key === "Backspace" || event.key === "Delete") &&
        input.length > 0)
    ) {
      isSearching = true;
      inputElement.focus();
      return;
    }

    // Second most probable case: user presses arrow keys
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      captureListItems();
      event.preventDefault();

      // Move the index based on the key pressed
      if (event.key === "ArrowDown") {
        if (currentIndex + 1 < listItems.length) {
          currentIndex++;
        }
      } else if (event.key === "ArrowUp") {
        if (currentIndex > 0) {
          currentIndex--;
        } else {
          // Focus the input if we're at the top of the list
          currentIndex = -1;
          inputElement.focus();
          return;
        }
      }
      // Update focus
      listItems[currentIndex]?.focus();
      return;
    }

    // User presses enter
    if (event.key === "Enter") {
      captureListItems();
      // If we have a current index, click it
      if (currentIndex !== -1) {
        listItems[currentIndex]?.click();
      }
      event.preventDefault();
      return;
    }
  }

  function captureListItems() {
    // Capture all the search results
    listItems = Array.from(
      formElement?.getElementsByClassName("search-result"),
    ) as HTMLAnchorElement[];
  }
</script>

<svelte:window on:keydown={onKeyDown} />

<form
  method="POST"
  class="mx-auto mb-4 mt-8 max-w-lg"
  bind:this={formElement}
  use:enhance={async () => {
    return async ({ update, result: incomingResults }) => {
      if (
        incomingResults.type === "success" &&
        isSearchResultData(incomingResults.data)
      ) {
        // If the offset wasn't 0, then we should append the results
        if (offset != 0) {
          results = results.concat(incomingResults.data.results);
        } // Otherwise just write over the results
        else {
          results = incomingResults.data.results;
        }
        error = undefined;
        thereIsMore = incomingResults.data.results.length >= limit;
      } else if (incomingResults.type === "failure") {
        results = [];
        error = incomingResults.data;
      } else {
        console.log("Unknown return from search", incomingResults);
      }
      await update({
        reset: false,
      });
      isSearching = false;
    };
  }}
>
  <label class="input input-bordered mb-2 flex items-center gap-2">
    <span class="i-mdi-magnify size-6"></span>
    <!-- svelte-ignore a11y-autofocus -->
    <input
      autofocus
      type="text"
      name="input"
      placeholder={m.search_search()}
      class="grow bg-transparent"
      autocomplete="off"
      bind:this={inputElement}
      bind:value={input}
      on:input={handleSearch}
    />
    {#if isSearching}
      <span class="loading loading-sm"></span>
    {/if}
  </label>
  <div class="mb-2 flex flex-wrap gap-4 p-2">
    {#each toSearchOn as index}
      <div class="flex items-center gap-2">
        <input
          type="checkbox"
          class="checkbox checkbox-sm"
          id={index.index}
          name={index.index}
          bind:checked={index.include}
        />
        <label for={index.index}>{mapIndexToMessage(index.index)}</label>
      </div>
    {/each}
    <input type="hidden" name="limit" value={limit} />
  </div>
  <button class="btn sr-only mb-2 w-full">{m.search_search()}</button>
  {#if results.length}
    <div class="menu rounded-box bg-base-200">
      <SearchResultList {results} />
    </div>
  {:else if !isSearching && input.length > 0 && noResults}
    <div class="menu rounded-box bg-base-200">
      <li>
        <p class="menu-title p-4">
          {m.search_noResults()} :(
        </p>
      </li>
    </div>
  {/if}
  {#if error !== undefined}
    <div class="alert alert-error">
      Error: {JSON.stringify(error)}
    </div>
  {/if}
  {#if results.length > 0 && thereIsMore}
    <!-- show more results -->
    <button type="button" class="btn m-4" on:click={showMore}>
      {m.search_showMore()}
    </button>
  {/if}
  <input type="hidden" name="offset" value={offset} />
</form>
