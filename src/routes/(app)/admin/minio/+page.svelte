<script lang="ts">
  import { enhance } from "$app/forms";
  import { PUBLIC_BUCKETS_FILES } from "$env/static/public";
  import FormFileInput from "$lib/components/forms/FormFileInput.svelte";
  import FormInput from "$lib/components/forms/FormInput.svelte";
  import FormSubmitButton from "$lib/components/forms/FormSubmitButton.svelte";
  import { toast } from "$lib/stores/toast";
  import apiNames from "$lib/utils/apiNames";
  import { isAuthorized } from "$lib/utils/authorization";
  import { superForm } from "$lib/utils/client/superForms";
  import * as m from "$paraglide/messages";

  export let data;
  const superform = superForm(data.uploadForm, {
    dataType: "json",
  });
  const { enhance: createEnhance, form } = superform;
  $: console.log(data.files);
</script>

{#if $form.fileUrl}
  <span class="text-lg">
    Filurl: <span class="font-medium">{$form.fileUrl}</span>
  </span>
{/if}
<form
  method="POST"
  action="?/upload"
  use:createEnhance
  enctype="multipart/form-data"
  class="form-control max-w-md rounded-box bg-base-200 p-4"
>
  <FormFileInput
    field="file"
    {superform}
    label="Fil"
    onChange={(e) => {
      if (e.currentTarget.files) {
        $form.fileName =
          e.currentTarget.files
            ?.item(0)
            ?.name.replace(/_+/g, " ")
            .replace(/\..+$/, "") ?? "";
      }
    }}
  />
  <FormInput {superform} field="fileName" label={m.documents_uploadFile()} />
  <FormInput
    {superform}
    field="prefix"
    label="Prefix"
    explanation="Kommer lägga den i rätt mapp (typ /event/2024/XXX)"
  />
  <FormSubmitButton {superform} class="btn btn-primary mt-4 self-start"
    >{m.documents_uploadFile()}</FormSubmitButton
  >
</form>
<ul class="mt-8 flex flex-col gap-1">
  {#each data.files as file}
    <li class="join flex py-1">
      <button
        class="btn join-item flex-1 select-all justify-start"
        on:click={() => {
          if (file.thumbnailUrl) {
            navigator.clipboard.writeText(file.thumbnailUrl);
            toast("Länk kopierad till urklipp", "success");
          }
        }}
      >
        {file.id.replace(data.prefix + "/", "")}
      </button>
      <form
        action="?/delete"
        method="POST"
        use:enhance={() => {
          if (!confirm(m.documents_deleteFile() + "?")) return;
          return ({ update }) => update();
        }}
      >
        <input type="hidden" value={file.id} name="id" />
        <!-- svelte-ignore a11y_consider_explicit_label -->
        <button
          class="btn btn-error join-item"
          disabled={!isAuthorized(
            apiNames.FILES.BUCKET(PUBLIC_BUCKETS_FILES).DELETE,
            data.user,
          )}
        >
          <span class="i-mdi-delete"></span>
        </button>
      </form>
    </li>
  {/each}
</ul>
