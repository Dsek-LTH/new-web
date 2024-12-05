<!--
@component
This component should be used when you want to display a list of pages and
allow the user to navigate between them. It's responsive and will show as
many pages as possible on the screen, and will scroll if there are too many.
It works by navigating to the same page with a different query string,
e.g. `?page=1`, `?page=2`, etc. The page number is stored in the URL query.
-->
<script lang="ts">
  import { afterNavigate } from "$app/navigation";
  import { page } from "$app/stores";
  import { twMerge } from "tailwind-merge";

  let {
    class: clazz = "",
    count,
    getPageName = (n) => (n + 1).toString(),
    getPageNumber = (n) => Number.parseInt(n) - 1,
    fieldName = "page",
    showPrev = true,
    showNext = true,
    showFirst = false,
    showLast = false,
    keepScrollPosition = false,
  }: {
    class?: string;
    /** The number of pages. */
    count: number;
    /**
     * Given a page number, return the name of the page.
     * By default pages are named 1, 2, 3, ...
     */
    getPageName?: (n: number) => string;
    /**
     * Given a page name, return the number of the page.
     * If `getPageName` is provided, this must also be provided
     * and it must be the inverse of `getPageName`.
     */
    getPageNumber?: (n: string) => number;
    /**
     * The URL query string key to use for the page number, e.g `?page=1`.
     * Defaults to `"page"`.
     */
    fieldName?: string;
    /** Whether to show the previous page button. */
    showPrev?: boolean;
    /** Whether to show the next page button. */
    showNext?: boolean;
    /** Whether to show the first page button. */
    showFirst?: boolean;
    /** Whether to show the last page button. */
    showLast?: boolean;
    /** Whether to keep the scroll position after a page button has been clicked */
    keepScrollPosition?: boolean;
  } = $props();

  const currentPage = $derived(
    $page.url.searchParams.get(fieldName) ?? getPageName(0).toString(),
  );

  const getPageLink = $derived((p: number | string) => {
    const searchParams = new URLSearchParams($page.url.searchParams);
    if (typeof p === "number") p = getPageName(p);
    searchParams.set(fieldName, p);
    return `?${searchParams.toString()}`;
  });

  let carousel: HTMLElement;
  let pageButtons: HTMLElement[] = [];
  function scrollToActive() {
    const active = pageButtons[getPageNumber(currentPage)];
    if (active) {
      const activeRect = active.getBoundingClientRect();
      const elRect = carousel.getBoundingClientRect();
      carousel.scrollLeft =
        activeRect.left -
        elRect.left +
        carousel.scrollLeft -
        (elRect.width - activeRect.width) / 2;
    }
  }
  afterNavigate(scrollToActive);
</script>

<!-- svelte-ignore a11y_consider_explicit_label -->
<div class={twMerge("join w-full", clazz)} role="listbox" tabindex="0">
  {#if showFirst}
    <a
      class="btn carousel-item join-item btn-xs sm:btn-sm md:btn-md"
      class:btn-disabled={currentPage == getPageName(0)}
      href={getPageLink(0)}
      data-sveltekit-noscroll={keepScrollPosition}
    >
      <span class="i-mdi-page-first"></span></a
    >
  {/if}

  {#if showPrev}
    <a
      class="btn carousel-item join-item btn-xs sm:btn-sm md:btn-md"
      class:btn-disabled={currentPage == getPageName(0)}
      href={getPageLink(getPageNumber(currentPage) - 1)}
      data-sveltekit-noscroll={keepScrollPosition}
    >
      <span class="i-mdi-chevron-left"></span>
    </a>
  {/if}

  <div class="carousel join-item flex" bind:this={carousel}>
    {#each [...Array(count).keys()].map(getPageName) as page, i (page)}
      <a
        class="btn carousel-item join-item btn-xs sm:btn-sm md:btn-md"
        class:btn-active={page == currentPage}
        class:btn-disabled={page == currentPage}
        href={getPageLink(page)}
        bind:this={pageButtons[i]}
        data-sveltekit-noscroll={keepScrollPosition}
      >
        {page}
      </a>
    {/each}
  </div>

  {#if showNext}
    <a
      class="btn carousel-item join-item btn-xs sm:btn-sm md:btn-md"
      class:btn-disabled={currentPage == getPageName(count - 1)}
      href={getPageLink(getPageNumber(currentPage) + 1)}
      data-sveltekit-noscroll={keepScrollPosition}
    >
      <span class="i-mdi-chevron-right"></span>
    </a>
  {/if}

  {#if showLast}
    <a
      class="btn carousel-item join-item btn-xs sm:btn-sm md:btn-md"
      class:btn-disabled={currentPage == getPageName(count - 1)}
      href={getPageLink(count - 1)}
      data-sveltekit-noscroll={keepScrollPosition}
    >
      <span class="i-mdi-page-last"></span>
    </a>
  {/if}
</div>
