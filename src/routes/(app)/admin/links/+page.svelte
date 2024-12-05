<script lang="ts">
  // eslint-disable-next-line no-restricted-imports -- project specific does not work, and goto is only used to update URLSearchParams
  import { goto } from "$app/navigation";
  import PageHeader from "$lib/components/nav/PageHeader.svelte";
  import Pagination from "$lib/components/Pagination.svelte";
  import type { ShlinkShortUrlsOrder } from "@shlinkio/shlink-js-sdk/api-contract";
  import type { PageData } from "./$types";
  import { page } from "$app/stores";
  import TagSelector from "$lib/components/TagSelector.svelte";
  import type { Tag } from "@prisma/client";
  import SearchBar from "$lib/components/SearchBar.svelte";
  import { enhance } from "$app/forms";
  import TagSelectCreate from "./TagSelectCreate.svelte";
  import Input from "$lib/components/Input.svelte";
  import Labeled from "$lib/components/Labeled.svelte";
  import { superForm } from "$lib/utils/client/superForms";
  import * as m from "$paraglide/messages";

  export let data: PageData;

  const {
    form: createLinksForm,
    errors: createLinksErrors,
    constraints: createLinksConstraints,
    enhance: createLinksEnhance,
    formId: createLinksFormId,
  } = superForm(data.createLinksForm, {
    resetForm: true,
  });

  const {
    form: updateLinksForm,
    errors: updateLinksErrors,
    constraints: updateLinksConstraints,
    enhance: updateLinksEnhance,
    formId: updateLinksFormId,
  } = superForm(data.updateLinksForm, {
    onUpdate: ({ form }) => {
      // Close modal on successful submit
      if (form.valid) {
        editModal?.close();
      }
    },
    resetForm: true,
  });

  $: query = new URLSearchParams($page.url.searchParams.toString());

  const setUrlParams = (order: ShlinkShortUrlsOrder) => {
    if (
      query.get("orderBy") === order.field ||
      (!query.has("orderBy") && order.field === "dateCreated")
    ) {
      if (query.has("dir")) {
        query.delete("dir");
      } else {
        query.set("dir", "ASC");
      }
    } else {
      query.delete("dir");
    }
    query.set("orderBy", order.field!);
    goto(`?${query.toString()}`);
  };

  let createSelectedTags: Tag[] = [];

  const tableHeaders: Array<{ order?: ShlinkShortUrlsOrder; title: string }> = [
    { order: { field: "shortCode" }, title: m.admin_links_table_header_slug() },
    { order: { field: "longUrl" }, title: m.admin_links_table_header_url() },
    { title: m.admin_links_table_header_tags() },
    {
      order: { field: "dateCreated" },
      title: m.admin_links_table_header_created(),
    },
    { order: { field: "visits" }, title: m.admin_links_table_header_visits() },
  ];

  let allTags = data.tags.map((t) => ({ id: t, name: t }) as Tag);
  $: allTags = data.tags.map((t) => ({ id: t, name: t }) as Tag);

  let filteredTags = allTags.filter((tag) =>
    $page.url.searchParams.getAll("tags").includes(tag.name),
  );

  let removeModal: HTMLDialogElement;
  let toggleAllCheckBox: HTMLInputElement;
  let checkboxes: boolean[] = [];
  const resetCheckboxes = () => {
    checkboxes = [];
    if (toggleAllCheckBox) {
      toggleAllCheckBox.checked = false;
    }
  };
  $: if (data.domains) {
    resetCheckboxes();
  }

  let editModal: HTMLDialogElement;
  let editModalTags: Tag[] = [];
</script>

<PageHeader title={m.linkShortener()} />

<div class="mb-10 mt-4 rounded-lg md:p-4 lg:mb-4 lg:p-8">
  <h2 class="text-lg font-semibold">{m.admin_links_add_title()}</h2>
  <form
    class="flex flex-col items-stretch gap-2 lg:flex-row lg:items-start"
    action="?/create"
    method="post"
    id={$createLinksFormId}
    use:createLinksEnhance
  >
    <div class="form-control">
      <div class="label">
        <span class="label-text">
          {m.admin_links_add_label_slug()}
          <span class="font-bold">*</span>
        </span>
      </div>
      <label
        class="input input-bordered flex items-center gap-2 hover:border-base-content"
      >
        <p class="opacity-60">link.dsek.se/</p>
        <input
          id="slug"
          name="slug"
          class=""
          bind:value={$createLinksForm.slug}
          placeholder={m.admin_links_add_placeholder_slug()}
          required
          {...$createLinksConstraints}
        />
      </label>
    </div>
    <Input
      name="url"
      label={m.admin_links_add_label_URL()}
      placeholder={m.admin_links_add_placeholder_URL()}
      required
      bind:value={$createLinksForm.url}
      error={$createLinksErrors.url}
      {...$createLinksConstraints}
    />
    <div class="form-control relative">
      <div class="label">
        <span class="label-text"> {m.admin_links_add_label_tags()}* </span>
      </div>
      <TagSelectCreate
        placeholder={m.admin_links_add_placeholder_tags()}
        bind:allTags
        bind:selectedTags={createSelectedTags}
      />
      {#if $createLinksErrors.tags?._errors}
        <div class="label">
          <span class="label-text-alt text-error">
            {#if $createLinksErrors.tags._errors.length > 1}
              {$createLinksErrors.tags[0]}
            {:else}
              {$createLinksErrors.tags?._errors?.join(", ")}
            {/if}
          </span>
        </div>
      {/if}
    </div>
    {#each createSelectedTags as tag (tag.id)}
      <input type="hidden" name="tags" value={tag.name} />
    {/each}
    <Labeled label="Add" invisibleText>
      <button class="btn btn-primary self-end"
        >{m.admin_links_add_submit()}</button
      >
    </Labeled>
  </form>
</div>

<PageHeader title={m.admin_links_table_title()} />

<!-- svelte-ignore a11y_consider_explicit_label -->
<form action="?/delete" method="post" id="form_delete" use:enhance>
  <div class="flex items-end gap-2">
    <button
      type="button"
      class="btn btn-square btn-error place-self-end"
      disabled={checkboxes.every((c) => !c)}
      on:click={() => removeModal?.showModal()}
    >
      <span class="i-mdi-trash-can"></span>
    </button>

    <section class="form-control flex-1 gap-2 md:flex-row md:items-end">
      <TagSelector
        {allTags}
        bind:selectedTags={filteredTags}
        onChange={() => {
          query.delete("tags");
          filteredTags.forEach((t) => query.append("tags", t.name));
          goto(`?${query.toString()}`);
        }}
      />
      <SearchBar />
    </section>
  </div>

  <div class="overflow-x-auto">
    <table class="table my-4">
      <thead>
        <tr class="bg-base-200">
          <th>
            <input
              type="checkbox"
              class="checkbox"
              bind:this={toggleAllCheckBox}
              on:change={(e) =>
                (checkboxes = [...Array(data.domains.length).keys()].map(
                  () => e.currentTarget.checked,
                ))}
            />
          </th>
          {#each tableHeaders as th (th.title)}
            {#if th.order?.field}
              <th
                on:click={() => setUrlParams({ field: th.order?.field })}
                class="cursor-pointer"
              >
                {th.title}
                {#if query.get("orderBy") === th.order.field || (!query.has("orderBy") && th.order.field === "dateCreated")}
                  {#if query.get("dir") === "ASC"}
                    <span class="i-mdi-triangle-down"></span>
                  {:else}
                    <span class="i-mdi-triangle"></span>
                  {/if}
                {/if}
              </th>
            {:else}
              <th class="cursor-text">
                {th.title}
              </th>
            {/if}
          {/each}
          <th></th>
        </tr>
      </thead>
      <tbody>
        {#each data.domains as d, i (d.shortCode)}
          {@const date = new Date(d.dateCreated)}
          <tr>
            <td>
              <input
                type="checkbox"
                class="checkbox"
                name="deleting"
                value={d.shortCode}
                bind:checked={checkboxes[i]}
              />
            </td>
            <td class="font-medium">
              {d.shortCode}
            </td>
            <td>
              <a href={d.longUrl}>
                {d.longUrl}
              </a>
            </td>
            <td>
              {d.tags.join(", ")}
            </td>
            <td>
              {date.getFullYear()}-{String(date.getMonth()).padStart(
                2,
                "0",
              )}-{String(date.getDate()).padStart(2, "0")}
            </td>
            <td>
              <div
                class="tooltip"
                data-tip={`nonBots: ${d.visitsSummary?.nonBots}, bots: ${d.visitsSummary?.bots}`}
              >
                {d.visitsSummary?.total}
              </div>
            </td>
            <td>
              <button
                type="button"
                class="btn btn-square btn-sm"
                on:click={() => {
                  $updateLinksForm.slug = d.shortCode;
                  $updateLinksForm.url = d.longUrl;
                  editModalTags = d.tags?.map((t) => ({
                    id: t,
                    name: t,
                    color: null,
                    isDefault: null,
                    nameEn: null,
                  }));
                  editModal.showModal();
                }}
              >
                <span class="i-mdi-pencil"></span>
              </button>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</form>

<dialog bind:this={removeModal} class="modal modal-bottom sm:modal-middle">
  <div class="modal-box">
    <h3 class="text-lg font-bold">{m.admin_links_remove_title()}</h3>
    <p class="py-4">
      {m.admin_links_remove_confirmation({
        amount: checkboxes.filter((c) => c).length,
      })}
    </p>
    <p class="text-xs text-base-content/60">
      {data.domains
        .filter((_, i) => checkboxes.at(i))
        .map(({ shortCode }) => shortCode)
        .join(", ")}
    </p>
    <div class="modal-action">
      <button
        type="submit"
        form="form_delete"
        class="btn btn-error"
        on:click={() => removeModal?.close()}
      >
        {m.admin_links_remove_submit()}
      </button>
    </div>
  </div>
  <form method="dialog" class="modal-backdrop">
    <!-- svelte-ignore a11y_consider_explicit_label -->
    <!-- svelte-ignore element_invalid_self_closing_tag -->
    <button class="cursor-auto" />
  </form>
</dialog>

<dialog bind:this={editModal} class="modal modal-top sm:modal-middle">
  <div class="modal-box !overflow-y-visible">
    <form
      action="?/update"
      method="post"
      id={$updateLinksFormId}
      use:updateLinksEnhance
    >
      <h3 class="text-lg font-bold">
        {m.admin_links_edit_title()} '{$updateLinksForm.slug}'
      </h3>
      <input type="hidden" name="slug" bind:value={$updateLinksForm.slug} />
      <Input
        name="url"
        label="URL"
        required
        bind:value={$updateLinksForm.url}
        error={$updateLinksErrors.url}
        {...$updateLinksConstraints.url}
      />
      <div class="form-control relative">
        <div class="label">
          <span class="label-text"> Tags* </span>
        </div>
        <TagSelectCreate {allTags} bind:selectedTags={editModalTags} />
        {#if $updateLinksErrors.tags && $updateLinksErrors.tags._errors}
          <div class="label">
            <span class="label-text-alt text-error">
              {#if $updateLinksErrors.tags._errors.length > 1}
                {$updateLinksErrors.tags[0]}
              {:else}
                {$updateLinksErrors.tags?._errors?.join(", ")}
              {/if}
            </span>
          </div>
        {/if}
      </div>
      {#each editModalTags as tag (tag.id)}
        <input type="hidden" name="tags" value={tag.name} />
      {/each}
      <div class="modal-action">
        <button type="button" class="btn" on:click={() => editModal?.close()}>
          {m.admin_links_edit_cancel()}
        </button>
        <button type="submit" class="btn btn-primary">
          {m.admin_links_edit_submit()}
        </button>
      </div>
    </form>
  </div>
</dialog>

<!-- TODO: Copy Shlink Admin UI's scroll effect? -->
<Pagination count={data.pagination.pagesCount} />
