<script lang="ts">
  import Labeled from "$lib/components/Labeled.svelte";
  import type { SuperValidated } from "sveltekit-superforms";
  import type { UpdatePositionSchema } from "./+page.server";
  import { superForm } from "$lib/utils/client/superForms";
  import * as m from "$paraglide/messages";
  export let data: SuperValidated<UpdatePositionSchema>;
  const { form, errors, constraints, enhance } = superForm(data);
</script>

<form action="?/update" method="POST" use:enhance class="form-control">
  <Labeled label={m.positions_name()}>
    <input
      type="text"
      name="name"
      id="name"
      class="input input-bordered"
      value={$form.name ?? ""}
      {...$constraints.name}
    />
    {#if $errors.name}
      <p class="text-error">{$errors.name}</p>
    {/if}
  </Labeled>
  <Labeled label={m.positions_description()}>
    <textarea
      name="description"
      id="description"
      class="textarea textarea-bordered"
      rows="3"
      value={$form.description ?? ""}
      {...$constraints.description}
    ></textarea>
    {#if $errors.description}
      <p class="text-error">{$errors.description}</p>
    {/if}
  </Labeled>
  <Labeled
    label={m.positions_emailAddress()}
    explanation={m.positions_emailNotice()}
  >
    <input
      name="email"
      id="email"
      class="input input-bordered"
      type="email"
      value={$form.email}
      {...$constraints.email}
    />
    {#if $errors.email}
      <p class="text-error">{$errors.email}</p>
    {/if}
  </Labeled>
  <button type="submit" class="btn btn-secondary my-2"
    >{m.positions_save()}</button
  >
</form>
