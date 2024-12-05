<script lang="ts">
  import { twMerge } from "tailwind-merge";
  import DsekLogo from "./DsekLogo.svelte";
  export let icon: string;
  let clazz = "";
  export { clazz as class };
</script>

{#if icon === "dsek-icon"}
  <DsekLogo class={twMerge("size-6 text-primary", clazz)} />
{:else}
  <span class={twMerge(`${icon} size-6 text-primary`, clazz)}></span>
{/if}
