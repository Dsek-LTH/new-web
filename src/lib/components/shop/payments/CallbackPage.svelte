<script lang="ts">
  import { browser } from "$app/environment";
  import { invalidate } from "$app/navigation";
  import SetPageTitle from "$lib/components/nav/SetPageTitle.svelte";
  import { goto } from "$lib/utils/redirect";
  import * as m from "$paraglide/messages";
  import { onDestroy } from "svelte";

  export let data: {
    refreshPeriodically?: boolean;
    message: string;
  };

  let interval: ReturnType<typeof setInterval> | null = null;

  onDestroy(() => {
    if (interval && browser) {
      clearInterval(interval);
      interval = null;
    }
  });
  $: if (data.refreshPeriodically && browser) {
    interval = setInterval(async () => {
      const timeout = setTimeout(() => {
        goto(window.location.pathname); // reload page
      }, 2000);
      await invalidate("cart-success-page");
      // this point is only reached if purchase is still not succesful
      clearTimeout(timeout);
    }, 2000);
  } else if (interval && browser) {
    clearInterval(interval);
    interval = null;
  }
</script>

<SetPageTitle title={m.cart_paymentStatus_pageTitle()} />

<h1 class="text-xl font-semibold">{data.message}</h1>
{#if interval}
  <span class="loading size-8"></span>
{/if}
