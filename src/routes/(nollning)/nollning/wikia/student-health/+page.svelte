<script lang="ts">
  import * as m from "$paraglide/messages";
</script>

<!-- limit width and center -->
<div class="mx-auto flex max-w-screen-md flex-col gap-2">
  <section>
    <h3 class="page-title text-secondary">
      {m.nollning_wikia_studentHealth_wellBeing_header()}
    </h3>
    <p class="nolla-prose">
      {m.nollning_wikia_studentHealth_wellBeing_body()}
    </p>
    <a
      class="btn-primary-dark btn"
      href="https://docs.google.com/forms/d/e/1FAIpQLSdJxFJ6_G-1s69jKFLnmtZamioNOtZuIYnBxwdbcLLd3ZhkWA/viewform"
      target="_blank">{m.nollning_wikia_studentHealth_wellBeing_contact()}</a
    >
  </section>
  <div class="divider"></div>
  <section>
    <h3 class="page-title">
      {m.nollning_wikia_studentHealth_kurator_header()}
    </h3>
    <p class="nolla-prose">
      {m.nollning_wikia_studentHealth_kurator_body()}
    </p>
    <p class="nolla-prose leading-relaxed">
      <strong>{m.nollning_wikia_office()}:</strong>
      {m.nollning_wikia_floor()} 5, E-huset<br /><br />
      <strong class="">{m.computer_science()}</strong> <br />
      <strong>Mail: </strong>
      <a class="link" href="mailto:emma.hammarlund@lth.lu.se" target="_blank">
        emma.hammarlund@lth.lu.se
      </a><br />
      <strong>Tel: </strong>
      <a class="link" href="tel:+46462227247" target="_blank">
        046-222 72 47
      </a><br /><br />

      <strong class="">{m.infocom()}</strong>
      <br />
      <strong>Mail: </strong>
      <a class="link" href="mailto:ulla.bergman@lth.lu.se" target="_blank">
        ulla.bergman@lth.lu.se
      </a><br />
      <strong>Tel: </strong>
      <a class="link" href="tel:+46462223714" target="_blank">046-222 37 14</a
      ><br />
    </p>
  </section>
  <div class="divider"></div>
  <section>
    <h3 class="page-title">
      {m.nollning_wikia_studentHealth_studentHealth_header()}
    </h3>
    <p class="nolla-prose">
      {m.nollning_wikia_studentHealth_studentHealth_body()} <br /><br />
      <strong>Tel: </strong>
      <a class="link" href="tel:+46462224377" target="_blank">
        046-222 43 77</a
      ><br /><br />
    </p>
    <a
      class="btn-primary-dark btn"
      href="https://www.lu.se/studera/livet-som-student/service-och-stod/studenthalsan/kontakt-med-studenthalsan"
      target="_blank">{m.website()}</a
    >
  </section>
  <div class="divider"></div>
  <section>
    <h3 class="page-title">
      {m.nollning_wikia_studentHealth_youngAdults_title()}
    </h3>
    <p class="nolla-prose">
      {m.nollning_wikia_studentHealth_youngAdults_body()} <br /><br />
      <strong>Tel: </strong>
      <a class="link" href="tel:+46463598093" target="_blank">
        046-359 80 93</a
      ><br /><br />
    </p>
    <a
      class="btn-primary-dark btn"
      href="https://www.lund.se/omsorg--hjalp/familj-barn-och-ungdom/unga-vuxna/"
      target="_blank">{m.website()}</a
    >
  </section>
  <div class="divider"></div>
  <section>
    <h3 class="page-title">{m.nollning_wikia_studentHealth_priests_title()}</h3>
    <p class="nolla-prose">
      {m.nollning_wikia_studentHealth_priests_body()}<br /><br />
      <strong>Mail: </strong>
      <a
        class="link"
        href="mailto:studentprasterna.lund@svenskakyrkan.se"
        target="_blank"
      >
        studentprasterna.lund@svenskakyrkan.se
      </a><br /><br />
      <strong>Tel: </strong>
      <a class="link" href="tel:+4646718735" target="_blank">046-71 87 35</a><br
      />
    </p>
  </section>
</div>
