<script lang="ts">
  import TagChip from "$lib/components/TagChip.svelte";
  import CommentSection from "$lib/components/socials/CommentSection.svelte";
  import * as m from "$paraglide/messages";
  import Event from "../Event.svelte";
  import InterestedGoingButtons from "../InterestedGoingButtons.svelte";
  import InterestedGoingList from "../InterestedGoingList.svelte";

  import SetPageTitle from "$lib/components/nav/SetPageTitle.svelte";
  import { superForm } from "$lib/utils/client/superForms";
  import type { PageData } from "./$types";

  export let data: PageData;
  const { enhance, form } = superForm(data.removeEventForm);
  $: event = data.event;
  let modal: HTMLDialogElement;
  let submitString: "submit" | "button";
  $: submitString = event.recurringParentId != undefined ? "button" : "submit";
</script>

<SetPageTitle title={event.title} />

<Event {event}>
  <!-- svelte-ignore a11y_consider_explicit_label -->
  <div slot="actions" class="flex flex-row">
    {#if data.canEdit}
      <a
        href="/events/{event.slug}/edit"
        class="btn btn-square btn-ghost btn-md"
        title={m.events_edit()}
      >
        <span class="i-mdi-edit text-xl"></span>
      </a>
    {/if}
    {#if data.canDelete}
      <form method="POST" action="?/removeEvent" id="removeEvent" use:enhance>
        <button
          type={submitString}
          class="btn btn-square btn-ghost btn-md"
          title="Radera"
          on:click={() => {
            if (event.recurringParentId !== null) {
              modal.showModal();
            }
          }}
        >
          <span class="i-mdi-delete text-xl"></span>
        </button>
      </form>
    {/if}
  </div>

  <div slot="tags" class="flex flex-row flex-wrap gap-2">
    {#each event.tags as tag}
      <TagChip {tag} />
    {/each}
  </div>

  <div slot="buttons">
    <InterestedGoingButtons
      eventId={event.id}
      interestedGoingForm={data.interestedGoingForm}
      interested={event.interested}
      going={event.going}
    />
  </div>

  <div slot="after">
    <InterestedGoingList going={event.going} interested={event.interested} />
    <div class="mt-4 flex flex-col gap-2">
      <CommentSection
        type="EVENT"
        comments={event.comments}
        taggedMembers={data.allTaggedMembers}
        commentForm={data.commentForm}
        removeCommentForm={data.removeCommentForm}
      />
    </div>
  </div>
</Event>

<dialog class="modal" bind:this={modal}>
  <div class="modal-box">
    <h3 class="text-lg font-bold">{m.events_thisIsRecurring()}</h3>
    <div class="py-4">
      <div class="form-control">
        <label class="label cursor-pointer">
          <span class="label-text">
            <!-- eslint-disable-next-line svelte/no-at-html-tags -->
            {@html m.events_deleteThisEvent()}
          </span>
          <input
            type="radio"
            name="removeType"
            class="radio"
            bind:group={$form.removeType}
            value={"THIS"}
          />
        </label>
      </div>
      <div class="form-control">
        <label class="label cursor-pointer">
          <span class="label-text">
            <!-- eslint-disable-next-line svelte/no-at-html-tags -->
            {@html m.events_deleteThisAndFutureEvents()}
          </span>
          <input
            type="radio"
            name="removeType"
            class="radio"
            bind:group={$form.removeType}
            value={"FUTURE"}
          />
        </label>
      </div>
      <div class="form-control">
        <label class="label cursor-pointer">
          <span class="label-text">
            <!-- eslint-disable-next-line svelte/no-at-html-tags -->
            {@html m.events_deleteAllEvents()}
          </span>
          <input
            type="radio"
            name="removeType"
            class="radio"
            bind:group={$form.removeType}
            value={"ALL"}
          />
        </label>
      </div>
    </div>
    <div class="modal-action">
      <button
        class="btn btn-error"
        type="submit"
        form="removeEvent"
        on:click={() => {
          modal.close();
        }}
      >
        {m.events_delete()}
      </button>
    </div>
  </div>
  <form method="dialog" class="modal-backdrop">
    <button>close</button>
  </form>
</dialog>
