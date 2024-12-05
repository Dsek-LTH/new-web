<script lang="ts">
  import * as m from "$paraglide/messages";
</script>

<a
  class="pop-out flex gap-6 rounded-2xl bg-base-300 p-6"
  href="https://bit.ly/kontaktatrivsel"
  target="_blank"
  rel="noreferrer noopener"
>
  <span class="i-mdi-speak self-center text-2xl text-secondary lg:text-primary"
  ></span>

  <article>
    <p>{m.home_feedback()}</p>
    <h2 class="text-xl font-bold text-secondary lg:text-primary">
      {m.home_contactWellbeing()}
    </h2>
  </article>
</a>
