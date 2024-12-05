<script lang="ts">
  import { getPdfApiUrl } from "$lib/utils/servePdf";

  export let name: string;
  export let url: string;
  export let host = false;
  export let full = false;
  $: fileName = name.includes(".")
    ? name.substring(0, name.lastIndexOf(".")).replace(/_+/g, " ")
    : name;
</script>

<div class="flex" class:w-full={full} data-tip={fileName}>
  <a
    href={host ? getPdfApiUrl(url) : url}
    class="block py-2 hover:underline"
    class:w-full={full}
    target="_blank"
    ><span
      class="i-mdi-file-document-outline align-text-top text-xl text-primary"
    ></span>
    {fileName}
  </a>
</div>
