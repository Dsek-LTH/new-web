import typescriptEslint from "@typescript-eslint/eslint-plugin";
import globals from "globals";
import tsParser from "@typescript-eslint/parser";
import parser from "svelte-eslint-parser";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default [
  {
    ignores: [
      "**/.DS_Store",
      "**/node_modules",
      "build",
      ".svelte-kit",
      "package",
      "**/.env",
      "**/.env.*",
      "!**/.env.example",
      ".vscode",
      "src/translations/paraglide",
      "**/pnpm-lock.yaml",
      "**/package-lock.json",
      "**/yarn.lock",
    ],
  },
  ...compat.extends(
    "eslint:recommended",
    "plugin:eslint-comments/recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/stylistic",
    "plugin:svelte/recommended",
    "plugin:svelte/prettier",
    "prettier",
  ),
  {
    plugins: {
      "@typescript-eslint": typescriptEslint,
    },

    linterOptions: {
      reportUnusedDisableDirectives: true,
    },

    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },

      parser: tsParser,
      ecmaVersion: 2020,
      sourceType: "module",

      parserOptions: {
        extraFileExtensions: [".svelte"],
      },
    },

    rules: {
      "eslint-comments/require-description": "warn",

      "no-restricted-imports": [
        "warn",
        {
          patterns: [
            {
              group: ["../**/*[a-zA-Z0-9_-]*/*"],
              message:
                "\nIt looks like you're importing from a different subtree. Consider whether the imported code should really be shared. Suggestions:\n1) Write new code specific to your usage.\n2) Move the imported code to a shared location, e.g. a parent folder.\n3) Verify that you're using the correct path alias, e.g. $lib.",
            },
            {
              importNamePattern: "^(goto|redirect)",
              group: [
                "$app/navigation",
                "sveltekit-flash-message/server",
                "@sveltejs/kit",
              ],
              message:
                "Use the goto and redirect wrappers from $lib/utils/redirect instead",
            },
            {
              importNamePattern: "^(superForm)",
              group: ["sveltekit-superforms", "sveltekit-superforms/client"],
              message:
                "Use the superForm from $lib/utils/client/superForms instead",
            },
          ],
        },
      ],

      "@typescript-eslint/consistent-type-definitions": "off",

      "@typescript-eslint/array-type": [
        "error",
        {
          default: "array-simple",
        },
      ],
    },
  },
  {
    files: ["**/*.svelte"],

    languageOptions: {
      parser: parser,
      ecmaVersion: 5,
      sourceType: "script",

      parserOptions: {
        parser: "@typescript-eslint/parser",
      },
    },
  },
];
