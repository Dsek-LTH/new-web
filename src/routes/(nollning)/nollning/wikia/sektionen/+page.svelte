<script lang="ts">
  import * as m from "$paraglide/messages";
  import board from "./board.webp";
  import dchip from "./d-chip.webp";
</script>

<!-- limit width and center -->
<div class="mx-auto max-w-screen-md">
  <section>
    <h3 class="page-title text-secondary">{m.nolla_guild_header()}</h3>
    <p class="nolla-prose">
      {m.nollning_wikia_guild_body()}
    </p>
    <a class="btn-primary-dark btn" href="/"
      >dsek.se <span class="i-mdi-arrow-right"></span></a
    >
  </section>
  <br /><br />
  <section>
    <h3 class="page-title">{m.theBoard()}</h3>
    <!-- TODO: Add image of the board -->
    <img
      src={board}
      alt="D-sek board"
      class="max-h-96 max-w-full rounded-box"
    />
    <p class="nolla-prose">
      {m.nollning_wikia_board_body()}
      <a href="/board" class="link">{m.nolla_readMore()}!</a>
    </p>
    <ul class="list-disc space-y-2 leading-normal">
      <li>
        <strong>{m.nolla_guild_board_president()}</strong>
        {m.nolla_guild_board_president_description()}
      </li>
      <li>
        <strong>{m.nolla_guild_board_vice_president()}</strong>
        {m.nolla_guild_board_vice_president_description()}
      </li>
      <li>
        <strong>{m.nolla_guild_board_treasurer()}</strong>
        {m.nolla_guild_board_treasurer_description()}
      </li>
      <li>
        <strong>{m.nolla_guild_board_study_president()}</strong>
        {m.nolla_guild_board_study_president_description()}
      </li>
      <li>
        <strong>{m.nolla_guild_board_information()}</strong>
        {m.nolla_guild_board_information_description()}
      </li>
      <li>
        <strong>{m.nolla_guild_board_cafe()}</strong>
        {m.nolla_guild_board_cafe_description()}.
      </li>
      <li>
        <strong>{m.nolla_guild_board_sex()}</strong>
        {m.nolla_guild_board_sex_description()}
      </li>
      <li>
        <strong>{m.nolla_guild_board_kallarm()}</strong>
        {m.nolla_guild_board_kallarm_description()}
      </li>
      <li>
        <strong>{m.nolla_guild_board_corporate_relations()}</strong>
        {m.nolla_guild_board_corporate_relations_description()}
      </li>
      <li>
        <strong>{m.nolla_guild_board_activities()}</strong>
        {m.nolla_guild_board_activities_description()}
      </li>
    </ul>
  </section>
  <br /><br />
  <section>
    <h3 class="page-title">{m.landing_dchip_title()}</h3>
    <img
      src={dchip}
      alt="D-chip board"
      class="max-h-96 max-w-full rounded-box"
    />
    <p class="nolla-prose">
      {m.landing_dchip_description()}
    </p>
    <a href="https://dchip.dsek.se" target="_blank" class="btn-primary-dark btn"
      >{m.website()} <span class="i-mdi-arrow-right"></span></a
    >
  </section>
</div>
