<script lang="ts">
  import * as m from "$paraglide/messages";
  import { browser } from "$app/environment";
  import { onMount } from "svelte";

  let stored: Record<string, boolean> = {};

  onMount(() => {
    const storedTodo = localStorage.getItem("nolla-todo");
    if (storedTodo) stored = JSON.parse(storedTodo);
    else stored = {};
  });

  $: (() => {
    if (browser && Object.keys(stored).length > 0)
      localStorage.setItem("nolla-todo", JSON.stringify(stored));
  })();
</script>

<!-- eslint-disable svelte/no-at-html-tags -->
<header class="flex justify-between">
  <h1 class="nolla-page-title">
    {@html m.nolla_todo_header()}
  </h1>
</header>

<article class="space-y-16 md:space-y-32">
  <section
    class="neo-brutal-border box-shadow-black-lg grid grid-cols-1 overflow-hidden bg-secondary md:grid-cols-2"
  >
    <img
      src="https://www.afbostader.se/globalassets/bostadsomraden/pireus/pf_bsflb.jpg"
      alt=""
      class="row-start-1 w-full border-r-4 border-black object-cover md:h-full md:w-auto"
    />
    <div class="p-8 md:p-16">
      <h1 class="text-xl font-bold">{@html m.nolla_todo_boende()}</h1>
      <p class="nolla-prose">
        {@html m.nolla_todo_boendeText()}
      </p>
      <a href={m.nolla_accomodation_link()} class="link"
        >{@html m.nolla_readMore()}</a
      >
      <ul class="mt-8 flex flex-wrap gap-4">
        <li>
          <a href="https://www.afbostader.se/" class="link" target="_blank">
            AF Bostäder
            <span class="i-mdi-external-link"></span>
          </a>
        </li>
        <li>
          <a
            href="https://www.facebook.com/groups/458545794323070"
            class="link"
            target="_blank"
          >
            Boende i Lund
            <span class="i-mdi-external-link"></span>
          </a>
        </li>
        <li>
          <a href="https://www.mhklund.se/" class="link" target="_blank">
            MHK
            <span class="i-mdi-external-link"></span>
          </a>
        </li>
        <li>
          <a href="https://www.lkf.se/" class="link" target="_blank">
            LKF
            <span class="i-mdi-external-link"></span>
          </a>
        </li>
      </ul>
    </div>
  </section>

  <section
    class="neo-brutal-border box-shadow-black-lg grid grid-cols-1 overflow-hidden bg-primary md:grid-cols-2"
  >
    <div class="border-r-4 border-black p-8 md:row-start-1 md:p-16">
      <h1 class="text-xl font-bold">{@html m.nolla_todo_nationer()}</h1>
      <p class="nolla-prose">
        {@html m.nolla_todo_nationerText()}
      </p>
      <a href={m.nolla_nation_link()} class="link">{@html m.nolla_readMore()}</a
      >
    </div>

    <img
      src="https://static-cdn.sr.se/images/2054/4ee08adc-68ca-45f7-bee9-579b09817ab0.jpg?preset=1024x576"
      alt=""
      class="row-start-1 w-full object-cover md:h-full md:w-auto"
    />
  </section>

  <section
    class="neo-brutal-border box-shadow-black-lg grid grid-cols-1 overflow-hidden bg-secondary md:grid-cols-2"
  >
    <img
      src="https://media.cnn.com/api/v1/images/stellar/prod/underscored-how-to-pack-a-suitcase-lead-packing.jpg?q=h_1800,w_3200,x_0,y_0"
      alt=""
      class="row-start-1 w-full border-r-4 border-black object-cover md:h-full md:w-auto"
    />

    <div class="p-8 md:p-16">
      <h1 class="text-xl font-bold">{@html m.nolla_todo_list()}</h1>
      <p class="nolla-prose">
        {@html m.nolla_todo_listText()}
      </p>
      <a href="/nolla/packing" class="link">{@html m.nolla_readMore()}</a>
    </div>
  </section>
</article>
