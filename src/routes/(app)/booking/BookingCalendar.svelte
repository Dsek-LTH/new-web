<script lang="ts">
  // @ts-nocheck
  // We need this to suppress an error on the the Calendar component
  // TODO: update @event-calendar/core when they start supporting svelte 5
  import { twMerge } from "tailwind-merge";
  import Calendar from "@event-calendar/core";
  import TimeGrid from "@event-calendar/resource-timeline";
  import "./BookingCalendar.css";
  import { getFullName } from "$lib/utils/client/member";
  import dayjs from "dayjs";
  import { onMount } from "svelte";
  import type { Bookable, BookingRequest, Member } from "@prisma/client";
  import * as m from "$paraglide/messages";

  const slotWidth = 150;

  export let bookingRequests: Array<BookingRequest & { bookables: Bookable[] }>;
  export let bookables: Bookable[];
  let clazz = "";
  export { clazz as class };

  let plugins = [TimeGrid];
  let options: Calendar.Options = {
    view: "resourceTimelineMonth",
    events: bookingRequests
      .filter((booking) => booking.start !== null && booking.end !== null)
      .map((booking) => ({
        id: booking.id,
        start: booking.start as Date,
        end: booking.end as Date,
        title: booking.event ?? "",
        resourceIds: booking.bookables.map((bookable) => bookable.id),
        extendedProps: { ...booking },
      })),
    resources: bookables.map((bookable) => ({
      id: bookable.id,
      title: bookable.name,
    })),
    slotWidth,
    eventContent: (info) => {
      const startTime = dayjs(info.event.start).format("HH:mm");
      const endTime = dayjs(info.event.end).format("HH:mm");
      const eventTitle = info.event.title;
      const bookerName = getFullName(
        info.event.extendedProps["booker"] as Member,
        {
          hideNickname: true,
        },
      );
      const status = info.event.extendedProps["status"];
      const statusClass = (() => {
        switch (status) {
          case "ACCEPTED":
            return "bg-success dark:text-black";
          case "DENIED":
            return "bg-error dark:text-black";
          case "PENDING":
            return "bg-info dark:text-black";
          default:
            return "bg-primary";
        }
      })();

      return {
        html: `
        <div class="${twMerge("overflow-hidden w-full shadow-md rounded *:text-nowrap p-2", statusClass)}">
          <strong>${startTime} - ${endTime}</strong>
          <p>${bookerName}</p>
          <i title="${eventTitle}" class="text-xs opacity-60">${eventTitle}</i>
        </div>
      `,
      };
    },
  };

  onMount(() => {
    function scrollToToday() {
      const scrollEl = document.querySelector(".ec-body");
      if (scrollEl) {
        const x = slotWidth * (new Date().getDate() - 1);
        scrollEl.scrollTo({
          left: x,
          behavior: "smooth",
        });
        return true;
      }
      return false;
    }

    setTimeout(scrollToToday, 300);
  });
</script>

<div class={clazz} style="--slot-width: {slotWidth}px">
  <Calendar {plugins} {options} />
</div>

<slot name="legend">
  <div class="mt-8">
    <div class="badge badge-success">
      <span class="i-mdi-check-circle mr-1"></span>{m.booking_accepted()}
    </div>
    <div class="badge badge-error">
      <span class="i-mdi-denied mr-1"></span>{m.booking_denied()}
    </div>
    <div class="badge badge-info">
      <span class="i-mdi-hourglass mr-1"></span>{m.booking_pending()}
    </div>
  </div>
</slot>
