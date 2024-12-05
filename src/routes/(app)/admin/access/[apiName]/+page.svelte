<script lang="ts">
  import DeletePolicyForm from "./DeletePolicyForm.svelte";

  import { page } from "$app/stores";
  import * as m from "$paraglide/messages";
  import { superForm } from "$lib/utils/client/superForms";

  import type { PageData } from "./$types";
  import SetPageTitle from "$lib/components/nav/SetPageTitle.svelte";
  export let data: PageData;
  const {
    form: createForm,
    errors,
    constraints,
    enhance,
  } = superForm(data.createForm, {
    resetForm: true,
  });
  $: policies = data.policies.sort((a, b) => {
    if (a.role && b.role) return a.role.localeCompare(b.role, "sv");
    if (a.role && !b.role) return -1;
    if (!a.role && b.role) return 1;
    return a.studentId!.localeCompare(b.studentId!, "sv");
  });
</script>

<SetPageTitle title={$page.params["apiName"]} />

<h1 class="mb-4 text-2xl font-semibold">{$page.params["apiName"]}</h1>
<div class="overflow-x-auto">
  <table class="table">
    <thead>
      <tr class="bg-base-200">
        <th>{m.admin_access_role()}</th>
        <th>{m.admin_access_member()}</th>
        <th>{m.admin_access_createdAt()}</th>
        <th></th>
      </tr>
    </thead>

    <tbody>
      {#each policies as policy}<tr>
          <td>{policy.role ?? ""}</td>
          <td
            >{policy.studentId
              ? `${policy.member?.firstName} ${policy.member?.lastName}`
              : ""}</td
          >
          <td>{policy.createdAt?.toLocaleString("sv")}</td>
          <td class="text-right">
            <DeletePolicyForm data={data.deleteForm} policyId={policy.id} />
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>

<section class="my-4 space-y-4">
  <h2 class="text-xl font-bold">{m.admin_access_addNewPolicies()}</h2>
  <form class="form-control gap-4" method="POST" action="?/create" use:enhance>
    <label class="join join-vertical md:join-horizontal">
      <span class="label join-item bg-base-200 px-4"
        >{m.admin_access_role()}</span
      >
      <input
        type="text"
        name="role"
        placeholder="Type here"
        class="input join-item input-bordered hover:border-base-content md:flex-1"
        bind:value={$createForm.role}
        {...$constraints.role}
      />
      <button type="submit" class="btn btn-primary join-item"
        >{m.admin_access_add()}</button
      >
    </label>
    {#if $errors.role}
      <span class="text-error">{$errors.role}</span>
    {/if}
    <label class="join join-vertical md:join-horizontal">
      <span class="label join-item bg-base-200 px-4"
        >{m.admin_access_studentID()}</span
      >
      <input
        type="text"
        name="studentId"
        placeholder="Type here"
        class="input join-item input-bordered hover:border-base-content md:flex-1"
        bind:value={$createForm.studentId}
        {...$constraints.studentId}
      />
      <button type="submit" class="btn btn-primary join-item"
        >{m.admin_access_add()}</button
      >
    </label>
    {#if $errors.studentId}<span class="text-error">{$errors.studentId}</span
      >{/if}
  </form>
</section>
