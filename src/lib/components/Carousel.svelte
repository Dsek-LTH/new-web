<script lang="ts">
  import { getFileUrl } from "$lib/files/client";
  export let images: string[] = [];
  let carouselRef: HTMLDivElement;
  let index = 1;

  function onKeyDown(event: KeyboardEvent) {
    if (event.key === "ArrowRight") {
      scroll(true);
    } else if (event.key === "ArrowLeft") {
      scroll(false);
    }
  }

  function scroll(right: boolean): void {
    const sign = right ? 1 : -1;
    index = Math.max(Math.min(index + sign, images.length), 1);
    carouselRef.scroll(
      carouselRef.scrollLeft + carouselRef.clientWidth * sign,
      0,
    );
  }
</script>

{#if images.length > 0}
  <div class="relative">
    <div class="carousel" bind:this={carouselRef}>
      {#each images as image, i}
        <div
          id="slide{i}"
          class="carousel-item relative flex w-full justify-center"
        >
          <figure>
            <img
              src={getFileUrl(image)}
              alt={i.toString()}
              loading="lazy"
              class="h-[80dvh] object-contain"
            />
          </figure>
        </div>
      {/each}
    </div>
    {#if images.length > 1}
      <div class="absolute bottom-5 w-full text-center">
        <button class="btn btn-circle" on:click={() => scroll(false)}>
          <span class="i-mdi-arrow-left" />
        </button>
        <span>{index} / {images.length}</span>
        <button class="btn btn-circle" on:click={() => scroll(true)}>
          <span class="i-mdi-arrow-right" />
        </button>
      </div>
    {/if}
  </div>
{/if}

<svelte:window on:keydown={onKeyDown} />
