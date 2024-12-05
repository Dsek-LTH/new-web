<script lang="ts">
  import PageHeader from "$lib/components/nav/PageHeader.svelte";
  import apiNames from "$lib/utils/apiNames";
  import { isAuthorized } from "$lib/utils/authorization";
  import { getPdfApiUrl } from "$lib/utils/servePdf";
  import DeleteFileForm from "../DeleteFileForm.svelte";
  import FileWithDownload from "../FileWithDownload.svelte";
  import type { PageData } from "./$types";
  import * as m from "$paraglide/messages";
  import Pagination from "$lib/components/Pagination.svelte";
  export let data: PageData;

  $: plansOfOperations = data.plansOfOperations;
  $: strategicGoals = data.strategicGoals;
  $: frameworkBudgets = data.frameworkBudgets;

  const currentYear = new Date().getFullYear();

  let isEditing = false;
  let selectedPdf: string | null = null;
  let dialog: HTMLDialogElement;
  $: onPdfClick = (url: string) => {
    selectedPdf = url;
    dialog.showModal();
  };
</script>

<div
  class="flex w-full flex-row flex-wrap items-center justify-between gap-x-4"
>
  <PageHeader title={m.documents_governing()} />
  <div>
    {#if isAuthorized(apiNames.GOVERNING_DOCUMENT.DELETE, data.user)}
      {#if isAuthorized(apiNames.GOVERNING_DOCUMENT.CREATE, data.user)}
        <a class="btn btn-primary btn-sm" href="/documents/governing/new">
          + {m.documents_governing_createNew()}
        </a>
      {/if}
      <button
        class="btn btn-secondary btn-sm"
        on:click={() => {
          isEditing = !isEditing;
        }}
      >
        {isEditing ? m.documents_stopEditing() : m.documents_edit()}
      </button>
    {/if}
  </div>
</div>
<div class="flex flex-col gap-5">
  <p>
    {m.documents_governing_blurb()}
  </p>
  <p>
    {m.documents_governing_forQuestions()}
    <a
      href="mailto:styrelsen@dsek.se"
      class="link link-primary no-underline hover:underline"
    >
      styrelsen@dsek.se
    </a>
  </p>
  <div class="flex items-center gap-5">
    <FileWithDownload
      name={m.documents_governing_statutes()}
      url="/stadgar"
      onClick={onPdfClick}
    />
    <FileWithDownload
      name={m.documents_governing_regulations()}
      url="/reglemente"
      onClick={onPdfClick}
    />
  </div>
  <div class="flex flex-col gap-4 md:flex-row">
    <div>
      <h1 class="my-3 text-2xl font-bold">
        {m.documents_governing_policies()}
      </h1>
      <div class="flex flex-col gap-2">
        {#each data.policies as policy}
          <div class="flex items-center gap-1">
            <FileWithDownload
              name={policy.title}
              url={getPdfApiUrl(policy.url)}
              onClick={onPdfClick}
            />
            {#if isAuthorized(apiNames.GOVERNING_DOCUMENT.DELETE, data.user) && isEditing}
              <DeleteFileForm
                fileId={policy.id}
                fileName={policy.title}
                data={data.deleteForm}
              />
            {/if}
            {#if isAuthorized(apiNames.GOVERNING_DOCUMENT.UPDATE, data.user) && isEditing}
              <!-- svelte-ignore a11y_consider_explicit_label -->
              <a
                class="pointer-events-auto"
                href={`/documents/governing/${policy.id}/edit`}
                ><span class="i-mdi-pencil align-middle text-xl text-secondary"
                ></span>
              </a>
            {/if}
          </div>
        {/each}
      </div>
    </div>
    <div>
      <h1 class="my-3 text-2xl font-bold">
        {m.documents_governing_guidelines()}
      </h1>
      <div class="flex flex-col gap-2">
        {#each data.guidelines as guideline}
          <div class="flex items-center gap-1">
            <FileWithDownload
              name={guideline.title}
              url={getPdfApiUrl(guideline.url)}
              onClick={onPdfClick}
            />
            {#if isAuthorized(apiNames.GOVERNING_DOCUMENT.DELETE, data.user) && isEditing}
              <DeleteFileForm
                fileId={guideline.id}
                fileName={guideline.title}
                data={data.deleteForm}
              />
            {/if}
            {#if isAuthorized(apiNames.GOVERNING_DOCUMENT.UPDATE, data.user) && isEditing}
              <!-- svelte-ignore a11y_consider_explicit_label -->
              <a
                class="pointer-events-auto"
                href={`/documents/governing/${guideline.id}/edit`}
                ><span class="i-mdi-pencil align-middle text-xl text-secondary"
                ></span>
              </a>
            {/if}
          </div>
        {/each}
      </div>
    </div>
    <div>
      <h1 class="my-3 text-2xl font-bold">
        {m.documents_governing_yearSpecificDocuments()}
      </h1>
      <div class="flex flex-col gap-2">
        <Pagination
          class="max-w-md"
          count={currentYear - 1981}
          getPageName={(pageNumber) => (currentYear - pageNumber).toString()}
          getPageNumber={(pageName) => currentYear - +pageName}
          fieldName="year"
        />
        {#each plansOfOperations as planOfOperations}
          <div class="flex items-center gap-1">
            <FileWithDownload
              name={planOfOperations.title}
              url={getPdfApiUrl(planOfOperations.url)}
              onClick={onPdfClick}
            />
            {#if isAuthorized(apiNames.GOVERNING_DOCUMENT.DELETE, data.user) && isEditing}
              <DeleteFileForm
                fileId={planOfOperations.id}
                fileName={planOfOperations.title}
                data={data.deleteForm}
              />
            {/if}
            {#if isAuthorized(apiNames.GOVERNING_DOCUMENT.UPDATE, data.user) && isEditing}
              <!-- svelte-ignore a11y_consider_explicit_label -->
              <a
                class="pointer-events-auto"
                href={`/documents/governing/${planOfOperations.id}/edit`}
                ><span class="i-mdi-pencil align-middle text-xl text-secondary"
                ></span>
              </a>
            {/if}
          </div>
        {/each}
        {#each frameworkBudgets as frameworkBudget}
          <div class="flex items-center gap-1">
            <FileWithDownload
              name={frameworkBudget.title}
              url={getPdfApiUrl(frameworkBudget.url)}
              onClick={onPdfClick}
            />
            {#if isAuthorized(apiNames.GOVERNING_DOCUMENT.DELETE, data.user) && isEditing}
              <DeleteFileForm
                fileId={frameworkBudget.id}
                fileName={frameworkBudget.title}
                data={data.deleteForm}
              />
            {/if}
            {#if isAuthorized(apiNames.GOVERNING_DOCUMENT.UPDATE, data.user) && isEditing}
              <!-- svelte-ignore a11y_consider_explicit_label -->
              <a
                class="pointer-events-auto"
                href={`/documents/governing/${frameworkBudget.id}/edit`}
                ><span class="i-mdi-pencil align-middle text-xl text-secondary"
                ></span>
              </a>
            {/if}
          </div>
        {/each}
        {#each strategicGoals as strategicGoal}
          <div class="flex items-center gap-1">
            <FileWithDownload
              name={strategicGoal.title}
              url={getPdfApiUrl(strategicGoal.url)}
              onClick={onPdfClick}
            />
            {#if isAuthorized(apiNames.GOVERNING_DOCUMENT.DELETE, data.user) && isEditing}
              <DeleteFileForm
                fileId={strategicGoal.id}
                fileName={strategicGoal.title}
                data={data.deleteForm}
              />
            {/if}
            {#if isAuthorized(apiNames.GOVERNING_DOCUMENT.UPDATE, data.user) && isEditing}
              <!-- svelte-ignore a11y_consider_explicit_label -->
              <a
                class="pointer-events-auto"
                href={`/documents/governing/${strategicGoal.id}/edit`}
                ><span class="i-mdi-pencil align-middle text-xl text-secondary"
                ></span>
              </a>
            {/if}
          </div>
        {/each}
      </div>
    </div>
  </div>
</div>

<dialog class="modal modal-middle" bind:this={dialog}>
  <form method="dialog" class="modal-backdrop">
    <!-- svelte-ignore a11y_consider_explicit_label -->
    <button
      class="cursor-auto"
      on:click={() => {
        selectedPdf = null;
      }}
    ></button>
  </form>
  <iframe
    title={m.documents_governing_pdfViewer()}
    src={selectedPdf}
    class="menu modal-box h-full max-h-[95vh] w-full max-w-[70vw]"
    on:error={() => dialog.close()}
  ></iframe>
</dialog>
