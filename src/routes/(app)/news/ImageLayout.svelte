<script lang="ts">
  export let images: string[];
  export let alt: string;
</script>

<div class="h-full w-full p-1">
  <div
    class="grid h-full w-full grid-cols-2 grid-rows-2 gap-1 overflow-hidden rounded-b-lg"
  >
    <img
      src={images[0]}
      {alt}
      class="col-span-1 row-span-2 h-full w-full object-cover"
    />
    <img
      src={images[1]}
      {alt}
      class="col-span-1 row-span-1 h-full w-full object-cover"
    />
    <div class="relative col-span-1 row-span-1">
      <img
        src={images[2]}
        {alt}
        class="h-full w-full object-cover opacity-50"
      />
      <span
        class="white bold absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transform text-4xl"
        >{images.length - 3}+</span
      >
    </div>
  </div>
</div>
