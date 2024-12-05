<script lang="ts">
  import * as m from "$paraglide/messages";
  import SetPageTitle from "$lib/components/nav/SetPageTitle.svelte";
  import BookingEditor from "../../BookingEditor.svelte";
  import type { PageData } from "./$types";
  import { isAuthorized } from "$lib/utils/authorization";
  import apiNames from "$lib/utils/apiNames";
  import { page } from "$app/stores";

  export let data: PageData;
  const isPending = data.booking.status === "PENDING";
  const isAdmin = isAuthorized(apiNames.BOOKINGS.UPDATE, $page.data.user);
</script>

<SetPageTitle title={m.booking_editBooking()} />

{#if !(isAdmin || isPending)}
  <div role="alert" class="alert alert-warning mx-auto mb-8 max-w-5xl">
    <span class="i-mdi-warning"></span>
    <span>{m.booking_editBookingWarning()}</span>
  </div>
{/if}

<BookingEditor {data} mode="edit" />
