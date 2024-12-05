<script lang="ts">
  import slasque from "$lib/nollning/slasque.webp";
  import mixed from "$lib/nollning/mixed.webp";
  import suit from "$lib/nollning/suit.webp";
  import frack from "$lib/nollning/frack.webp";
  import * as m from "$paraglide/messages";
</script>

<!-- eslint-disable svelte/no-at-html-tags -->
<header class=" max-w-prose">
  <h1 class="nolla-page-title">
    {@html m.nolla_packing_header()}
  </h1>
</header>

<article class="">
  <p class="nolla-prose">
    {@html m.nolla_packing_description()}
  </p>
  <ul
    class="grid grid-cols-1 gap-x-4 gap-y-8 md:grid-cols-2 [&_b]:inline-block [&_b]:font-semibold [&_i]:mt-0 [&_i]:size-6 [&_li]:flex [&_li]:gap-2 [&_p]:mt-0 [&_p]:font-light"
  >
    <li>
      <i class="i-mdi-bike"></i>
      <div>
        <b>{@html m.nolla_packing_bike()}</b>
        <p class="nolla-prose">{@html m.nolla_packing_bike_description()}</p>
      </div>
    </li>
    <li>
      <i class="i-mdi-shoe-sneaker"></i>
      <div>
        <b>{@html m.nolla_packing_robust_clothing()}</b>
        <p class="nolla-prose">
          {@html m.nolla_packing_robust_clothing_description()}
        </p>
      </div>
    </li>
    <li>
      <i class="i-mdi-party-popper"></i>
      <div>
        <b>{@html m.nolla_packing_theme_outfits()}</b>
        <p class="nolla-prose">
          {@html m.nolla_packing_theme_outfits_description()}
        </p>
      </div>
    </li>
    <li>
      <i class="i-mdi-tie"></i>
      <div>
        <b>{@html m.nolla_packing_fancy_clothing()}</b>
        <p class="nolla-prose">
          {@html m.nolla_packing_fancy_clothing_description()}
        </p>
      </div>
    </li>
    <li>
      <i class="i-mdi-scissors"></i>
      <div>
        <b>{@html m.nolla_packing_needle()}</b>
        <p class="nolla-prose">
          {@html m.nolla_packing_needle_description()}
        </p>
      </div>
    </li>
    <li>
      <i class="i-mdi-money"></i>
      <div>
        <b>{@html m.nolla_packing_money()}</b>
        <p class="nolla-prose">
          {@html m.nolla_packing_money_description()}
        </p>
      </div>
    </li>
    <li>
      <i class="i-mdi-face-happy"></i>
      <div>
        <b>{@html m.nolla_packing_happy_mood()}</b>
        <p class="nolla-prose">:)</p>
      </div>
    </li>
  </ul>
</article>

<section id="kladkod" class="my-16">
  <h1
    class="nolla-page-title mb-8 font-nolla-mono text-3xl font-bold sm:text-4xl"
  >
    {m.nollning_wikia_dressCodes}
  </h1>
  <ul
    class="[&>li>img]:neo-brutal-border grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-4 [&>li>h6]:text-lg [&>li>h6]:font-semibold [&>li>img]:mb-2 [&>li>img]:!border-8 [&>li>img]:object-contain [&>li>p>i]:text-sm [&>li>p>i]:opacity-80 [&>li>p]:mt-2"
  >
    <li>
      <img
        class="!border-primary"
        width={1512}
        height={2016}
        src={slasque}
        alt="Slasque-exempel"
      />
      <h6>{@html m.nolla_packing_slasque()}</h6>
      <p class="nolla-prose">
        {@html m.nolla_packing_slasque_description()}
      </p>
    </li>
    <li>
      <img
        class="!border-secondary"
        width={1512}
        height={2016}
        src={mixed}
        alt="Bruten kavaj exempel"
      />
      <h6>{@html m.nolla_packing_mixed_suit()}</h6>
      <p class="nolla-prose">
        {@html m.nolla_packing_mixed_suit_description()}
      </p>
    </li>
    <li>
      <img
        class="!border-primary"
        width={1512}
        height={2016}
        src={suit}
        alt="Mörk kostym exempel"
      />
      <h6>{@html m.nolla_packing_dark_suit()}</h6>
      <p class="nolla-prose">
        {@html m.nolla_packing_dark_suit_description()}
      </p>
    </li>
    <li>
      <img
        class="!border-secondary"
        width={1512}
        height={2016}
        src={frack}
        alt="Högtidsdräktsexempel"
      />
      <h6>{@html m.nolla_packing_frack()}</h6>
      <p class="nolla-prose">{@html m.nolla_packing_frack_description()}</p>
    </li>
  </ul>
</section>
