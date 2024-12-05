<script lang="ts">
  import FormCheckbox from "$lib/components/forms/FormCheckbox.svelte";
  import FormDateInput from "$lib/components/forms/FormDateInput.svelte";
  import FormInput from "$lib/components/forms/FormInput.svelte";
  import FormSelect from "$lib/components/forms/FormSelect.svelte";
  import FormSubmitButton from "$lib/components/forms/FormSubmitButton.svelte";
  import Labeled from "$lib/components/Labeled.svelte";
  import TagChip from "$lib/components/TagChip.svelte";
  import TagSelector from "$lib/components/TagSelector.svelte";
  import { type EventSchema } from "$lib/events/schema";
  import { superForm } from "$lib/utils/client/superForms";
  import { recurringTypes } from "$lib/utils/events";
  import * as m from "$paraglide/messages";
  import type { Tag } from "@prisma/client";
  import type { SuperValidated } from "sveltekit-superforms";
  import Event from "./Event.svelte";
  import LangTabs from "$lib/components/layout/LangTabs.svelte";
  import FormFileInput from "$lib/components/forms/FormFileInput.svelte";
  import FormMarkdown from "$lib/components/forms/FormMarkdown.svelte";

  export let recurringParentId: string | null;
  export let creating = false;
  export let data: SuperValidated<
    EventSchema & { editType: "THIS" | "FUTURE" | "ALL" | undefined }
  >;
  const superform = superForm(data, {
    dataType: "json",
  });
  const { form, errors, enhance } = superform;
  export let allTags: Tag[];
  $: if ($errors) console.log($errors);
  let activeTab: "sv" | "en";
  let modal: HTMLDialogElement;
</script>

<main
  class="flex w-screen flex-col gap-8 px-4 pt-8 lg:flex-row lg:px-8 [&>*]:flex-1"
>
  <section>
    <form
      method="POST"
      class="form-control items-start gap-2"
      use:enhance
      enctype="multipart/form-data"
      id="editForm"
    >
      <slot name="form-start" />
      <LangTabs bind:activeTab class="self-stretch">
        <svelte:fragment slot="sv">
          <FormInput {superform} label={m.events_title()} field="title" />
          <FormInput
            {superform}
            label={m.events_subtitle()}
            field="shortDescription"
          />
          <FormMarkdown
            {superform}
            label={m.events_description()}
            field="description"
            class="min-h-[10rem]"
            placeholder={m.events_description()}
          /></svelte:fragment
        >
        <svelte:fragment slot="en">
          <FormInput {superform} label={m.events_title()} field="titleEn" />
          <FormInput
            {superform}
            label={m.events_subtitle()}
            field="shortDescriptionEn"
          />
          <FormMarkdown
            {superform}
            label={m.events_description()}
            field="descriptionEn"
            class="min-h-[10rem]"
            placeholder={m.events_description()}
          />
        </svelte:fragment>
      </LangTabs>
      <div
        class="flex flex-row justify-between gap-4 self-stretch [&>*]:flex-1"
      >
        <FormInput {superform} label={m.events_organizer()} field="organizer" />
        <FormInput {superform} label={m.events_location()} field="location" />
        <FormInput {superform} label={m.events_link()} field="link" />
      </div>
      <div
        class="flex flex-row justify-between gap-4 self-stretch [&>*]:flex-1"
      >
        <FormDateInput
          {superform}
          label={m.events_startTime()}
          placeholder={m.events_startTime()}
          field="startDatetime"
        />
        <FormDateInput
          {superform}
          label={m.events_endTime()}
          placeholder={m.events_endTime()}
          field="endDatetime"
        />
      </div>

      <FormFileInput {superform} field="image" label="Bild" accept="image/*" />
      <FormInput
        {superform}
        field="imageUrl"
        label="Bild (url)"
        accept="image/*"
      />

      <FormCheckbox
        {superform}
        field="alarmActive"
        label={m.events_create_alarmActive()}
      />
      <FormCheckbox
        {superform}
        field="isRecurring"
        disabled={!creating}
        label={m.events_recurringEvent()}
      />
      {#if $form.isRecurring}
        <div class="flex flex-row justify-between gap-4 [&>*]:flex-1">
          <FormSelect
            fullWidth
            options={Object.entries(recurringTypes).map((type) => ({
              label: type[1],
              value: type[0],
            }))}
            {superform}
            field="recurringType"
            label={m.events_create_howOften()}
            disabled={!creating}
          />
          <FormDateInput
            {superform}
            label={m.events_create_lastDate()}
            field="recurringEndDatetime"
            disabled={!creating}
            onlyDate
          />
        </div>
      {/if}
      <FormCheckbox
        {superform}
        field="isCancelled"
        label={m.events_cancelEvent()}
      />

      <div class="flex w-full flex-col items-stretch">
        <Labeled
          for="tags"
          label={m.events_tags()}
          error={$errors.tags?._errors?.join(", ")}
        />
        <TagSelector name="tags" {allTags} bind:selectedTags={$form.tags} />
      </div>
      <slot name="form-end" />
      {#if recurringParentId !== null && !creating}
        <button
          type="button"
          class="btn btn-primary my-4"
          title="Radera"
          on:click={() => {
            modal.showModal();
          }}
        >
          {m.save()}
        </button>
      {:else}
        <div class="my-4 flex items-center">
          <FormSubmitButton {superform} class="btn btn-primary h-full">
            {creating ? m.news_publish() : m.save()}
          </FormSubmitButton>
          {#if $form.isCancelled}
            <div role="alert" class="alert alert-warning ml-4">
              <span class="i-mdi-alert-outline size-6"></span>
              <span>{m.events_cancellingAlert()}</span>
            </div>
          {/if}
        </div>
      {/if}
    </form>
    <slot name="error" />
  </section>
  <section>
    <span class="italic">{m.events_create_preview()}</span>
    <Event
      event={{
        ...$form,
        title:
          activeTab === "en" && $form.titleEn ? $form.titleEn : $form.title,
        shortDescription:
          activeTab === "en" && $form.shortDescriptionEn
            ? $form.shortDescriptionEn
            : $form.shortDescription,
        description:
          activeTab === "en" && $form.descriptionEn
            ? $form.descriptionEn
            : $form.description,
        imageUrl: $form.image
          ? URL.createObjectURL($form.image)
          : ($form.imageUrl ?? null),
      }}
    >
      <div slot="tags" class="flex flex-row flex-wrap gap-2">
        {#each $form.tags as selectedTag}
          {@const tag = allTags.find((t) => t.id === selectedTag.id)}
          <TagChip {tag} />
        {/each}
      </div>
    </Event>
  </section>
</main>

<dialog class="modal" bind:this={modal}>
  <div class="modal-box">
    <h3 class="text-lg font-bold">{m.events_thisIsRecurring()}</h3>
    <div class="py-4">
      <div class="form-control">
        <label class="label cursor-pointer">
          <span class="label-text">
            <!-- eslint-disable-next-line svelte/no-at-html-tags -->
            {@html m.events_onlyEditThis()}
          </span>
          <input
            type="radio"
            name="editType"
            class="radio"
            bind:group={$form.editType}
            value={"THIS"}
          />
        </label>
      </div>
      <div class="form-control">
        <label class="label cursor-pointer">
          <span class="label-text">
            <!-- eslint-disable-next-line svelte/no-at-html-tags -->
            {@html m.events_editThisAndFuture()}
          </span>
          <input
            type="radio"
            name="editType"
            class="radio"
            bind:group={$form.editType}
            value={"FUTURE"}
          />
        </label>
      </div>
      <div class="form-control">
        <label class="label cursor-pointer">
          <span class="label-text">
            <!-- eslint-disable-next-line svelte/no-at-html-tags -->
            {@html m.events_editAll()}
          </span>
          <input
            type="radio"
            name="editType"
            class="radio"
            bind:group={$form.editType}
            value={"ALL"}
          />
        </label>
      </div>
    </div>
    <FormSubmitButton {superform} class="btn btn-primary my-4">
      {creating ? m.news_publish() : m.save()}
    </FormSubmitButton>
  </div>
  <form method="dialog" class="modal-backdrop">
    <button>close</button>
  </form>
</dialog>
