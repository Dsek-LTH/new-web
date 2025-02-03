import { sentrySvelteKit } from "@sentry/sveltekit";
import { paraglide } from "@inlang/paraglide-js-adapter-sveltekit/vite";
import { sveltekit } from "@sveltejs/kit/vite";
import { cjsInterop } from "vite-plugin-cjs-interop";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [
    sentrySvelteKit({
      sourceMapsUploadOptions: {
        org: "d-sektionen-o6",
        project: "javascript-sveltekit",
      },
    }),
    sveltekit(),
    paraglide({
      project: "./project.inlang",
      outdir: "./src/translations/paraglide",
    }),
    cjsInterop({
      dependencies: ["@zenstackhq/server/**"],
    }),
  ],
  define: {
    SUPERFORMS_LEGACY: true, // due to breaking changes in superforms v2
  },
  test: {
    include: ["src/**/*.test.{js,ts}"],
  },
  resolve: {
    alias: {
      lib: "/src/lib",
    },
  },
});
