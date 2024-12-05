<script lang="ts">
  import MemberSearch from "$lib/components/MemberSearch.svelte";
  import MemberAvatar from "$lib/components/socials/MemberAvatar.svelte";
  import { getFullName } from "$lib/utils/client/member";
  import type { Member } from "@prisma/client";
  import * as m from "$paraglide/messages";
  export let member: Member | undefined = undefined;
  let clazz: string | undefined = undefined;
  export { clazz as class };
  let isSearching: boolean;
  let handleSearch: (search: string) => void;
  export let endpoint: string | undefined = undefined;
  export let year: number | undefined = undefined;
</script>

<MemberSearch
  bind:handleSearch
  bind:isSearching
  {endpoint}
  class={clazz}
  onSelect={(selectedMember) => {
    member = selectedMember;
  }}
  {year}
>
  <div class="relative flex h-full flex-col gap-2">
    {#if member}
      <div class="absolute left-4 top-1/2 flex -translate-y-1/2 justify-center">
        <MemberAvatar {member} class="w-8" />
      </div>
    {/if}
    <input
      id="autocomplete"
      autocomplete="off"
      autocapitalize="off"
      type="text"
      class="input input-bordered w-full {member ? 'indent-10' : ''}"
      placeholder={m.positions_searchForMember()}
      tabIndex={0}
      value={member ? getFullName(member) : ""}
      on:input={(e) => {
        member = undefined;
        handleSearch(e.currentTarget.value);
      }}
      {...$$restProps}
    />
    <span
      class="loading loading-spinner loading-md absolute right-2 top-1/2 -translate-y-1/2 text-primary transition-opacity opacity-{isSearching
        ? '100'
        : '0'}"
    ></span>
  </div>
</MemberSearch>
