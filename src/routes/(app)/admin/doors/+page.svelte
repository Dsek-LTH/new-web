<script lang="ts">
  import { page } from "$app/stores";
  import apiNames from "$lib/utils/apiNames";
  import { isAuthorized } from "$lib/utils/authorization";
  import type { PageData } from "./$types";
  import * as m from "$paraglide/messages";
  import SetPageTitle from "$lib/components/nav/SetPageTitle.svelte";
  export let data: PageData;
</script>

<SetPageTitle title="Doors" />

<div class="overflow-x-auto">
  <table class="table">
    <!-- head -->
    <thead>
      <tr class="bg-base-200">
        <th>{m.admin_doors_door()}</th>
        <th></th>
      </tr>
    </thead>
    <tbody>
      {#each data.doors as door (door.name)}
        <tr>
          <td class="font-medium">
            {door.verboseName}
          </td>
          {#if isAuthorized(apiNames.DOOR.UPDATE, $page.data.user)}
            <td class="text-right">
              <a class="btn btn-xs px-8" href="doors/edit/{door.name}"
                >{m.admin_doors_edit()}</a
              >
            </td>
          {/if}
        </tr>
      {/each}
    </tbody>
  </table>
</div>
