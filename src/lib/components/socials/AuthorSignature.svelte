<script lang="ts">
  import CustomAuthorImage from "$lib/components/socials/CustomAuthorImage.svelte";
  import MemberImage from "$lib/components/socials/MemberImage.svelte";
  import { getFullName } from "$lib/utils/client/member";
  import type { Author, CustomAuthor, Member, Position } from "@prisma/client";
  import { twMerge } from "tailwind-merge";

  let clazz = "";
  export { clazz as class };
  export let member: Pick<
    Member,
    "firstName" | "lastName" | "nickname" | "studentId" | "picturePath"
  >;
  export let customAuthor: Pick<CustomAuthor, "name" | "imageUrl"> | null =
    null;
  export let position: Pick<Position, "id" | "name"> | undefined = undefined;
  export let type: Author["type"] = "Member";
  export let size: "sm" | "md" | "lg" | "xl" = "lg";
  export let links = true;

  const sizeToWidth: Record<typeof size, string> = {
    sm: "w-4",
    md: "w-8",
    lg: "w-12",
    xl: "w-16",
  };

  const sizeToGap: Record<typeof size, string> = {
    sm: "gap-2",
    md: "gap-2",
    lg: "gap-3",
    xl: "gap-4",
  };

  const sizeToText: Record<typeof size, string> = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
    xl: "text-xl",
  };
</script>

<div
  class={twMerge(
    `${sizeToGap[size]} flex max-w-full flex-row items-start overflow-hidden`,
    clazz,
  )}
>
  <div class="avatar shrink-0">
    <div class="{sizeToWidth[size]} m-2 rounded-full">
      {#if type == "Custom"}
        <CustomAuthorImage {customAuthor} />
      {:else}
        <a
          href="/members/{member.studentId}"
          tabindex={links ? 0 : -1}
          class="link transition-opacity hover:opacity-80 focus:opacity-80 {links
            ? ''
            : 'pointer-events-none'}"
        >
          <MemberImage {member} />
        </a>
      {/if}
    </div>
  </div>

  <div class="min-w-0 flex-1 overflow-hidden">
    {#if type == "Custom" && customAuthor != null}
      <div class="overflow-hidden">
        <h3
          class={`${sizeToText[size]} line-clamp-3 break-words font-semibold`}
        >
          {customAuthor.name}
        </h3>
      </div>
    {:else}
      <div class="overflow-hidden">
        <a
          href="/members/{member.studentId}"
          tabindex={links ? 0 : -1}
          class="block transition-opacity hover:opacity-80 focus:opacity-80"
          class:pointer-events-none={!links}
        >
          <h3
            class={`${sizeToText[size]} line-clamp-3 break-words font-semibold leading-tight`}
            title={getFullName(member)}
          >
            {getFullName(member)}
          </h3>
        </a>
      </div>
    {/if}

    <div class="flex justify-between text-sm">
      {#if (type !== "Custom" || customAuthor == null) && position}
        <div class="min-w-0 truncate opacity-80">
          <a
            href="/positions/{position.id}"
            tabindex={links ? 0 : -1}
            class="link-primary no-underline transition-opacity hover:opacity-80 focus:opacity-80 {links
              ? ''
              : 'pointer-events-none'}"
          >
            {position.name}
          </a>
        </div>
      {:else}
        <div></div>
        <!-- for positioning the slot correctly -->
      {/if}
      <div class="shrink-0">
        <slot name="end" />
      </div>
    </div>
  </div>
</div>
