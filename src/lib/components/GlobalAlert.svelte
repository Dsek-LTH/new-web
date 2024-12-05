<script lang="ts">
  import { marked } from "marked";
  import DOMPurify from "isomorphic-dompurify";

  export let message: string;
  export let severity: string;

  const icon = (() => {
    switch (severity) {
      case "info":
        return "i-mdi-information-outline";
      case "success":
        return "i-mdi-check-circle-outline";
      case "warning":
        return "i-mdi-alert-outline";
      case "error":
        return "i-mdi-close-circle-outline";
    }
  })();
</script>

<div role="alert" class={`alert alert-${severity} rounded-none`}>
  <span class={`${icon} text-xl`}></span>
  <span class="font-bold prose-a:link">
    <!-- eslint-disable-next-line svelte/no-at-html-tags -- Sanitized client-side -->
    {@html marked(DOMPurify.sanitize(message))}
  </span>
</div>
