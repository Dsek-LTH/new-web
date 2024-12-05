<script lang="ts">
  import { enhance } from "$app/forms";
  import DateInput from "$lib/components/DateInput.svelte";
  import Input from "$lib/components/Input.svelte";
  import Labeled from "$lib/components/Labeled.svelte";
  import LoadingButton from "$lib/components/LoadingButton.svelte";
  import PageHeader from "$lib/components/nav/PageHeader.svelte";
  import type { AdminSetting } from "@prisma/client";
  import { superForm } from "$lib/utils/client/superForms";
  import { isAuthorized } from "$lib/utils/authorization";
  import apiNames from "$lib/utils/apiNames";

  export let data;
  let editingSetting: AdminSetting | null = null;
  const {
    enhance: updateEnhance,
    submitting: updateSubmitting,
    errors: updateErrors,
    constraints: updateConstraints,
  } = superForm(data.updateForm);
  const {
    enhance: nollningEnhance,
    submitting: nollningSubmitting,
    errors: nollningErrors,
    constraints: nollningConstraints,
  } = superForm(data.updateNollningForm);
</script>

<PageHeader title="Admininställningar" />

<div class="flex flex-col gap-4">
  {#if (editingSetting === null && isAuthorized(apiNames.ADMIN.SETTINGS.CREATE, data.user)) || isAuthorized(apiNames.ADMIN.SETTINGS.UPDATE, data.user)}
    <form
      class="form-control gap-2 rounded-box bg-base-300 p-4"
      method="POST"
      use:updateEnhance
      action="?/update"
    >
      {#if editingSetting !== null}
        <div class="flex justify-between">
          <h3 class="text-lg font-semibold">Redigerar</h3>
          <button class="btn btn-ghost" on:click={() => (editingSetting = null)}
            >Sluta redigera
          </button>
        </div>
        <Input
          class="input-disabled pointer-events-none"
          label="Key"
          name="key"
          value={editingSetting.key}
          readonly
        />
        />
      {:else}
        <h3 class="text-lg font-semibold">Skapa ny</h3>
        <Input
          label="Key"
          name="key"
          {...$updateConstraints.key}
          error={$updateErrors.key}
        />
      {/if}
      <Input
        label="Value"
        name="value"
        value={editingSetting ? editingSetting.value : undefined}
        {...$updateConstraints.value}
        error={$updateErrors.value}
      />
      <LoadingButton
        class="btn btn-primary mt-4"
        isLoading={$updateSubmitting}
        type="submit"
      >
        {editingSetting !== null ? "Uppdatera" : "Skapa"}
      </LoadingButton>
    </form>
  {/if}

  <table class="table rounded-box bg-base-300">
    <thead>
      <tr>
        <th>Key</th>
        <th>Value</th>
        <th>Edit</th>
        <th>Remove</th>
      </tr>
    </thead>
    <tbody>
      {#each data.settings as setting (setting.key)}
        <tr>
          <td>{setting.key}</td>
          <td>{setting.value}</td>
          <td>
            <!-- svelte-ignore a11y_consider_explicit_label -->
            <button
              disabled={!isAuthorized(
                apiNames.ADMIN.SETTINGS.UPDATE,
                data.user,
              )}
              class="btn btn-ghost"
              on:click={() => (editingSetting = setting)}
            >
              <span class="i-mdi-edit"></span>
            </button>
          </td>
          <td>
            <form method="POST" use:enhance action="?/remove">
              <input type="hidden" name="key" value={setting.key} />
              <LoadingButton
                type="submit"
                class="btn btn-error"
                disabled={!isAuthorized(
                  apiNames.ADMIN.SETTINGS.DELETE,
                  data.user,
                )}
              >
                <span class="i-mdi-delete"></span>
              </LoadingButton>
            </form>
          </td>
        </tr>
      {/each}
    </tbody>
  </table>

  {#if data.nollning && isAuthorized(apiNames.ADMIN.SETTINGS.UPDATE, data.user)}
    <form
      method="POST"
      action="?/updateNollning"
      use:nollningEnhance
      class="form-control justify-between gap-2 rounded-box bg-base-300 p-4 md:flex-row"
    >
      <Labeled
        label="Nollning start"
        class="md:flex-1"
        error={$nollningErrors.start}
        {...$nollningConstraints.start}
      >
        <DateInput
          name="start"
          date={data.nollning.start}
          {...$nollningConstraints.start}
        />
      </Labeled>
      <Labeled
        class="md:flex-1"
        label="Nollning start"
        error={$nollningErrors.end}
        {...$nollningConstraints.end}
      >
        <DateInput
          name="end"
          date={data.nollning.end}
          {...$nollningConstraints.end}
          error={$nollningErrors.end}
        />
      </Labeled>
      <LoadingButton
        class="btn btn-primary mt-4 self-end"
        isLoading={$nollningSubmitting}
        type="submit"
      >
        Spara
      </LoadingButton>
    </form>
  {/if}
</div>
