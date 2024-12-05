<script lang="ts">
  import type { MouseEventHandler } from "svelte/elements";
  import { twMerge } from "tailwind-merge";

  export let onClick: MouseEventHandler<HTMLButtonElement> | undefined =
    undefined;
  export let isLoading = false;
  export let disabled = false;
  // ms to wait before showing the loading spinner
  // The reason behind this can be read up on here: https://www.nngroup.com/articles/response-times-3-important-limits/
  // TL;DR: Under 100ms delay, the user feels it as instant. Over 1000ms delay, the user feels it as a separate task. 500ms is a sweet spot to show a loading spinner to tell the user something is happening.
  export let delay = 500;
  let clazz: string | undefined = undefined;
  export { clazz as class };
</script>

<button
  {...$$props}
  class={twMerge("relative", clazz)}
  disabled={disabled || isLoading}
  on:click={onClick
    ? async (e) => {
        const timeout = setTimeout(() => {
          isLoading = true;
        }, delay);
        await onClick?.(e); // svelte doesn't recoginize that this is non-nullable
        clearTimeout(timeout);
        isLoading = false;
      }
    : undefined}
>
  <slot />
  <div
    class="absolute inset-0 flex items-center justify-center transition-all"
    class:opacity-0={!isLoading}
  >
    <span class="loading"></span>
  </div>
</button>
