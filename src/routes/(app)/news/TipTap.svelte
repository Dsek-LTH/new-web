<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import { Editor } from "@tiptap/core";
  import StarterKit from "@tiptap/starter-kit";
  import * as m from "$paraglide/messages";

  let element: Element;
  let editor: Editor;

  onMount(() => {
    editor = new Editor({
      element: element,
      extensions: [StarterKit],
      editorProps: {
        attributes: {
          class:
            "prose dark:prose-invert prose-sm prose-base mt-5 bg-slate-950 p-5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 border border-transparent transition-colors duration-150 ease-in-out h-64 h-full",
        },
      },
      content: m.news_editorDefaultContent(),
      onTransaction: () => {
        // force re-render so `editor.isActive` works as expected
        editor = editor;
      },
    });
  });

  onDestroy(() => {
    if (editor) {
      editor.destroy();
    }
  });
</script>

{#if editor}
  <button
    on:click={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
    class:bg-primary={editor.isActive("heading", { level: 1 })}
  >
    H1
  </button>
  <button
    on:click={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
    class:bg-primary={editor.isActive("heading", { level: 2 })}
  >
    H2
  </button>
  <button
    on:click={() => editor.chain().focus().setParagraph().run()}
    class:bg-primary={editor.isActive("paragraph")}
  >
    P
  </button>
{/if}

<div bind:this={element}></div>
