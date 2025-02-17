<script lang="ts">
  import QRCodeScanner from "$lib/qr/QRCodeScanner.svelte";
  import { page } from "$app/stores";
  import { goto } from "$app/navigation";

  function handleScan(text: string) {
    const slug = $page.params["slug"];
    goto(`/shop/tickets/${slug}/scan/${text}`);
  }
</script>

<QRCodeScanner onScan={handleScan} />
