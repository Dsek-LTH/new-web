<script lang="ts">
  import { page } from "$app/stores";
  import * as m from "$paraglide/messages";

  export let type: string;

  type = $page.url.searchParams.get("type") ?? "meeting";
</script>

<ul class="xyz flex flex-wrap gap-4">
  <li class="flex-1">
    <input
      type="radio"
      id="meeting"
      name="type"
      value="meeting"
      class="peer hidden"
      bind:group={type}
    />
    <label
      for="meeting"
      class="flex cursor-pointer rounded-lg border border-base-content/20 p-5 peer-checked:border-primary peer-checked:bg-primary/10"
    >
      <div class="flex gap-4">
        <span class="i-mdi-document self-center text-2xl"></span>
        <div>
          <p class="text-lg font-semibold">{m.documents_meetingDocument()}</p>
          <p class="text-gray-400">{m.documents_meetingDocumentBlurb()}</p>
        </div>
      </div>
    </label>
  </li>

  <li class="flex-1">
    <input
      type="radio"
      id="srd"
      name="type"
      value="srd"
      class="peer hidden"
      bind:group={type}
    />
    <label
      for="srd"
      class="flex cursor-pointer rounded-lg border border-base-content/20 p-5 peer-checked:border-primary peer-checked:bg-primary/10"
    >
      <div class="flex gap-4">
        <span class="i-mdi-account-student self-center text-2xl"></span>
        <div>
          <p class="text-lg font-semibold">{m.documents_theStudyCouncil()}</p>
          <p class="text-gray-400">{m.documents_theStudyCouncilBlurb()}</p>
        </div>
      </div>
    </label>
  </li>

  <li class="flex-1">
    <input
      type="radio"
      id="requirement"
      name="type"
      value="requirement"
      class="peer hidden"
      bind:group={type}
    />
    <label
      for="requirement"
      class="flex cursor-pointer rounded-lg border border-base-content/20 p-5 peer-checked:border-primary peer-checked:bg-primary/10"
    >
      <div class="flex gap-4">
        <span class="i-mdi-format-list-bulleted-type self-center text-2xl"
        ></span>
        <div>
          <p class="text-lg font-semibold">
            {m.documents_requirementProfiles()}
          </p>
          <p class="text-gray-400">{m.documents_requirementProfilesBlurb()}</p>
        </div>
      </div>
    </label>
  </li>
</ul>
