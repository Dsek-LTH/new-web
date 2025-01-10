<script lang="ts">
  import {
    availableSearchIndexes,
    type SearchDataWithType,
  } from "$lib/search/searchTypes";
  import * as m from "$paraglide/messages";
  import { enhance } from "$app/forms";
  import SearchResultList from "./SearchResultList.svelte";
  import { isSearchResultData } from "./SearchUtils";
  let dialog: HTMLDialogElement;

  let formElement: HTMLFormElement;
  let inputElement: HTMLInputElement;
  let listItems: HTMLAnchorElement[] = [];
  let timeout: ReturnType<typeof setTimeout> | null = null;
  let advancedSearchElement: HTMLAnchorElement;

  let input = "";
  let currentIndex = -1;
  let isSearching = false;
  let isOpen = false;

  let results: SearchDataWithType[] = [];
  let error: Record<string, unknown> | undefined = undefined;

  $: noResults = results.length === 0;

  function handleSearch() {
    // Cancel the previous timeout
    if (timeout) clearTimeout(timeout);
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
        formElement.requestSubmit();
        currentIndex = -1;
      }, 300);
      isSearching = true;
    }
  }

  function show() {
    dialog.showModal();
    isOpen = true;
    document.body.style.overflow = "hidden";
  }

  function close() {
    dialog.close();
    isOpen = false;
    document.body.style.overflow = "auto";
  }

  function handleKeydown(event: KeyboardEvent) {
    // Most probable case first: user just presses a key
    // We should then start searching
    // (the actual search is executed by input on:input)
    if (
      (isOpen && currentIndex !== -1 && event.key.length === 1) ||
      ((event.key === "Backspace" || event.key === "Delete") &&
        input.length > 0)
    ) {
      isSearching = true;
      inputElement.focus();
      return;
    }

    // Second most probable case: user presses arrow keys
    if (isOpen && (event.key === "ArrowDown" || event.key === "ArrowUp")) {
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
    if (isOpen && event.key === "Enter") {
      captureListItems();
      // If we have a current index, click it
      if (currentIndex !== -1) {
        listItems[currentIndex]?.click();
      }
      event.preventDefault();
      return;
    }

    // User presses ctrl+k or cmd+k
    if (!isOpen && (event.ctrlKey || event.metaKey) && event.key === "k") {
      event.preventDefault();
      show();
      return;
    }
    // User presses escape, close the dialog and blur the input
    if (isOpen && event.key === "Escape") {
      inputElement.blur();
      currentIndex = -1;
      close();
      return;
    }
    // If it already is open and the user presses ctrl+k or cmd+k, focus and prevent default
    if (isOpen && (event.ctrlKey || event.metaKey) && event.key === "k") {
      event.preventDefault();
      inputElement.focus();
      return;
    }
  }

  function captureListItems() {
    // Capture all the search results, and the advanced search link
    listItems = (
      Array.from(
        formElement?.getElementsByClassName("search-result"),
      ) as HTMLAnchorElement[]
    ).concat(advancedSearchElement);
  }
</script>

<svelte:window on:keydown={handleKeydown} />

<!-- If user has disabled JavaScript -->
<noscript>
  <style>
    .js {
      display: none;
    }
  </style>
  <a href="/search" class="btn btn-ghost" aria-label="Search">
    <span class="i-mdi-magnify size-6"></span>
  </a>
</noscript>

<button class="js btn btn-ghost" on:click={show} aria-label="Open search">
  <span class="i-mdi-magnify size-6"></span>
</button>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
<dialog
  class="h-full max-w-xl rounded-2xl bg-transparent pt-16 text-base-content md:w-full"
  style="display: revert;"
  bind:this={dialog}
  on:click={close}
  tabindex="-1"
>
  <form
    method="POST"
    action="/search"
    bind:this={formElement}
    use:enhance={async () => {
      return async ({ update, result: incomingResults }) => {
        if (
          incomingResults.type === "success" &&
          isSearchResultData(incomingResults.data)
        ) {
          error = undefined;
          results = incomingResults.data.results;
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
    class="rounded-2xl bg-base-100 p-2 shadow"
    on:click={(event) => event.stopPropagation()}
  >
    <div class="flex gap-2">
      <label class="input flex w-full items-center gap-2">
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
        {#each availableSearchIndexes as index}
          <input type="hidden" name={index} value="on" />
        {/each}
      </label>
      <button
        class="btn btn-ghost hidden sm:inline-flex"
        tabindex="-1"
        on:click={close}
      >
        <kbd class="kbd">ESC</kbd>
      </button>
    </div>
    <div class="menu rounded-box bg-base-200">
      <SearchResultList {results} />
      <li>
        {#if !isSearching && input.length > 0 && noResults}
          <p class="menu-title p-4">
            {m.search_noResults()} :(
          </p>
        {/if}
        <a
          class="border border-transparent text-primary focus:border-primary"
          href="/search"
          bind:this={advancedSearchElement}
        >
          {m.search_advancedSearch()}
        </a>
      </li>
    </div>
    {#if error !== undefined}
      <div class="alert alert-error p-4">
        Error: {JSON.stringify(error)}
      </div>
    {/if}
  </form>
</dialog>

<style>
  dialog::backdrop {
    background: rgba(0, 0, 0, 0.2);
    backdrop-filter: blur(3px);
  }
</style>
