<script lang="ts">
  import { getFileUrl } from "$lib/files/client";
  import { signIn } from "@auth/sveltekit/client";
  import * as m from "$paraglide/messages";
  import { i18n } from "$lib/utils/i18n";
  import { page } from "$app/stores";
  import { languageTag } from "$paraglide/runtime";
  import { invalidateAll } from "$app/navigation";

  let carouselEls: HTMLDivElement[] = [];

  function carouselLeft(i: number): void {
    const carouselEl = carouselEls[i];
    if (!carouselEl) return;
    const x =
      carouselEl.scrollLeft <= 1 // should be == 0, but we'll account for floating point errors
        ? carouselEl.clientWidth * carouselEl.childElementCount // loop
        : carouselEl.scrollLeft - carouselEl.clientWidth; // step left
    carouselEl.scroll(x, 0);
  }

  function carouselRight(i: number): void {
    const carouselEl = carouselEls[i];
    if (!carouselEl) return;
    const x =
      carouselEl.scrollLeft + 1 >=
      carouselEl.scrollWidth - carouselEl.clientWidth
        ? 0 // loop
        : carouselEl.scrollLeft + carouselEl.clientWidth; // step right
    carouselEl.scroll(x, 0);
  }

  let drawerOpen = false;
  function closeDrawer() {
    drawerOpen = !drawerOpen;
  }

  const SECTIONS = [
    {
      title: m.landing_party_title(),
      slogan: m.landing_party_slogan(),
      description: m.landing_party_description(),
      images: ["party-1.jpg", "party-2.jpg", "party-3.jpg"],
    },
    {
      title: m.landing_activity_title(),
      slogan: m.landing_activity_slogan(),
      description: m.landing_activity_description(),
      images: ["activity-1.jpg", "activity-2.jpg", "activity-3.jpg"],
    },
  ] as const;

  const ARTICLES = [
    {
      title: m.landing_guild_title(),
      description: m.landing_guild_description(),
      image: "guild.jpg",
      imagePosition: "50% 80%",
      imageSize: "125%",
    },
    {
      title: m.landing_study_title(),
      description: m.landing_study_description(),
      image: "studies.jpg",
      imagePosition: "50% 0%",
      imageSize: "150%",
    },
    {
      title: m.landing_dchip_title(),
      description: m.landing_dchip_description(),
      image: "dchip.jpg",
      imagePosition: "50% 180%",
      imageSize: "250%",
    },
  ] as const;

  const LINKS = [
    { title: m.home(), href: "/" },
    { title: m.news(), href: "/news" },
    { title: m.events(), href: "/events" },
    { title: m.theGuild(), href: "/committees" },
    { title: m.footer_contact(), href: "/info/contact" },
  ] as const;

  const SOCIALS = [
    {
      title: "Facebook",
      href: "https://facebook.com/Dsektionen",
      icon: "i-mdi-facebook",
    },
    {
      title: "Instagram",
      href: "https://instagram.com/dseklth",
      icon: "i-mdi-instagram",
    },
    {
      title: "Discord",
      href: "https://discord.com/invite/wxHQcvZ38p",
      icon: "i-mdi-discord",
    },
    {
      title: "YouTube",
      href: "https://youtube.com/channel/UCqBtN7xlh4_VvywKaRiGfkw",
      icon: "i-mdi-youtube",
    },
    {
      title: "GitHub",
      href: "https://github.com/Dsek-LTH",
      icon: "i-mdi-github",
    },
    {
      title: "LinkedIn",
      href: "https://linkedin.com/company/dsektionen",
      icon: "i-mdi-linkedin",
    },
  ] as const;
</script>

<!-- svelte-ignore a11y_consider_explicit_label -->
<div class="drawer drawer-end">
  <input
    id="landing-drawer"
    type="checkbox"
    class="drawer-toggle"
    bind:checked={drawerOpen}
  />
  <div class="drawer-content">
    <nav class="z-10 px-10 lg:px-20 xl:px-32">
      <a href="/">
        <svg
          width="32"
          height="44"
          viewBox="0 0 32 44"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M23.3708 7.4382V5.82022H26.7865C27.1461 6.17977 27.5056 6.7191 27.8652 7.25843L23.3708 7.4382ZM29.4831 6.17977C27.5056 2.58427 23.5506 0.786516 17.7978 0.786516C16.1798 0.786516 14.9213 0.966292 13.6629 1.14607V0.426966H12.9438L0.359551 6.17977V9.23596C1.25843 9.23596 1.97753 9.59551 2.51685 10.1348C3.05618 10.6742 3.41573 11.3933 3.41573 12.2921V37.2809V36.9213C3.41573 37.8202 3.05618 38.5393 2.51685 39.0787C1.97753 39.618 1.25843 39.9775 0.359551 39.9775H0V43.573H17.7978C23.5506 43.573 27.5056 41.7753 29.4831 38.1798C31.1011 35.3034 32 29.9101 32 22.1798C32 14.4494 31.1011 9.05618 29.4831 6.17977ZM23.5506 11.0337V9.5955H28.9438C29.1236 10.3146 29.3034 10.8539 29.3034 11.0337H23.5506ZM23.5506 14.4494V13.0112H29.8427C29.8427 13.3708 30.0225 13.9101 30.0225 14.6292L23.5506 14.4494ZM23.5506 18.0449V16.6067H30.2022V18.2247H23.5506V18.0449ZM23.5506 21.6404V20.0225H30.382V21.6404H23.5506ZM30.2022 25.236H23.5506V23.618H30.2022V25.236ZM6.11236 6.17977H4.49438L7.01124 4.92135C6.65169 5.2809 6.47191 5.82022 6.11236 6.17977ZM30.2022 28.8315H23.5506V27.2135H30.2022V28.8315ZM21.2135 41.236C20.8539 41.5955 20.3146 41.9551 19.7753 41.9551H18.3371V40.1573H16.7191C15.8202 40.1573 15.1011 39.7978 14.5618 39.2584C14.0225 38.7191 13.6629 38 13.6629 37.1011V4.20225C13.8427 3.12359 14.5618 2.58427 15.6404 2.58427H19.7753C20.3146 2.58427 20.8539 2.76404 21.2135 3.12359C21.573 3.48315 21.7528 4.02247 21.7528 4.5618V39.7978C21.9326 40.3371 21.7528 40.8764 21.2135 41.236ZM4.67416 9.5955C4.31461 9.05618 3.95506 8.69663 3.41573 8.1573H5.21348C4.85393 8.8764 4.85393 9.23595 4.67416 9.5955ZM29.6629 32.427H23.5506V30.809H30.0225C29.8427 31.5281 29.6629 32.0674 29.6629 32.427ZM28.764 36.0225H23.5506V34.4045H29.3034L28.764 36.0225ZM26.2472 39.4382H23.3708C23.3708 39.0787 23.3708 38.5393 23.5506 37.8202H27.8652L26.2472 39.4382ZM5.21348 38.7191C5.39326 38.1798 5.57303 37.8202 5.57303 37.2809C5.93258 38 6.11236 38.5393 6.29214 38.7191H5.21348ZM1.97753 41.9551V41.7753C2.33708 41.5955 2.8764 41.4157 3.59551 40.8764H8.08989C8.62921 41.236 9.16854 41.7753 9.52809 41.9551H1.97753Z"
            fill="white"
          />
        </svg>
      </a>

      <ul
        class="hidden justify-between text-lg font-medium lg:flex lg:gap-8 xl:gap-12"
      >
        {#each LINKS as link, i}
          <li>
            <a href={link.href} class="uppercase" class:text-white={i === 0}
              >{link.title}</a
            >
          </li>
        {/each}
      </ul>

      <div class="hidden items-center gap-4 lg:flex">
        <a
          href={i18n.route($page.url.pathname)}
          hreflang={languageTag() === "sv" ? "en" : "sv"}
          on:click={() => invalidateAll()}
        >
          {languageTag() === "sv" ? "EN" : "SV"}
        </a>
        <button
          class="bg-[#433C3F]/60 px-8 py-4 uppercase text-white"
          on:click={() => signIn("keycloak")}
        >
          {m.navbar_logIn()}
        </button>
      </div>

      <label for="landing-drawer" aria-label="open sidebar" class="lg:hidden">
        <span class="i-mdi-menu size-8 align-middle"></span>
      </label>
    </nav>

    <header
      style:--url="url({getFileUrl('minio/photos/public/assets/hero.jpg')})"
      style:background-size="cover"
    >
      <div class="absolute top-1/3 px-10 lg:pl-44">
        <h1
          class="mb-4 text-5xl font-bold uppercase lg:text-9xl xl:text-[125px]"
        >
          {m.dsektionen()}
        </h1>
        <p class="mb-10 max-w-prose lg:mb-9 lg:text-xl">
          {m.landing_intro()}
        </p>

        <div class="flex flex-row items-start gap-10 lg:items-center">
          <a
            href="/committees"
            class="inline-block bg-primary px-5 py-3 font-bold text-white lg:text-xl"
          >
            {m.landing_getInvolved()}
          </a>
          <a
            href="/info/for-foretag"
            class="py-3 font-medium text-[#bfbfbf] md:self-center lg:text-xl"
          >
            {m.home_forCompanies()}
          </a>
        </div>
      </div>
    </header>

    <main class="flex flex-col gap-28">
      {#each SECTIONS as section, i}
        <section
          class="flex flex-col gap-14 lg:flex-row"
          class:lg:flex-row-reverse={i === 1}
        >
          <div
            class="carousel h-80 w-full lg:h-[500px] xl:max-w-[60%]"
            bind:this={carouselEls[i]}
          >
            {#each section.images as image, i}
              <div id="slide{i}" class="carousel-item relative w-full">
                <img
                  src={getFileUrl(`minio/photos/public/assets/${image}`)}
                  class="h-full w-full object-cover"
                  alt="party"
                  loading="lazy"
                />
              </div>
            {/each}
          </div>

          <div class="mx-10 flex flex-col gap-7 lg:mx-16 xl:mx-28">
            <h2 class="font-bold uppercase lg:text-2xl xl:text-3xl">
              {section.title}
            </h2>
            <h1
              class="text-balance text-4xl font-bold uppercase lg:text-5xl xl:text-6xl"
            >
              {section.slogan}
            </h1>
            <p class="max-w-prose text-sm lg:text-lg xl:text-xl">
              {section.description}
            </p>

            <div class="flex gap-6 lg:mt-auto lg:pb-10">
              <button
                class="size-9 bg-[#24292A] lg:size-12"
                on:click={() => carouselLeft(i)}
              >
                <span class="i-mdi-arrow-left"></span>
              </button>
              <button
                class="size-9 lg:size-12"
                class:bg-primary={i % 2 === 0}
                class:bg-secondary={i % 2 !== 0}
                on:click={() => carouselRight(i)}
              >
                <span class="i-mdi-arrow-right"></span>
              </button>
            </div>
          </div>
        </section>
      {/each}

      <section class="mx-10">
        <h2 class="mb-8 text-center font-bold uppercase lg:text-3xl">
          {m.landing_community_title()}
        </h2>
        <div class="flex flex-col gap-14 lg:flex-row lg:justify-center">
          {#each ARTICLES as article}
            <article
              style:--url="url({getFileUrl(
                `minio/photos/public/assets/${article.image}`,
              )})"
              style:background-size={article.imageSize}
              style:background-position={article.imagePosition}
              style:background-repeat="no-repeat"
            >
              <h1 class="text-xl font-bold uppercase lg:text-4xl">
                {article.title}
              </h1>
              <p
                class="max-w-prose text-sm font-medium text-[#BFBFBF] lg:max-w-[300px] lg:text-base"
              >
                {article.description}
              </p>
            </article>
          {/each}
        </div>
      </section>

      <footer class="mb-28 flex flex-col items-center gap-20">
        <a href="/">
          <svg
            width="32"
            height="44"
            viewBox="0 0 32 44"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M23.3708 7.4382V5.82022H26.7865C27.1461 6.17977 27.5056 6.7191 27.8652 7.25843L23.3708 7.4382ZM29.4831 6.17977C27.5056 2.58427 23.5506 0.786516 17.7978 0.786516C16.1798 0.786516 14.9213 0.966292 13.6629 1.14607V0.426966H12.9438L0.359551 6.17977V9.23596C1.25843 9.23596 1.97753 9.59551 2.51685 10.1348C3.05618 10.6742 3.41573 11.3933 3.41573 12.2921V37.2809V36.9213C3.41573 37.8202 3.05618 38.5393 2.51685 39.0787C1.97753 39.618 1.25843 39.9775 0.359551 39.9775H0V43.573H17.7978C23.5506 43.573 27.5056 41.7753 29.4831 38.1798C31.1011 35.3034 32 29.9101 32 22.1798C32 14.4494 31.1011 9.05618 29.4831 6.17977ZM23.5506 11.0337V9.5955H28.9438C29.1236 10.3146 29.3034 10.8539 29.3034 11.0337H23.5506ZM23.5506 14.4494V13.0112H29.8427C29.8427 13.3708 30.0225 13.9101 30.0225 14.6292L23.5506 14.4494ZM23.5506 18.0449V16.6067H30.2022V18.2247H23.5506V18.0449ZM23.5506 21.6404V20.0225H30.382V21.6404H23.5506ZM30.2022 25.236H23.5506V23.618H30.2022V25.236ZM6.11236 6.17977H4.49438L7.01124 4.92135C6.65169 5.2809 6.47191 5.82022 6.11236 6.17977ZM30.2022 28.8315H23.5506V27.2135H30.2022V28.8315ZM21.2135 41.236C20.8539 41.5955 20.3146 41.9551 19.7753 41.9551H18.3371V40.1573H16.7191C15.8202 40.1573 15.1011 39.7978 14.5618 39.2584C14.0225 38.7191 13.6629 38 13.6629 37.1011V4.20225C13.8427 3.12359 14.5618 2.58427 15.6404 2.58427H19.7753C20.3146 2.58427 20.8539 2.76404 21.2135 3.12359C21.573 3.48315 21.7528 4.02247 21.7528 4.5618V39.7978C21.9326 40.3371 21.7528 40.8764 21.2135 41.236ZM4.67416 9.5955C4.31461 9.05618 3.95506 8.69663 3.41573 8.1573H5.21348C4.85393 8.8764 4.85393 9.23595 4.67416 9.5955ZM29.6629 32.427H23.5506V30.809H30.0225C29.8427 31.5281 29.6629 32.0674 29.6629 32.427ZM28.764 36.0225H23.5506V34.4045H29.3034L28.764 36.0225ZM26.2472 39.4382H23.3708C23.3708 39.0787 23.3708 38.5393 23.5506 37.8202H27.8652L26.2472 39.4382ZM5.21348 38.7191C5.39326 38.1798 5.57303 37.8202 5.57303 37.2809C5.93258 38 6.11236 38.5393 6.29214 38.7191H5.21348ZM1.97753 41.9551V41.7753C2.33708 41.5955 2.8764 41.4157 3.59551 40.8764H8.08989C8.62921 41.236 9.16854 41.7753 9.52809 41.9551H1.97753Z"
              fill="white"
            />
          </svg>
        </a>

        <ul
          class="flex flex-col gap-12 text-center text-xl font-medium lg:flex-row"
        >
          {#each LINKS as link}
            <li>
              <a href={link.href} class="uppercase">{link.title}</a>
            </li>
          {/each}
        </ul>

        <ul class="grid grid-cols-3 grid-rows-2 gap-12 lg:flex">
          {#each SOCIALS as social}
            <li>
              <a href={social.href} target="_blank">
                <span class="{social.icon} size-8"></span>
              </a>
            </li>
          {/each}
        </ul>
      </footer>
    </main>
  </div>

  <!-- DRAWER -->
  <div class="drawer-side z-10">
    <label
      for="landing-drawer"
      aria-label="close sidebar"
      class="drawer-overlay"
    ></label>
    <ul
      class="menu min-h-full min-w-60 bg-black p-4 text-base font-medium *:mr-4"
    >
      {#each LINKS as link}
        <li>
          <a
            href={link.href}
            class="uppercase active:!bg-primary/10"
            on:click={closeDrawer}
          >
            {link.title}
          </a>
        </li>
      {/each}
      <li>
        <button
          class=" bg-[#433C3F]/60 uppercase text-white"
          on:click={() => signIn("keycloak")}
        >
          {m.navbar_logIn()}
        </button>
      </li>
      <li class="flex flex-row self-center pt-4">
        <a
          href={i18n.route($page.url.pathname)}
          hreflang="sv"
          class="h-full rounded-full"
          class:badge={languageTag() === "sv"}
          on:click={() => invalidateAll()}
        >
          SV
        </a>
        <a
          href={i18n.route($page.url.pathname)}
          hreflang="en"
          class="h-full rounded-full"
          class:badge={languageTag() === "en"}
          on:click={() => invalidateAll()}
        >
          EN
        </a>
      </li>
    </ul>
  </div>
</div>

<style>
  /*
   * These styles have been imported from Figma.
   * They should be replaced with Tailwind CSS classes.
   */
  @import url("https://fonts.googleapis.com/css2?family=Roboto+Condensed:ital,wght@0,100..900;1,100..900&family=Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900&display=swap");

  nav {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    font-family: "Roboto Condensed", "Roboto", sans-serif;

    position: fixed;
    width: 100%;
    height: 100px;
    left: 0px;
    top: 0px;

    background: rgba(29, 26, 27, 0.6);
    backdrop-filter: blur(4px);
    color: #bfbfbf;
  }

  header {
    height: 100vh;
    width: 100%;
    font-family: "Roboto Condensed", "Roboto", sans-serif;

    background: linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, #000000 100%),
      linear-gradient(0deg, rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), var(--url);
    backdrop-filter: blur(2px);
  }

  header h1 {
    color: #ffffff;
  }

  header p {
    color: #bfbfbf;
    font-weight: 500;
    line-height: 1.3;
  }

  main {
    background-color: #000000;
  }

  section {
    font-family: "Roboto Condensed", "Roboto", sans-serif;
    color: #ffffff;
  }

  article {
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    align-items: center;
    padding: 50px 32px;
    gap: 20px;

    height: 400px;

    background: linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, #0d0d0d 50%),
      var(--url);
  }

  footer,
  .menu {
    font-family: "Roboto Condensed", "Roboto", sans-serif;
    color: #b3b3b3;
  }

  @media (min-width: 1024px) {
    nav {
      /* Auto layout */
      position: fixed;
      width: 100%;
      height: 120px;
      left: 0px;
      top: 0px;

      background: rgba(29, 26, 27, 0.6);
      backdrop-filter: blur(4px);
      /* Note: backdrop-filter has minimal browser support */
    }

    article {
      height: 500px;
    }
  }
</style>
