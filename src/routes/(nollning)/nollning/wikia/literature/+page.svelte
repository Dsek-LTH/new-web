<script lang="ts">
  import * as m from "$paraglide/messages";
  import kfs from "./kfs.webp";
</script>

<div class="mx-auto max-w-screen-md">
  <section>
    <h3 class="page-title text-secondary">{m.nollning_wikia_literature()}</h3>
    <p class="nolla-prose">
      {m.nollning_wikia_literature_body()}
    </p>
    <a
      class="btn-primary-dark btn"
      href="https://www.facebook.com/groups/1526600060932798/"
      target="_blank">Facebook<span class="i-mdi-arrow-right"></span></a
    >
  </section>
  <img class="w-full" alt="Map of campus" src={kfs} />
</div>
