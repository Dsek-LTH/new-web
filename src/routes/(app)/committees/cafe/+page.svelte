<script lang="ts">
  import { enhance } from "$app/forms";
  import * as m from "$paraglide/messages";
  import { languageTag } from "$paraglide/runtime";

  import CommitteePage from "../CommitteePage.svelte";
  import type { PageData } from "./$types";
  export let data: PageData;
  let isEditing = false;

  const getWeekdayName = (weekday: number): string => {
    let date = new Date();
    // we assign monday to 0, not sunday
    while (date.getDay() - 1 !== weekday) {
      date.setDate(date.getDate() + 1);
    }
    return date.toLocaleString(languageTag(), {
      weekday: "long",
    });
  };
</script>

<CommitteePage {data} bind:isEditing>
  <div
    slot="before"
    class="card float-right ml-4 w-full border border-primary bg-base-100 p-6 shadow-xl lg:max-w-80"
  >
    <h2 class="mb-2 p-2 font-bold lg:text-xl">
      {m.committees_cafe_openinghours()}
      <span class="block text-sm font-light text-base-content text-opacity-40"
        >{m.committees_cafe_thecafe()}</span
      >
    </h2>
    <ol>
      {#each data.openingHours as openingHour, i}
        {@const weekday = getWeekdayName(
          Number.parseInt(openingHour.name.split(":").pop() ?? ""),
        )}
        {@const isToday = new Date().getDay() - 1 === i}
        <li
          class="flex gap-4 bg-opacity-10 p-2"
          class:bg-primary={isToday}
          class:font-bold={isToday}
        >
          <p class="flex-1 self-center capitalize">{weekday}</p>
          {#if isEditing}
            <form
              class="flex gap-4"
              action="?/updateHours"
              method="POST"
              use:enhance={() => {
                return ({ update }) => update({ reset: false });
              }}
            >
              <input
                hidden
                type="text"
                name="markdownSlug"
                value={openingHour.name}
              />
              <input
                type="text"
                class="input input-bordered font-normal"
                name="markdown"
                value={openingHour.markdown}
                size="8"
              />
              <!-- svelte-ignore a11y_consider_explicit_label -->
              <button
                class="btn btn-outline btn-primary btn-sm h-auto"
                type="submit"
              >
                <span class="i-mdi-content-save text-base"></span>
              </button>
            </form>
          {:else}
            {openingHour.markdown}
          {/if}
        </li>
      {/each}
    </ol>
  </div>
</CommitteePage>
