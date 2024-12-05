<script lang="ts">
  export let stab = false;
  export let name: string;
  export let body = "";
  export let imageUrl = "";
  export let index: number;
  export let max = stab ? 6 : 11;
  export let prefix = `${stab ? "stab" : "pepp"}slide`;
  export let font = stab
    ? "font-nolla-stab text-3xl tracking-widest"
    : "font-nolla-pepp tracking-wider text-4xl";

  export let rounded = true;
  $: newLines = name.split("\n").length - 1;
</script>

<div
  id="{prefix}{index}"
  class="relative w-full scroll-my-20 flex-col items-center max-md:carousel-item md:flex"
>
  <div class="mb-4 flex gap-1 md:hidden">
    <!-- eslint-disable-next-line @typescript-eslint/no-unused-vars -->
    {#each new Array(max).fill(0) as _, i}
      <div
        class="size-2 rounded-full"
        class:bg-base-content={i === index}
        class:bg-base-200={i !== index}
      ></div>
    {/each}
  </div>
  <figure
    class="relative mb-8 aspect-square w-[calc(100%-6rem)] border-none md:w-64"
    class:rounded-full={rounded}
    class:rounded-btn={!rounded}
  >
    <div
      class="absolute -inset-x-12 top-1/2 flex -translate-y-1/2 transform justify-between md:hidden"
    >
      {#if index > 0}
        <a href="#{prefix}{index - 1}" class=" p-6 px-4">❮</a>
      {:else}
        <div></div>
      {/if}
      {#if index < max - 1}
        <a href="#{prefix}{index + 1}" class="p-6 px-4">❯</a>
      {/if}
    </div>
    <img
      src={imageUrl}
      alt={name}
      class="aspect-square h-full w-full object-cover"
      class:rounded-full={rounded}
      class:object-cover={rounded}
      class:object-contain={!rounded}
      class:rounded-btn={!rounded}
    />
  </figure>
  <h3
    class="mb-4 text-center font-medium {font} rounded-btn p-2"
    style="margin-top: -{newLines * 1.2}em"
  >
    <!-- eslint-disable-next-line svelte/no-at-html-tags -->
    {@html name.replaceAll("\n", "<br />")}
  </h3>
  <p class="nolla-prose max-w-prose rounded-btn p-2 text-center max-md:mx-6">
    <!-- eslint-disable-next-line svelte/no-at-html-tags -->
    {@html body.replaceAll("\n", "<br />")}
  </p>
  <slot />
</div>
