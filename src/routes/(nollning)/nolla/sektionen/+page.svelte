<script lang="ts">
  import GuildImage from "./guildOnHill.jpeg";
  import BoardImage from "./styr.webp";
  import DChipLogo from "./d-chip_logo.webp";
  import DChipImage from "./d-chip.webp";
  import * as m from "$paraglide/messages";
</script>

<!-- eslint-disable svelte/no-at-html-tags -->
<header class="mx-auto w-min">
  <h1 class="nolla-page-title mb-4 w-min whitespace-nowrap text-center">
    {@html m.nolla_guild_header()}
  </h1>
  <h2
    class="text-center text-lg font-bold text-primary drop-shadow-sm sm:text-[2.3rem]"
  >
    {@html m.nolla_guild_tagline()}
  </h2>
</header>

<article class="flex flex-col items-stretch gap-16 pt-8 sm:pt-16">
  <!-- About the guild -->
  <div class="flex flex-col-reverse items-stretch gap-8 lg:flex-row">
    <section class="neo-brutal-box bg-secondary">
      <h3 class="font-nolla-mono text-2xl font-semibold">
        {@html m.nolla_guild_title()}
      </h3>
      <p class="nolla-prose flex-1">
        {@html m.nolla_guild_description()}
      </p>
      <a class="neo-brutal-btn-flat w-min" href="/home"
        >dsek.se <span class="i-mdi-arrow-right ml-2 h-8 w-8"></span></a
      >
    </section>
    <img
      src={GuildImage}
      alt="D-sektionen"
      class="neo-brutal-image flex-grow object-cover lg:w-0"
    />
  </div>

  <!-- The board -->
  <section
    class="max-lg:neo-brutal-border box-shadow-black-lg grid flex-1 grid-cols-1 place-items-stretch overflow-hidden rounded-2xl lg:grid-cols-2 lg:grid-rows-[min-content_1fr]"
  >
    <!-- Image -->
    <div class="relative row-start-2 bg-primary lg:row-start-1">
      <div class="h-full w-full rounded-br-2xl bg-base-100 lg:pb-8 lg:pr-8">
        <img
          src={BoardImage}
          alt="D-sektionens styrelse"
          class="lg:neo-brutal-image"
        />
      </div>
      <div
        class="pointer-events-none absolute -bottom-1 -right-1 z-10 hidden h-20 w-20 rounded-br-[20px] border-b-4 border-r-4 border-black lg:block"
      ></div>
    </div>

    <!-- Description -->
    <div
      class="relative row-start-1 border-black bg-primary px-10 pb-8 pt-16 lg:rounded-t-2xl lg:border-r-4"
    >
      <div
        class="neo-brutal-border pointer-events-none absolute -right-1 bottom-16 left-0 top-0 hidden !rounded-b-none !border-b-0 border-r-4 lg:block"
      ></div>
      <h3 class="font-nolla-mono text-2xl font-semibold">
        {@html m.nolla_guild_the_board()}
      </h3>
      <p class="nolla-prose">
        {@html m.nolla_guild_board_description()}
        <a href="/committees" class="link">{@html m.nolla_readMore()}</a>
      </p>
    </div>

    <!-- Role descriptions -->
    <ul
      class="relative col-start-1 row-start-3 grid grid-cols-1 gap-2 border-black bg-primary px-10 pb-16 pt-8 sm:grid-cols-2 lg:col-span-2 lg:row-start-2 lg:grid-cols-3 lg:rounded-2xl lg:rounded-tr-none lg:border-b-4 lg:border-r-4 [&>li>b]:block"
    >
      <!-- For correct borders -->
      <div
        class="neo-brutal-border pointer-events-none absolute -bottom-1 left-0 right-[calc(50%+4rem)] top-0 hidden !rounded-r-none !border-r-0 lg:block"
      ></div>
      <li>
        <b>{@html m.nolla_guild_board_president()}</b>
        {@html m.nolla_guild_board_president_description()}
      </li>
      <li>
        <b>{@html m.nolla_guild_board_vice_president()}</b>
        {@html m.nolla_guild_board_vice_president_description()}
      </li>
      <li>
        <b>{@html m.nolla_guild_board_treasurer()}</b>
        {@html m.nolla_guild_board_treasurer_description()}
      </li>
      <li>
        <b>{@html m.nolla_guild_board_study_president()}</b>
        {@html m.nolla_guild_board_study_president_description()}
      </li>
      <li>
        <b>{@html m.nolla_guild_board_information()}</b>
        {@html m.nolla_guild_board_information_description()}
      </li>
      <li>
        <b>{@html m.nolla_guild_board_cafe()}</b>
        {@html m.nolla_guild_board_cafe_description()}.
      </li>
      <li>
        <b>{@html m.nolla_guild_board_sex()}</b>
        {@html m.nolla_guild_board_sex_description()}
      </li>
      <li>
        <b>{@html m.nolla_guild_board_kallarm()}</b>
        {@html m.nolla_guild_board_kallarm_description()}
      </li>
      <li>
        <b>{@html m.nolla_guild_board_corporate_relations()}</b>
        {@html m.nolla_guild_board_corporate_relations_description()}
      </li>
      <li>
        <b>{@html m.nolla_guild_board_activities()}</b>
        {@html m.nolla_guild_board_activities_description()}
      </li>
    </ul>
  </section>

  <!-- D-Chip -->
  <div class="flex flex-col-reverse items-stretch gap-8 lg:flex-row-reverse">
    <section class="neo-brutal-box bg-secondary">
      <img
        src={DChipLogo}
        alt="D-chips styrelse"
        class="h-auto max-h-16 w-auto max-w-full"
      />
      <p class="nolla-prose">
        {@html m.nolla_guild_dchip_description()}
      </p>

      <a
        class="neo-brutal-btn-flat w-min whitespace-nowrap"
        href="https://dchip.dsek.se"
      >
        {@html m.nolla_guild_dchip_link()}
      </a>
    </section>
    <figure class="flex-1">
      <img
        src={DChipImage}
        alt="D-chips styrelse"
        class="neo-brutal-image h-full w-full object-cover"
      />
    </figure>
  </div>
</article>
