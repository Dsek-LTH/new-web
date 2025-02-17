<script lang="ts">
  import { page } from "$app/stores";
  import dayjs from "dayjs";
  import { invalidateAll } from "$app/navigation";

  const slug = $page.params["slug"];
  export let data;

  $: consumable = data.consumable;
  $: shoppable = consumable.shoppable;
  $: member = consumable.member;

  import { enhance } from "$app/forms";

  let submitting = false;
</script>

<div class="container mx-auto p-4">
  <div class="card bg-base-200 shadow-xl">
    <div class="card-body">
      <h2 class="card-title">{shoppable.title}</h2>

      <div class="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div class="stat">
          <div class="stat-title">Status</div>
          <div class="stat-value text-lg">
            {#if consumable.shoppableId !== slug}
              <span class="text-error">Invalid - Wrong event</span>
              <br />
              <span class="text-sm font-normal"
                >Ticket not valid for this event</span
              >
            {:else if consumable.consumedAt}
              <span class="text-error">Invalid - Already consumed</span>
            {:else if consumable.purchasedAt}
              <span class="text-success">Valid</span>
            {:else}
              <span class="text-error">Invalid - Not purchased</span>
            {/if}
          </div>
          {#if consumable.consumedAt}
            <div class="stat-desc">
              Consumed at {dayjs(consumable.consumedAt).format(
                "YYYY-MM-DD HH:mm",
              )}
            </div>
          {/if}
        </div>

        <div class="stat">
          <div class="stat-title">Owner</div>
          <div class="stat-value text-lg">
            {#if member}
              <td class="flex items-center gap-3">
                <div class="avatar">
                  <div class="w-6 rounded-full">
                    {#if member.picturePath}
                      <img src={member.picturePath} alt="Profile avatar" />
                    {:else}
                      <span class="i-mdi-account-circle h-6 w-6"></span>
                    {/if}
                  </div>
                </div>
                <p>
                  {member.firstName}
                  {member.lastName}
                  <span class="text-stone-500">({member.studentId})</span>
                </p>
              </td>
            {:else if consumable.externalCustomerEmail}
              {consumable.externalCustomerEmail}
            {:else}
              Unknown
            {/if}
          </div>
        </div>
      </div>

      <div class="divider">Event Details</div>
      <div class="space-y-2">
        <div>
          <span class="font-semibold">Event:</span>
          <span>{shoppable.event.title}</span>
        </div>
        <div>
          <span class="font-semibold">Date:</span>
          <span
            >{dayjs(shoppable.event.startDatetime).format(
              "YYYY-MM-DD HH:mm",
            )}</span
          >
        </div>
        <div>
          <span class="font-semibold">Description:</span>
          <span class="line-clamp-3">
            {shoppable.event.description || "No description available"}
          </span>
        </div>
      </div>

      <div class="card-actions mt-4 flex justify-end gap-4">
        <a class="btn btn-primary" href=".">Open QR Scanner</a>
        <form
          method="POST"
          action="?/consume"
          use:enhance={() => {
            submitting = true;
            return async ({ result }) => {
              submitting = false;
              if (result.type === "success") {
                await invalidateAll();
              }
            };
          }}
        >
          <button
            class="btn btn-secondary"
            disabled={Boolean(consumable.consumedAt) ||
              consumable.shoppableId !== slug ||
              submitting}
          >
            {#if submitting}
              Processing...
            {:else}
              Consume Ticket
            {/if}
          </button>
        </form>
      </div>
    </div>
  </div>
</div>
