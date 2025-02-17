<script lang="ts">
  import { page } from "$app/stores";
  import CommitteeSymbol from "$lib/components/images/CommitteeSymbol.svelte";
  import SetPageTitle from "$lib/components/nav/SetPageTitle.svelte";
  import MemberAvatar from "$lib/components/socials/MemberAvatar.svelte";
  import apiNames from "$lib/utils/apiNames";
  import { isAuthorized } from "$lib/utils/authorization";
  import { getFullName } from "$lib/utils/client/member";
  import { toString, type Semester } from "$lib/utils/semesters";
  import MemberBio from "./MemberBio.svelte";
  import * as m from "$paraglide/messages";
  import UpdateMemberForm from "./UpdateMemberForm.svelte";
  import { languageTag } from "$paraglide/runtime";
  import PingButton from "./PingButton.svelte";

  export let data;

  $: studentId = $page.params["studentId"];
  $: member = data.viewedMember;

  let isEditing = false;
  $: isMe = data.user?.studentId === studentId;
  $: canEdit = isMe || isAuthorized(apiNames.MEMBER.UPDATE, data.user);

  $: medals = data.medals;
  const getMedalLink = (semester: Semester) =>
    `/medals?semester=${toString(semester)}`;

  $: mandatesByYear = (() => {
    const res = Object.groupBy(member.mandates, ({ startDate, endDate }) => {
      // If the mandate spans only one year, show that year, e.g. "2020"
      if (startDate.getFullYear() === endDate.getFullYear()) {
        return startDate.getFullYear().toString();
      }
      // Otherwise, show both years, e.g. "2020-2021"
      return `${startDate.getFullYear()}-${endDate.getFullYear()}`;
    });

    if (member.nollaIn) {
      res[member.nollaIn.year] ??= [];
    }

    return res;
  })();

  $: doorAccess = data.doorAccess;
</script>

<SetPageTitle title={member ? getFullName(member) : "Medlem"} />

<figure
  class="hero-gradient hero-gradient-{member.classProgramme ??
    'D'} relative h-40 w-full"
>
  <!-- Curved bottom border -->
  <svg class="absolute bottom-0 translate-y-1/2" viewBox="0 0 375 20">
    <path
      d="M375 20H0V0C0 0 124.929 8 197 8C269.071 8 375 0 375 0V20Z"
      fill="oklch(var(--b1))"
    />
  </svg>
</figure>

<MemberAvatar {member} class="relative -top-20 mx-auto block size-40 shadow-lg">
  {#if canEdit}
    <a
      href="{studentId}/profile-picture"
      class="btn btn-square glass btn-primary btn-sm absolute left-1/2 top-2 origin-center !-translate-x-1/2"
    >
      <span class="i-mdi-edit" />
    </a>
  {/if}
</MemberAvatar>

<div
  class="relative -top-20 mx-auto max-w-prose divide-y divide-gray-200 divide-opacity-10 px-12 *:py-4"
>
  <section class="w-full text-center">
    <h1 class="text-2xl font-bold">
      {getFullName(member, { hideNickname: true })}
    </h1>

    {#if member?.nickname}
      <h2 class="text-base font-light italic text-[var(--text-pink)]">
        <span class="text-xl">“</span>{member.nickname}<span class="text-xl">
          ”</span
        >
      </h2>
    {/if}

    {#if member.email}
      <p
        class="flex h-6 items-center justify-center gap-1 text-xs text-gray-500"
      >
        <span class="i-mdi-email"></span>{member.email}
      </p>
    {/if}

    {#if canEdit}
      <button
        class="btn my-4 h-auto min-h-0 w-full py-2"
        on:click={() => {
          isEditing = !isEditing;
        }}
      >
        {isEditing ? m.members_cancel() : m.members_edit()}
      </button>
      <PingButton ping={data.ping} />
    {/if}
  </section>

  {#if isEditing}
    <UpdateMemberForm
      bind:isEditing
      data={data.form}
      phadderGroups={data.phadderGroups}
    />
  {/if}

  {#if member.bio}
    <section>
      <MemberBio bio={member.bio} />
    </section>
  {/if}

  {#if medals.length > 0}
    <section class="flex flex-col gap-2">
      <h1 class="text-base font-bold">{m.medals()}</h1>
      {#each medals as medal}
        <a class="flex items-center gap-2" href={getMedalLink(medal.after)}>
          <span class="i-mdi-medal size-7 text-primary"></span>
          <p
            class="text-sm text-[var(--text-pink)] lg:tooltip"
            data-tip={m.medals_since() + " " + toString(medal.after)}
          >
            {medal.medal}
          </p>
        </a>
      {/each}
    </section>
  {/if}

  {#if Object.keys(mandatesByYear).length > 0}
    <section class="flex flex-col gap-2 text-sm">
      {#each Object.entries(mandatesByYear)
        .toSorted()
        .toReversed() as [year, mandates] (year)}
        <h1 class="font-bold">{year}</h1>
        <!-- This if-statement is just to make TypeScript happy. -->
        {#if mandates}
          {#each mandates as mandate}
            <a
              class="flex items-center gap-2"
              href="/positions/{mandate.position.id}"
            >
              {#if mandate.position.committee}
                <figure class="size-7 overflow-hidden">
                  <CommitteeSymbol committee={mandate.position.committee} />
                </figure>
              {/if}
              <p
                class="text-[var(--text-pink)] lg:tooltip before:text-balance"
                data-tip={mandate.position.committee?.name +
                  `\n${mandate.startDate.toLocaleDateString(
                    languageTag(),
                  )} - ${mandate.endDate.toLocaleDateString(languageTag())}`}
              >
                {#if mandate.phadderIn}
                  {mandate.position.name} i {mandate.phadderIn.name}
                {:else}
                  {mandate.position.name}
                {/if}
              </p>
            </a>
          {/each}
        {/if}

        {#if member.nollaIn?.year.toString() === year}
          <a
            class="flex items-center gap-2"
            href="/committees/nollu?year={member.nollaIn.year}"
          >
            {#if member.nollaIn.imageUrl}
              <figure class="size-7 overflow-hidden rounded-sm">
                <img src={member.nollaIn.imageUrl} alt="Group logo" />
              </figure>
            {/if}
            <p class="text-[var(--text-pink)]">
              Nolla i {member.nollaIn.name}
            </p>
          </a>
        {/if}
      {/each}
    </section>
  {/if}

  {#if doorAccess.length > 0}
    <section class="flex w-full flex-col gap-2 text-sm">
      <h1>Dörraccess</h1>
      {#each doorAccess as doorAccess}
        <details class="group">
          <summary class="flex cursor-pointer items-center gap-1">
            <span
              class="i-mdi-door size-5 text-primary group-open:i-mdi-door-open group-hover:i-mdi-door-open"
            ></span>
            <p class="text-[var(--text-pink)]">{doorAccess.verboseName}</p>
          </summary>
          {#each doorAccess.roles as role}
            <p class="text-gray-500">{role}</p>
          {/each}
        </details>
      {/each}
    </section>
  {/if}
</div>

<style>
  @import url("https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap");
  * {
    font-family: "Poppins", sans-serif;
  }

  :global([data-theme="light"]) {
    --text-pink: hsl(343, 25%, 40%);
  }
  :global([data-theme="dark"]) {
    --text-pink: hsl(343, 49%, 80%);
  }

  .hero-gradient,
  .hero-gradient-D {
    background: linear-gradient(180deg, #f280a1 0%, #f64b7c 100%);
  }
  .hero-gradient-C {
    background: linear-gradient(180deg, #9d50bb 0%, #6e48aa 100%);
  }
  .hero-gradient-E,
  .hero-gradient-BME {
    background: linear-gradient(180deg, #ece9e6 0%, #ffffff 100%);
  }

  /* progressive enhancement: adds animations for
     browsers that support animating height: auto */
  /*:global(html) {
    interpolate-size: allow-keywords;
  }
    commented out as property does not appear to exist according to pre-push checks*/

  details::details-content {
    height: 0;
    overflow: hidden;
    transition:
      height 0.3s,
      content-visibility 0.3s;
    transition-behavior: allow-discrete;
  }

  details[open]::details-content {
    height: auto;
  }
</style>
