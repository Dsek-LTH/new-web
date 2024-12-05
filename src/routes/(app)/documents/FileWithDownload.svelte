<script lang="ts">
  export let name: string;
  export let url: string;
  export let onClick: (url: string) => void;
</script>

<div class="flex items-center gap-2 py-2">
  <a
    class="link flex items-center gap-2 text-left no-underline hover:underline"
    href={url}
    target="_blank"
    on:click={(e) => {
      // don't open modal if we're on too small a screen
      if (window.innerWidth < 768) return;

      e.preventDefault();
      onClick(url);
    }}
  >
    <span
      class="i-mdi-file-document-outline align-text-top text-xl text-primary"
    ></span>
    {name}
  </a>

  <!-- svelte-ignore a11y_consider_explicit_label -->
  <a
    href={url}
    download={name}
    class="link no-underline hover:link-primary hover:underline"
  >
    <span class="i-mdi-download align-text-top text-xl"></span>
  </a>
</div>
