<script lang="ts">
  import { type Infer, type SuperValidated } from "sveltekit-superforms";
  import type { BookingSchema } from "./schema";
  import { superForm } from "$lib/utils/client/superForms";
  import * as m from "$paraglide/messages";
  import type { Bookable, BookingRequest } from "@prisma/client";
  import StatusComponent from "./StatusComponent.svelte";

  type BookingRequestWithBookables = BookingRequest & { bookables: Bookable[] };
  export let data: {
    form: SuperValidated<Infer<BookingSchema>>;
    bookables: Bookable[];
    booking?: BookingRequestWithBookables;
    allBookingRequests?: BookingRequestWithBookables[];
  };

  $: bookingRequest = data.booking;

  const { form, errors, enhance, constraints } = superForm(data.form);
  export let mode: "create" | "edit" | "review" = "create";

  let start = $form.start;
  let end = $form.end;

  const boardRoomId = "99854837-fdb9-4dba-85fc-86a5c514253c";
  $: showBoardRooomWarning = $form.bookables.includes(boardRoomId);

  // Ensure that the start date is always before the end date
  function handleStartChange() {
    if (start && end) {
      const startDate = new Date(start);
      const endDate = new Date(end);

      const localStartDate = new Date(
        startDate.getTime() - startDate.getTimezoneOffset() * 60000,
      );
      const localEndDate = new Date(
        endDate.getTime() - endDate.getTimezoneOffset() * 60000,
      );

      if (localStartDate >= localEndDate) {
        localEndDate.setTime(localStartDate.getTime() + 3600000); // Add 1 hour because that is the most likely duration
        end = localEndDate.toISOString().slice(0, 16);
        $form.end = end;
      }
    }
  }

  // Ensure that the end date is always after the start date
  function handleEndChange() {
    if (start && end) {
      const startDate = new Date(start);
      const endDate = new Date(end);

      const localStartDate = new Date(
        startDate.getTime() - startDate.getTimezoneOffset() * 60000,
      );
      const localEndDate = new Date(
        endDate.getTime() - endDate.getTimezoneOffset() * 60000,
      );

      if (localEndDate <= localStartDate) {
        localStartDate.setTime(localEndDate.getTime() - 3600000); // Subtract 1 hour because that is the most likely duration
        start = localStartDate.toISOString().slice(0, 16);
        $form.start = start;
      }
    }
  }
</script>

<form method="POST" use:enhance class="form-control mx-auto max-w-5xl gap-4">
  {#if mode === "review"}
    <div class="flex flex-col gap-5">
      <div class="w-fit">
        <a class="btn" href="/booking/admin">
          <span class="i-mdi-arrow-expand-left"></span>
          {m.booking_goBack()}
        </a>
      </div>
      {#if bookingRequest && data.allBookingRequests}
        <StatusComponent
          bind:bookingRequest
          bind:bookingRequests={data.allBookingRequests}
          class="flex-row"
        />
      {/if}
    </div>
  {/if}
  <fieldset
    class="input-bordered grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] rounded-xl border px-6 py-2"
    class:border-error={$errors.bookables?._errors ?? 0 > 0}
  >
    <legend class="text-xl font-bold">{m.booking_booking()}</legend>
    {#each data.bookables as bookable}
      <label class="label cursor-pointer justify-start gap-4 rounded-lg">
        <input
          type="checkbox"
          class="checkbox"
          name="bookables"
          value={bookable.id}
          bind:group={$form.bookables}
          disabled={mode === "review"}
        />
        <span class="label-text">{bookable.name}</span>
      </label>
    {/each}
  </fieldset>

  {#if showBoardRooomWarning}
    <div role="alert" class="alert alert-warning">
      <span class="i-mdi-alert-outline size-6"></span>
      <span>{m.booking_boardRoomWarning()}</span>
    </div>
  {/if}

  <label>
    <span class="label-text ml-2 font-bold">{m.booking_from()}</span>
    <input
      type="datetime-local"
      name="start"
      placeholder="Start"
      class="input input-bordered w-full"
      bind:value={start}
      on:change={handleStartChange}
      {...$constraints.start}
      disabled={mode === "review"}
    />
  </label>

  <label>
    <span class="label-text ml-2 font-bold">{m.booking_until()}</span>
    <input
      type="datetime-local"
      name="end"
      placeholder="End"
      class="input input-bordered w-full"
      class:border-error={$errors.end}
      bind:value={end}
      on:change={handleEndChange}
      {...$constraints.end}
      disabled={mode === "review"}
    />
  </label>

  <label>
    <span class="label-text ml-2 font-bold">{m.booking_event()}</span>
    <input
      type="text"
      name="name"
      class="input input-bordered w-full"
      bind:value={$form.name}
      {...$constraints.name}
      disabled={mode === "review"}
    />
  </label>

  {#if mode === "review" && bookingRequest}
    <div class="flex *:flex-1">
      <input hidden name="id" type="text" bind:value={bookingRequest.id} />
      <button
        formaction="?/accept"
        class="btn btn-outline btn-success"
        class:btn-disabled={bookingRequest.status === "ACCEPTED"}
        aria-label={m.booking_accept()}
      >
        {m.booking_accept()}
        <span class="i-mdi-check"></span>
      </button>
      <button
        formaction="?/reject"
        class="btn btn-outline btn-error"
        class:btn-disabled={bookingRequest.status === "DENIED"}
        aria-label={m.booking_deny()}
      >
        {m.booking_deny()}
        <span class="i-mdi-close"></span>
      </button>
    </div>
  {/if}

  {#if mode !== "review"}
    <div class="flex *:flex-1">
      <a class="btn" href="/booking">{m.booking_goBack()}</a>
      {#if mode === "edit"}
        <button class="btn btn-primary">{m.save()}</button>
      {:else if mode === "create"}
        <button class="btn btn-primary">{m.booking_create()}</button>
      {/if}
    </div>
  {/if}
</form>
