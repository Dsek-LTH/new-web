<script lang="ts">
  import DoorAccess from "./DoorAccess.svelte";
  import * as m from "$paraglide/messages";
  import { page } from "$app/stores";
  import MarkdownBody from "$lib/components/MarkdownBody.svelte";
  import MemberAvatar from "$lib/components/socials/MemberAvatar.svelte";
  import { getFullName } from "$lib/utils/client/member";
  import PublishedArticles from "./PublishedArticles.svelte";
  import PublishedEvents from "./PublishedEvents.svelte";
  import UpdateMemberForm from "./UpdateMemberForm.svelte";

  import type { PageData } from "./$types";
  import HeldPositions from "./HeldPositions.svelte";
  import ProfileHeader from "./ProfileHeader.svelte";
  import EditButton from "./EditButton.svelte";
  import PingButton from "./PingButton.svelte";
  import { isAuthorized } from "$lib/utils/authorization";
  import apiNames from "$lib/utils/apiNames";
  import Medals from "./Medals.svelte";
  import SetPageTitle from "$lib/components/nav/SetPageTitle.svelte";

  export let data: PageData;

  $: member = data.viewedMember;

  $: publishedEvents = [...member.authoredEvents].reverse();
  let isEditing = false;

  $: isMe = data.user?.studentId === $page.params["studentId"];
  $: canEdit = isMe || isAuthorized(apiNames.MEMBER.UPDATE, data.user);
</script>

<SetPageTitle title={getFullName(member)} />
<article
  class="grid grid-cols-1-2 gap-x-4 gap-y-2 md:grid-cols-5"
  id="container"
>
  <div class="aspect-square md:col-start-1 md:col-end-2">
    <MemberAvatar {member} class="w-full rounded-lg">
      {#if canEdit}
        <!-- svelte-ignore a11y_consider_explicit_label -->
        <a
          href="{$page.params['studentId']}/profile-picture"
          class="btn btn-square glass btn-secondary btn-sm absolute right-2 top-2"
        >
          <span class="i-mdi-edit"></span>
        </a>
      {/if}
    </MemberAvatar>
  </div>
  <!-- Name, StiL-ID, badge and actions -->
  <header class="overflow-x-auto md:col-start-2 md:col-end-4">
    <ProfileHeader {member} email={data.email}>
      <div slot="actions" class="flex gap-2">
        {#if canEdit}
          <EditButton bind:isEditing />
        {/if}
        {#if !isMe && isAuthorized(apiNames.MEMBER.PING, data.user)}
          <PingButton ping={data.ping} />
        {/if}
      </div>
    </ProfileHeader>
  </header>

  <div class="col-span-3 flex gap-2 sm:hidden">
    {#if canEdit}
      <EditButton bind:isEditing />
    {/if}
    {#if !isMe && isAuthorized(apiNames.MEMBER.PING, data.user)}
      <PingButton ping={data.ping} />
    {/if}
  </div>

  <!-- Bio -->
  <article class="col-span-2 md:col-start-1 md:col-end-4 md:row-start-2">
    {#if isEditing}
      <UpdateMemberForm
        bind:isEditing
        data={data.form}
        phadderGroups={data.phadderGroups}
      />
    {:else if member.bio}
      <MarkdownBody body={member.bio}>
        {#if canEdit}
          <div class="float-right">
            <a
              href="{$page.params['studentId']}/edit-bio"
              class="btn btn-outline btn-sm"
            >
              {m.members_editBio()}
            </a>
          </div>
        {/if}
      </MarkdownBody>
    {:else if canEdit}
      <a
        href="{$page.params['studentId']}/edit-bio"
        class="btn btn-outline btn-sm"
      >
        {m.members_addBio()}
      </a>
    {/if}
  </article>

  <!-- Sidebar (goes all the way down) -->
  <section
    class="col-span-2 md:col-start-4 md:col-end-6 md:row-start-1 md:row-end-13"
  >
    <div class="hidden gap-2 md:flex md:justify-end">
      {#if canEdit}
        <EditButton bind:isEditing />
      {/if}
      {#if !isMe && isAuthorized(apiNames.MEMBER.PING, data.user)}
        <PingButton ping={data.ping} />
      {/if}
    </div>
    <div class="flex flex-col">
      <HeldPositions mandates={member.mandates} nollaIn={member.nollaIn} />
      {#if data.publishedArticles.length > 0}
        <PublishedArticles articles={data.publishedArticles} />
      {/if}
      {#if publishedEvents.length > 0}
        <PublishedEvents events={member.authoredEvents} />
      {/if}
    </div>
  </section>

  {#if data.medals.length > 0}
    <section
      class="col-span-2 md:col-start-1 md:col-end-4 md:row-start-3 lg:col-end-3"
    >
      <Medals medals={data.medals} />
    </section>
  {/if}

  {#if data.doorAccess.length > 0}
    <section
      class="col-span-2 md:col-start-1 md:col-end-4 md:row-start-4 lg:col-end-3"
    >
      <DoorAccess doorAccess={data.doorAccess} />
    </section>
  {/if}
</article>
