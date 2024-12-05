<script lang="ts">
  import dayjs from "dayjs";
  import StatusComponent from "../StatusComponent.svelte";
  import { enhance } from "$app/forms";
  import { getFullName } from "$lib/utils/client/member";
  import MemberAvatar from "$lib/components/socials/MemberAvatar.svelte";
  import * as m from "$paraglide/messages";
  import SetPageTitle from "$lib/components/nav/SetPageTitle.svelte";
  import ConfirmDialog from "$lib/components/ConfirmDialog.svelte";
  export let data;

  let deleteModal: HTMLDialogElement;
  let selectedBooking: (typeof data.bookingRequests)[number] | undefined =
    undefined;
</script>

<SetPageTitle title={m.bookings()} />

<div class="mb-8 flex gap-4">
  <a class="btn" href="/booking">
    <span class="i-mdi-arrow-expand-left"></span>
    {m.booking_goBack()}
  </a>
  <a class="btn" href="/booking/create">
    {m.booking_createBooking()}
  </a>
</div>

<div class="overflow-x-auto">
  <table class="table">
    <thead>
      <tr class="bg-base-200">
        <th>{m.booking_booking()}</th>
        <th>{m.booking_from()}</th>
        <th>{m.booking_until()}</th>
        <th>{m.booking_event()}</th>
        <th>{m.booking_responsible()}</th>
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
          <td>
            <a
              href="/booking/admin/{bookingRequest.id}"
              class="link-hover link"
            >
              {bookingRequest.event}
            </a>
          </td>
          <td>
            <div class="flex items-center gap-2">
              {#if bookingRequest.booker}
                <MemberAvatar
                  member={bookingRequest.booker}
                  class="size-5 flex-shrink-0"
                />
                <a
                  href="/members/{bookingRequest.booker.studentId}"
                  class="link-hover link"
                  >{getFullName(bookingRequest.booker, { hideNickname: true })}
                </a>
              {/if}
            </div>
          </td>
          <td>
            <StatusComponent
              bind:bookingRequest
              bind:bookingRequests={data.bookingRequests}
              class="flex-col"
            />
          </td>
          <td>
            <form
              method="POST"
              use:enhance
              class="flex gap-2"
              id={`form-${bookingRequest.id}`}
            >
              <input
                hidden
                name="id"
                type="text"
                bind:value={bookingRequest.id}
              />
              <button
                formaction="?/accept"
                class="btn btn-outline btn-xs"
                class:btn-disabled={bookingRequest.status === "ACCEPTED"}
                aria-label={m.booking_accept()}
              >
                <span class="i-mdi-check"></span>
              </button>
              <button
                formaction="?/reject"
                class="btn btn-outline btn-xs"
                class:btn-disabled={bookingRequest.status === "DENIED"}
                aria-label={m.booking_deny()}
              >
                <span class="i-mdi-close"></span>
              </button>

              <hr class="mx-2" />

              <a
                href="/booking/{bookingRequest.id}/edit"
                class="btn btn-outline btn-xs"
                aria-label={m.booking_edit()}
              >
                <span class="i-mdi-edit"></span>
              </a>
              <button
                class="btn btn-outline btn-xs"
                type="button"
                aria-label={m.booking_delete()}
                on:click={() => {
                  deleteModal?.showModal();
                  selectedBooking = bookingRequest;
                }}
              >
                <span class="i-mdi-delete"></span>
              </button>
            </form>
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>

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
      {@html m.booking_deleteAreYouSure({
        name: selectedBooking?.booker?.firstName ?? "",
        bookables: selectedBooking?.bookables
          .map(({ name }) => name)
          .join(", "),
      })}
    {/if}
  </p>
</ConfirmDialog>
