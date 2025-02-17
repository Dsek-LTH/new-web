import { BrowserMultiFormatReader } from "@zxing/library";
import { onDestroy } from "svelte";

export function useQRScanner() {
  const codeReader = new BrowserMultiFormatReader();

  const initialize = async (
    videoElement: HTMLVideoElement,
    onResult?: (text: string) => void,
  ): Promise<{ error?: string }> => {
    try {
      const videoInputDevices = await codeReader.listVideoInputDevices();
      console.log("Available devices:", videoInputDevices);

      if (videoInputDevices.length === 0) {
        throw new Error("No camera devices found");
      }

      // Try to get the back camera first, then front camera, then first available camera
      const selectedDevice =
        videoInputDevices.find((device) =>
          device.label.toLowerCase().includes("back"),
        ) ||
        videoInputDevices.find((device) =>
          device.label.toLowerCase().includes("front"),
        ) ||
        videoInputDevices[0];

      if (!selectedDevice) throw new Error("No suitable camera device found");

      await codeReader.decodeFromVideoDevice(
        selectedDevice.deviceId,
        videoElement,
        (result, err) => {
          if (result && onResult) {
            onResult(result.getText());
          }
          if (err) {
            console.error("Scanning error:", err);
          }
        },
      );

      return {};
    } catch (error) {
      console.error("Camera initialization error:", error);
      return { error: `Camera error: ${error}` };
    }
  };

  const reset = () => {
    codeReader.reset();
  };

  // Cleanup when component is destroyed
  onDestroy(() => {
    reset();
  });

  return {
    initialize,
    reset,
  };
}
