<script lang="ts">
  import { page } from "$app/stores";
  import Labeled from "$lib/components/Labeled.svelte";
  import { superForm } from "$lib/utils/client/superForms";
  import * as m from "$paraglide/messages";

  import type { PageData } from "./$types";
  import SetPageTitle from "$lib/components/nav/SetPageTitle.svelte";
  export let data: PageData;
  let type: "role" | "studentId" = "role";

  let removeModal: HTMLDialogElement | undefined = undefined;
  let informationModal: HTMLDialogElement | undefined = undefined;
  let selectedPolicy: (typeof data)["doorAccessPolicies"][number] | undefined =
    undefined;
  const { form, errors, constraints, enhance } = superForm(data.createForm);
  const {
    form: banForm,
    errors: banErrors,
    constraints: banConstraints,
    enhance: banEnhance,
  } = superForm(data.createForm);
</script>

<SetPageTitle title={$page.params["slug"]} />

<main class="container mx-auto px-4">
  <h1 class="mb-4 text-2xl font-semibold capitalize">{$page.params["slug"]}</h1>
  <div class="overflow-x-auto rounded-lg">
    <table class="table">
      <thead class="bg-base-200">
        <tr>
          <th>{m.admin_doors_roleMember()}</th>
          <th>{m.admin_doors_startDate()}</th>
          <th>{m.admin_doors_endDate()}</th>
          <th></th>
          <th></th>
        </tr>
      </thead>

      <tbody>
        {#each data.doorAccessPolicies as policy}<tr
            class:bg-red-400={policy.isBan}
            class:bg-opacity-60={policy.isBan}
          >
            {#if policy.role}
              <td class="flex items-center gap-3"
                ><span class="i-mdi-account-group h-6 w-6"
                ></span>{policy.role ?? "N/A"}</td
              >
            {:else if policy.member}
              <td class="flex items-center gap-3">
                <div class="avatar">
                  <div class="w-6 rounded-full">
                    {#if policy.member.picturePath}
                      <img
                        src={policy.member.picturePath}
                        alt="Profile avatar"
                      />
                    {:else}
                      <span class="i-mdi-account-circle h-6 w-6"></span>
                    {/if}
                  </div>
                </div>
                <p>{policy.member.firstName} {policy.member.lastName}</p>
              </td>
            {/if}
            <td>{policy.startDatetime?.toLocaleString("sv") ?? "N/A"}</td>
            <td>{policy.endDatetime?.toLocaleString("sv") ?? "N/A"}</td>
            {#if policy.information}
              <td class="policy-information flex items-center">
                <!-- svelte-ignore a11y_consider_explicit_label -->
                <button
                  on:click={() => {
                    informationModal?.showModal();
                    selectedPolicy = policy;
                  }}
                  class="btn-error h-6 rounded-full fill-base-content"
                  ><span class="i-mdi-information h-6 w-6 bg-base-content"
                  ></span>
                </button>
                <dialog id="my_modal_1" class="modal">
                  <div class="modal-box">
                    <h3 class="text-lg font-bold">Information!</h3>
                    <p class="py-4">{policy.information}</p>
                    <div class="modal-action">
                      <form method="dialog">
                        <!-- if there is a button in form, it will close the modal -->
                        <button class="btn">Close</button>
                      </form>
                    </div>
                  </div>
                </dialog>
              </td>
            {/if}
            <td class="text-right">
              <button
                on:click={() => {
                  removeModal?.showModal();
                  selectedPolicy = policy;
                }}
                class="btn btn-xs whitespace-nowrap px-8"
                >{m.admin_doors_remove()}
              </button>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</main>

<section class="container mx-auto mt-4 px-4">
  <h2 class="mb-4 text-xl">{m.admin_doors_grantDoorAccess()}</h2>
  <form class="form-control gap-4" method="POST" action="?/create" use:enhance>
    <label class="join join-vertical lg:join-horizontal lg:items-end">
      <select
        class="join-item select select-bordered w-full lg:max-w-xs"
        bind:value={type}
      >
        <option value="role">{m.admin_doors_role()}</option>
        <option value="studentId">{m.admin_doors_member()}</option>
      </select>
      <input
        type="text"
        name={type}
        placeholder={type === "role" ? "dsek.infu.dwww" : "ab1234bc-s"}
        class="input join-item input-bordered w-full lg:max-w-xs"
        bind:value={$form[type]}
        {...$constraints[type]}
      />
      <div class="form-control join-item w-full lg:max-w-[200px]">
        <Labeled label={m.admin_doors_startDateOptional()}>
          <input
            id="startDatetime"
            name="startDatetime"
            type="datetime-local"
            class="input join-item input-bordered"
            bind:value={$form.startDatetime}
            {...$constraints.startDatetime}
          />
        </Labeled>
      </div>
      <div class="form-control join-item w-full lg:max-w-[200px]">
        <Labeled label={m.admin_doors_endDateOptional()}>
          <input
            id="endDatetime"
            name="endDatetime"
            type="datetime-local"
            class="input join-item input-bordered"
            bind:value={$form.endDatetime}
            {...$constraints.endDatetime}
          />
        </Labeled>
      </div>
      <div class="form-control w-full">
        <input
          id="information"
          name="information"
          type="text"
          class="input join-item input-bordered"
          placeholder={m.admin_doors_info()}
          bind:value={$form.information}
        />
      </div>
      <label class="switch join-item w-full">
        <div class="flex-auto">
          <button type="submit" class="btn btn-primary join-item w-full"
            >{m.admin_doors_add()}</button
          >
        </div>
      </label>
    </label>
    {#if Object.keys($errors).length > 0}
      <div class="text-error">
        <ul class="list-inside list-disc">
          {#each Object.values($errors) as error}<li>{error}</li>{/each}
        </ul>
      </div>
    {/if}
  </form>
</section>

<section class="container mx-auto mt-4 px-4">
  <h2 class="mb-4 text-xl">Spärra åtkomst</h2>
  <form class="form-control gap-4" method="POST" action="?/ban" use:banEnhance>
    <label class="join join-vertical lg:join-horizontal lg:items-end">
      <input
        type="text"
        name="studentId"
        placeholder="ab1234bc-s"
        class="input join-item input-bordered w-full lg:max-w-xs"
        bind:value={$banForm.studentId}
        {...$banConstraints.studentId}
      />
      <div class="form-control join-item w-full lg:max-w-[200px]">
        <Labeled label={m.admin_doors_startDateOptional()}>
          <input
            id="startDatetime"
            name="startDatetime"
            type="datetime-local"
            class="input join-item input-bordered"
            bind:value={$banForm.startDatetime}
            {...$banConstraints.startDatetime}
          />
        </Labeled>
      </div>
      <div class="form-control join-item w-full lg:max-w-[200px]">
        <Labeled label={m.admin_doors_endDateOptional()}>
          <input
            id="endDatetime"
            name="endDatetime"
            type="datetime-local"
            class="input join-item input-bordered"
            bind:value={$banForm.endDatetime}
            {...$banConstraints.endDatetime}
          />
        </Labeled>
      </div>

      <div class="form-control w-full">
        <input
          id="information"
          name="information"
          type="text"
          class="input join-item input-bordered"
          placeholder={m.admin_doors_info()}
          bind:value={$banForm.information}
          {...$banConstraints.information}
        />
      </div>
      <label class="switch join-item w-full">
        <div class="flex-auto">
          <button type="submit" class="btn btn-error join-item w-full">
            Spärra
          </button>
        </div>
      </label>
    </label>
    {#if Object.keys($banErrors).length > 0}
      <div class="text-error">
        <ul class="list-inside list-disc">
          {#each Object.values($banErrors) as error}<li>{error}</li>{/each}
        </ul>
      </div>
    {/if}
  </form>
</section>

<dialog bind:this={removeModal} class="modal modal-bottom sm:modal-middle">
  <div class="modal-box">
    <h3 class="text-lg font-bold">{m.admin_doors_revokeDoorAccess()}</h3>
    <p class=" py-4">
      {#if selectedPolicy?.isBan}
        <!-- eslint-disable-next-line svelte/no-at-html-tags -->
        {@html m.admin_doors_revokeBanAreYouSure({
          door: `${$page.params["slug"]}`,
          target: `${selectedPolicy?.role || selectedPolicy?.member?.studentId}`,
        })}
      {:else}
        <!-- eslint-disable-next-line svelte/no-at-html-tags -->
        {@html m.admin_doors_revokeAreYouSure({
          door: `${$page.params["slug"]}`,
          target: `${selectedPolicy?.role || selectedPolicy?.member?.studentId}`,
        })}
      {/if}
    </p>
    <div class="modal-action">
      <form method="POST" action="?/delete" use:enhance>
        <input type="hidden" name="id" value={selectedPolicy?.id} />
        <button
          type="submit"
          class="btn btn-error"
          on:click={() => removeModal?.close()}
        >
          {m.admin_doors_remove()}
        </button>
      </form>
    </div>
  </div>
  <form method="dialog" class="modal-backdrop">
    <!-- svelte-ignore a11y_consider_explicit_label -->
    <button class="cursor-auto"></button>
  </form>
</dialog>

<dialog bind:this={informationModal} class="modal modal-bottom sm:modal-middle">
  <div class="modal-box">
    <div class="flex items-center">
      <span class="i-mdi-information size-6"></span>
      <h3 class="px-1 text-lg font-bold">
        <b class="capitalize">{$page.params["slug"]} -</b>
        {#if selectedPolicy?.role}<b>{selectedPolicy.role}</b>{:else}<b>
            {selectedPolicy?.member?.firstName}
            {selectedPolicy?.member?.lastName}
            <i>({selectedPolicy?.studentId})</i>
          </b>{/if}
      </h3>
    </div>
    <p class="py-4">
      {selectedPolicy?.information}
    </p>
    <button class="btn" on:click={() => informationModal?.close()}>
      Stäng
    </button>
  </div>
  <form method="dialog" class="modal-backdrop">
    <!-- svelte-ignore a11y_consider_explicit_label -->
    <button class="cursor-auto"></button>
  </form>
</dialog>
