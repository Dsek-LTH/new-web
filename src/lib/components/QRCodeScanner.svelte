<script lang="ts">
  import { useQRScanner } from "$lib/hooks/useQRScanner";
  import { onDestroy } from "svelte";

  export let onScan: (text: string) => void;
  export let errorMessage = "";

  let videoElement: HTMLVideoElement;

  const { initialize, reset } = useQRScanner();

  $: if (videoElement) {
    initialize(videoElement, (text) => {
      onScan(text);
    }).then((result) => {
      if (result.error) {
        errorMessage = result.error;
      }
    });
  }

  onDestroy(() => {
    reset();
  });
</script>

<div class="qr-container">
  <div class="qr-wrapper">
    {#if errorMessage}
      <p class="error-message">
        Failed to initialize camera.<br />
        Error: {errorMessage}
      </p>
    {:else}
      <video bind:this={videoElement} id="qr-reader" playsinline>
        <track kind="captions" src="" label="Captions" />
      </video>
    {/if}
  </div>
</div>

<style>
  .qr-container {
    width: 100%;
    display: flex;
    justify-content: center;
    padding: 1rem;
  }

  .qr-wrapper {
    width: 100%;
    max-width: 500px;
  }

  #qr-reader {
    width: 100%;
  }

  .error-message {
    color: red;
    text-align: center;
    padding: 1rem;
  }
</style>
