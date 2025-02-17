<script lang="ts">
  import { useQRScanner } from "$lib/hooks/useQRScanner";

  export let onScan: (text: string) => void;

  let videoElement: HTMLVideoElement;
  let errorMessage = "";

  const { initialize } = useQRScanner();

  $: if (videoElement) {
    initialize(videoElement, (text) => {
      onScan(text);
    }).then((result) => {
      if (result.error) {
        errorMessage = result.error;
      }
    });
  }
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
        <track kind="captions" src="" label="English captions" srclang="en" />
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
