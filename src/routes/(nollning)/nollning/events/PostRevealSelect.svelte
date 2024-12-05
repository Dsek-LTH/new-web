<script lang="ts">
  export let title: string;
  export let checked: boolean;
</script>

<div
  class="collapse z-10 w-auto !grid-rows-[min-content_0fr] rounded-btn border-2 border-neutral bg-neutral duration-300 has-[input[type='checkbox']:checked]:!grid-rows-[min-content_1fr] has-[input[type='checkbox']:checked]:border-base-content has-[input[type='checkbox']:checked]:bg-base-100"
>
  <input type="checkbox" class="peer min-h-0" bind:checked />
  <div
    class="collapse-title flex h-9 min-h-0 items-center gap-2 p-2 font-medium peer-checked:[&>span]:rotate-0"
  >
    {title}
    <span
      class=" i-mdi-chevron-down rotate-90 transition-transform duration-300 ease-out-back"
    >
    </span>
  </div>
  <div class="collapse-content px-0 peer-checked:!pb-0">
    <slot />
  </div>
</div>
