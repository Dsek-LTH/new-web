<script lang="ts">
  import SetPageTitle from "$lib/components/nav/SetPageTitle.svelte";
  import * as m from "$paraglide/messages";
  import { isAuthorized } from "$lib/utils/authorization";
  import { page } from "$app/stores";
  import apiNames from "$lib/utils/apiNames";
  import StatusComponent from "./StatusComponent.svelte";
  import dayjs from "dayjs";
  import ConfirmDialog from "$lib/components/ConfirmDialog.svelte";
  import BookingCalendar from "./BookingCalendar.svelte";

  export let data;
  let deleteModal: HTMLDialogElement;
  let selectedBooking: (typeof data.bookingRequests)[number] | undefined =
    undefined;
</script>

<SetPageTitle title={m.bookings()} />

<div class="mb-8 flex gap-4">
  <a class="btn btn-primary" href="/booking/create">
    + {m.booking_createBooking()}
  </a>

  {#if isAuthorized(apiNames.BOOKINGS.UPDATE, $page.data.user)}
    <a class="btn" href="/booking/admin">
      {m.booking_manageBookings()}
    </a>
  {/if}
</div>

{#if data.bookingRequests.length === 0}
  <BookingCalendar {...data} />
{:else}
  <div class="overflow-x-auto">
    <table class="table">
      <thead>
        <tr class="bg-base-200">
          <th>{m.booking_booking()}</th>
          <th>{m.booking_from()}</th>
          <th>{m.booking_until()}</th>
          <th>{m.booking_event()}</th>
          <th>{m.booking_status()}</th>
          <th></th>
        </tr>
      </thead>

      <tbody>
        {#each data.bookingRequests as bookingRequest (bookingRequest.id)}
          <tr>
            <td>
              {#each bookingRequest.bookables.map((a) => a.name) as bookable}
                <p class="min-w-max">{bookable}</p>
              {/each}
            </td>
            <td>{dayjs(bookingRequest.start).format("YYYY-MM-DD HH:mm")}</td>
            <td>{dayjs(bookingRequest.end).format("YYYY-MM-DD HH:mm")}</td>
            <td>{bookingRequest.event}</td>
            <td>
              <StatusComponent
                bind:bookingRequest
                bind:bookingRequests={data.bookingRequests}
                class="flex-col"
              />
            </td>
            <td>
              <div class="form-control gap-2">
                <a
                  href="/booking/{bookingRequest.id}/edit"
                  class="btn btn-xs px-8"
                >
                  {m.booking_edit()}
                </a>
                <button
                  class="btn btn-xs px-8"
                  on:click={() => {
                    deleteModal?.showModal();
                    selectedBooking = bookingRequest;
                  }}
                >
                  {m.booking_delete()}
                </button>
              </div>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
{/if}

<ConfirmDialog
  bind:modal={deleteModal}
  title={m.booking_deleteTitle()}
  confirmText={m.booking_delete()}
  confirmClass="btn-error"
  formTarget="/booking?/delete"
  formData={{ id: selectedBooking?.id ?? "" }}
>
  <p slot="description">
    {#if selectedBooking}
      <!-- eslint-disable-next-line svelte/no-at-html-tags -->
      {@html m.booking_deleteMyAreYouSure({
        bookables: selectedBooking?.bookables
          .map(({ name }) => name)
          .join(", "),
      })}
    {/if}
  </p>
</ConfirmDialog>
