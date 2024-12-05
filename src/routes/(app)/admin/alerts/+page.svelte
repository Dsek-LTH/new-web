<script lang="ts">
  import { enhance } from "$app/forms";
  import type { Alert } from "@prisma/client";
  import dayjs from "dayjs";
  import * as m from "$paraglide/messages";
  import SetPageTitle from "$lib/components/nav/SetPageTitle.svelte";

  export let data;

  let removeModal: HTMLDialogElement | undefined = undefined;
  let selectedAlert: Alert | undefined = undefined;
</script>

<SetPageTitle title="Alerts" />

<form
  method="POST"
  class="flex w-full flex-col items-center gap-2"
  action="?/create"
>
  <p>{m.admin_alerts_info()}</p>
  <input
    type="text"
    name="message"
    placeholder={m.admin_alerts_messageSwedish()}
    class="input input-bordered w-full max-w-lg"
  />
  <input
    type="text"
    name="messageEn"
    placeholder={m.admin_alerts_messageEnglish()}
    class="input input-bordered w-full max-w-lg"
  />
  <select name="severity" class="select select-bordered w-full max-w-lg">
    <option disabled selected>{m.admin_alerts_severity()}</option>
    <option value="info">{m.admin_alerts_severityInfo()}</option>
    <option value="success">{m.admin_alerts_severitySuccess()}</option>
    <option value="warning">{m.admin_alerts_severityWarning()}</option>
    <option value="error">{m.admin_alerts_severityError()}</option>
  </select>
  <button class="btn w-full max-w-lg">{m.admin_alerts_create()}</button>
</form>
<div class="divider">{m.admin_alerts_activeAlerts()}</div>
<table class="table">
  <thead>
    <tr>
      <th>{m.admin_alerts_severity()}</th>
      <th>{m.admin_alerts_message()}</th>
      <th>{m.admin_alerts_created()}</th>
      <th></th>
    </tr>
  </thead>

  <tbody>
    {#each data.alert as alert}
      <tr>
        <th class="capitalize">{alert.severity}</th>
        <td>{alert.message}</td>
        <td>{dayjs(alert.createdAt).format("YYYY-MM-DD HH:mm:ss")}</td>
        <td>
          <!-- svelte-ignore a11y_consider_explicit_label -->
          <button
            class="btn btn-square"
            on:click={() => {
              selectedAlert = alert;
              removeModal?.showModal();
            }}
          >
            <span class="i-mdi-delete text-xl"></span>
          </button>
        </td>
      </tr>
    {/each}
  </tbody>
</table>

<dialog bind:this={removeModal} class="modal modal-bottom sm:modal-middle">
  <div class="modal-box">
    <h3 class="text-lg font-bold">{m.admin_alerts_removeAlert()}</h3>
    <p class="py-4">{m.admin_alerts_removeAreYouSure()}</p>
    <p class="text-xs text-base-content/60">{selectedAlert?.message}</p>
    <div class="modal-action">
      <form method="POST" action="?/delete" use:enhance>
        <input type="hidden" name="id" value={selectedAlert?.id} />
        <button
          type="submit"
          class="btn btn-error"
          on:click={() => removeModal?.close()}
        >
          {m.admin_alerts_remove()}
        </button>
      </form>
    </div>
  </div>
  <form method="dialog" class="modal-backdrop">
    <!-- svelte-ignore a11y_consider_explicit_label -->
    <button class="cursor-auto"></button>
  </form>
</dialog>
