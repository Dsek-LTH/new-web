<script lang="ts">
  import EventSearch from "$lib/components/EventSearch.svelte";
  import Labeled from "$lib/components/Labeled.svelte";
  import type { TicketSchema } from "$lib/utils/shop/types";
  import type { Event } from "@prisma/client";
  import dayjs from "dayjs";
  import { formFieldProxy, type SuperForm } from "sveltekit-superforms/client";
  export let event: Event | undefined = undefined;
  let isSearching: boolean;
  let handleSearch: (search: string) => void;

  export let superform: SuperForm<TicketSchema>;
  const { value, errors, constraints } = formFieldProxy(superform, "eventId");

  const updateForm = (event: Event | undefined) => {
    if (!event) {
      $value = "";
      return;
    }
    $value = event.id;
  };
  $: updateForm(event);

  $: isSelected = !!event;
</script>

<EventSearch
  bind:handleSearch
  bind:isSearching
  onSelect={(selected) => {
    event = selected;
  }}
>
  <Labeled error={$errors} label="Event">
    <input type="hidden" name="eventId" value={$value} {...$constraints} />
    <div
      class="input input-bordered flex items-center gap-2 {isSelected
        ? 'input-primary'
        : ''}"
    >
      <span class="i-mdi-search text-xl"></span>
      <input
        id="event"
        autocomplete="off"
        autocapitalize="off"
        type="text"
        class="grow bg-transparent"
        placeholder="Sök efter evenemang"
        value={event
          ? `${event.title} (${dayjs(event.startDatetime).format("YYYY")}, ${
              event.slug ?? event.id
            })`
          : ""}
        on:input={(e) => {
          event = undefined;
          handleSearch(e.currentTarget.value);
        }}
        required
        {...$$restProps}
      />
      <span
        class="loading loading-spinner loading-md text-primary transition-opacity opacity-{isSearching
          ? '100'
          : '0'}"
      ></span>
    </div>
  </Labeled>
</EventSearch>
