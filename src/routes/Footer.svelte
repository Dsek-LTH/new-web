<script lang="ts">
  import * as m from "$paraglide/messages";
</script>

<footer class="bg-base-300">
  <div class="container footer mx-auto items-center gap-y-2 p-2">
    <nav
      class="grid-flow-col place-self-center md:place-self-start"
      aria-label={m.footer_contactAndSourceCode()}
    >
      <a class="btn btn-ghost" href="/info/contact">{m.footer_contact()}</a>
      <a class="btn btn-ghost" href="https://github.com/Dsek-LTH/web"
        >{m.footer_sourceCode()}</a
      >
    </nav>

    <!-- svelte-ignore a11y_consider_explicit_label -->
    <nav
      class="grid-flow-col place-self-center *:text-xl md:place-self-end"
      aria-label={m.footer_socialMedia()}
    >
      <a class="btn btn-ghost" href="https://discord.com/invite/wxHQcvZ38p">
        <span class="i-mdi-discord"></span>
      </a>
      <a class="btn btn-ghost" href="https://instagram.com/dseklth">
        <span class="i-mdi-instagram"></span>
      </a>
      <a class="btn btn-ghost" href="https://facebook.com/Dsektionen">
        <span class="i-mdi-facebook"></span>
      </a>
      <a
        class="btn btn-ghost"
        href="https://youtube.com/channel/UCqBtN7xlh4_VvywKaRiGfkw"
      >
        <span class="i-mdi-youtube"></span>
      </a>
      <a class="btn btn-ghost" href="https://github.com/Dsek-LTH">
        <span class="i-mdi-github"></span>
      </a>
      <a
        class="btn btn-ghost"
        href="https://linkedin.com/company/datatekniksektionen-vid-tlth"
      >
        <span class="i-mdi-linkedin"></span>
      </a>
    </nav>
  </div>
</footer>
