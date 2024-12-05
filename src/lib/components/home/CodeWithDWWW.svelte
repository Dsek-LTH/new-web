<script lang="ts">
  import dayjs from "dayjs";
  import * as m from "$paraglide/messages";
  export let commitCount: string;
  export let commitData: {
    author: string;
    message: string;
    avatarUrl: string;
    date: string;
    url: string;
  };

  const commitMessageHeader = commitData.message.split("\n")[0];
</script>

<div
  class="rounded-t-xl border-t-4 bg-base-300 p-4 text-2xl font-bold max-lg:border-t-secondary lg:border-t-primary xl:border-t-secondary"
>
  <a href="https://github.com/Dsek-LTH/web" class="hover:underline"
    >{m.home_codeWithDWWW()}</a
  >
</div>
<div class="flex flex-col rounded-b-xl bg-base-200 p-4">
  {m.home_DWWWMessage()}
  <div class="flex flex-wrap justify-between pt-4">
    <a class="btn btn-ghost btn-sm" href="https://github.com/Dsek-LTH/web"
      ><span
        class="i-mdi-github text-lg max-lg:text-secondary lg:text-primary xl:text-secondary"
      ></span> Github</a
    >
    <a
      class="btn btn-ghost btn-sm"
      href="https://github.com/Dsek-LTH/web/issues/new"
      ><span
        class="i-mdi-bug text-lg max-lg:text-secondary lg:text-primary xl:text-secondary"
      ></span>
      {m.home_reportBug()}</a
    >
    <a
      class="btn btn-ghost btn-sm"
      href="https://github.com/Dsek-LTH/web/commits/main/"
      ><span
        class="i-mdi-history text-lg max-lg:text-secondary lg:text-primary xl:text-secondary"
      ></span>Commits: {commitCount}</a
    >
  </div>
  <a
    href={commitData.url}
    class="m-2 flex flex-col rounded-xl bg-base-300 p-3 hover:bg-base-100 sm:flex-row sm:items-center"
  >
    <div class="flex flex-row items-center">
      <img
        class="mr-2 max-w-8 rounded-2xl"
        src={commitData.avatarUrl}
        alt="latest commiters avatar"
      />
      <span class="font-semibold">{commitData.author}</span>
    </div>
    <span class="ml-2 line-clamp-2 text-sm">{commitMessageHeader}</span>
    <span class="ml-auto whitespace-nowrap pl-2 text-right text-sm font-light"
      >{dayjs(commitData.date).fromNow()}</span
    >
  </a>
</div>
