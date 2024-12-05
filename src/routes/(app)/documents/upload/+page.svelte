<script lang="ts">
  import Labeled from "$lib/components/Labeled.svelte";
  import { type SuperForm, fileProxy } from "sveltekit-superforms/client";
  import { superForm } from "$lib/utils/client/superForms";
  import DocumentTypeSelector from "./DocumentTypeSelector.svelte";
  import type { PageData } from "./$types";
  import * as m from "$paraglide/messages";
  import { typeToPath } from "./helpers";
  import SetPageTitle from "$lib/components/nav/SetPageTitle.svelte";
  import { zodClient } from "sveltekit-superforms/adapters";
  import { uploadSchema, type UploadSchema } from "./types";

  let { data }: { data: PageData } = $props();
  const { form, constraints, errors, enhance } = superForm(data.form, {
    onResult: (event) => {
      if (event.result.type === "success") {
        // On successful upload, set files to undefined and clear the filename
        // year and meeting is still kept as to easily upload more files for the same meeting
        fileInput.value = "";
      }
    },
    resetForm: false,
    validators: zodClient(uploadSchema),
  }) as SuperForm<UploadSchema>;
  const file = fileProxy(form, "file");
  let fileInput: HTMLInputElement;

  let pathInfo = $derived(typeToPath[$form.type]);
  let fileErrors = $derived($errors.file as string | string[] | undefined);
</script>

<SetPageTitle title={m.documents_uploadDocument()} />

<form
  id="upload-file"
  class="form-control items-stretch gap-4"
  method="POST"
  enctype="multipart/form-data"
  use:enhance
>
  <div>
    <p class="mb-5 text-lg font-medium">
      1. {m.documents_chooseDocumentType()}
    </p>
    <DocumentTypeSelector bind:type={$form.type} />
  </div>

  <Labeled error={$errors.folder}>
    <label class="mb-5 text-lg font-medium" for="folder">
      2. {$form.type === "requirement"
        ? m.documents_writePositionName()
        : m.documents_writeMeetingName()}
    </label>
    <input
      id="folder"
      name="folder"
      class="input input-bordered"
      bind:value={$form.folder}
      type="text"
      placeholder={$form.type === "requirement"
        ? "Øverphøs, Aktivitetsanssvarig..."
        : "S18, HTM1, VTM-extra..."}
      {...$constraints.folder}
    />
  </Labeled>

  <Labeled error={fileErrors}>
    <label class="mb-5 text-lg font-medium" for="file">
      3. {m.documents_uploadFile()}
    </label>
    <input
      bind:this={fileInput}
      id="file"
      type="file"
      name="file"
      class="file-input file-input-bordered"
      bind:files={$file}
      oninput={(e) => {
        if (e.currentTarget.files) {
          $form.name =
            e.currentTarget.files
              ?.item(0)
              ?.name.replace(/_+/g, " ")
              .replace(/\..+$/, "") ?? "";
        }
      }}
      {...$constraints.file}
    />
  </Labeled>

  <Labeled error={$errors.name}>
    <label class="mb-5 text-lg font-medium" for="name">
      4. {m.documents_enterDocumentName()}
    </label>
    <input
      id="name"
      name="name"
      class="input input-bordered"
      type="text"
      placeholder="Namn"
      bind:value={$form.name}
      {...$constraints.name}
    />
  </Labeled>

  <Labeled error={$errors.year}>
    <label class="mb-5 text-lg font-medium" for="year"
      >5. {m.documents_pickMeetingYear()}</label
    >
    <input
      id="year"
      name="year"
      class="input input-bordered"
      type="number"
      bind:value={$form.year}
      {...$constraints.year}
    />
  </Labeled>

  {#if $form.type && $form.folder && $form.name}
    <pre
      class="input input-bordered input-disabled">{pathInfo.bucket}/{pathInfo.path(
        $form.year,
        $form.folder,
      )}/{$form.name}</pre>
  {/if}

  <button type="submit" form="upload-file" class="btn btn-primary">
    {m.documents_upload()}
  </button>
</form>
