<script lang="ts">
  import { superForm } from "$lib/utils/client/superForms";
  import type { PageData } from "./$types";
  import * as m from "$paraglide/messages";
  import SetPageTitle from "$lib/components/nav/SetPageTitle.svelte";
  export let data: PageData;
  const { form, errors, constraints, enhance } = superForm(data.form, {
    resetForm: true,
  });
</script>

<SetPageTitle title="Access policies" />

<div class="overflow-x-auto">
  <table class="table">
    <!-- head -->
    <thead>
      <tr class="bg-base-200">
        <th>{m.admin_access_policyCode()}</th>
        <th></th>
      </tr>
    </thead>
    <tbody>
      {#each data.accessPolicies as apiName}
        <tr>
          <td class="font-medium">{apiName}</td>
          <td class="text-right"
            ><a class="btn btn-xs px-8" href="access/{apiName}"
              >{m.admin_access_edit()}</a
            ></td
          >
        </tr>
      {/each}
    </tbody>
  </table>
</div>

<section class="my-4 space-y-4">
  <h2 class="text-xl font-bold">{m.admin_access_addNewPolicy()}</h2>
  <form class="form-control gap-4" method="POST" action="?/create" use:enhance>
    <label class="join join-vertical md:join-horizontal">
      <span class="label join-item bg-base-200 px-4"
        >{m.admin_access_newPolicy()}</span
      >
      <input
        type="text"
        name="apiName"
        placeholder="Policy name"
        aria-invalid={$errors.apiName ? "true" : undefined}
        class="input join-item input-bordered input-primary md:flex-1"
        bind:value={$form.apiName}
        {...$constraints.apiName}
      />
      {#if $errors.apiName}<span class="text-error">{$errors.apiName}</span
        >{/if}

      <button type="submit" class="btn btn-primary join-item"
        >{m.admin_access_add()}
      </button>
    </label>
  </form>
</section>
