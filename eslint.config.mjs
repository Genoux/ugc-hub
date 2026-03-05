import boundaries from "eslint-plugin-boundaries";
import importPlugin from "eslint-plugin-import";
import tsParser from "@typescript-eslint/parser";

export default [
  {
    files: ["src/**/*.{ts,tsx}"],
    plugins: { boundaries, import: importPlugin },
    languageOptions: {
      parser: tsParser,
    },
    settings: {
      "boundaries/elements": [
        {
          // Next.js app router — pages, layouts, API routes
          type: "app",
          pattern: "src/app/**",
          mode: "file",
        },
        {
          // Drizzle schema and migrations
          type: "db",
          pattern: "src/db/**",
          mode: "file",
        },
        {
          // Shared utilities used by 2+ features
          type: "shared",
          pattern: "src/shared/**",
          mode: "file",
        },
        {
          // Private sub-components — only importable from their parent folder
          type: "private-component",
          pattern: "src/features/*/**/*/_components/**",
          capture: ["name", "parent"],
          mode: "full",
        },
        {
          // Feature domain logic — captures feature name and file's parent folder
          type: "feature",
          pattern: "src/features/*/**/*/*",
          capture: ["name", "parent"],
          mode: "full",
        },
      ],
      "import/resolver": {
        typescript: {
          alwaysTryTypes: true,
          project: "./tsconfig.json",
        },
      },
    },
    rules: {
      ...boundaries.configs.recommended.rules,
      "boundaries/no-private": "off",
      "boundaries/no-unknown": "off",
      "boundaries/no-unknown-files": "off",
      "boundaries/element-types": [
        "error",
        {
          default: "disallow",
          rules: [
            {
              // app layer can import from features, shared, db
              from: "app",
              allow: ["app", "feature", "shared", "db"],
            },
            {
              // shared can only import from shared and db — never from features
              from: "shared",
              allow: ["shared", "db"],
            },
            {
              // db is fully isolated
              from: "db",
              allow: ["db"],
            },
            {
              // features can import from any feature, shared, db
              // _components: only when in same parent folder (strict locality)
              from: "feature",
              allow: [
                "feature",
                ["private-component", { name: "${from.name}", parent: "${from.parent}" }],
                "shared",
                "db",
              ],
            },
            {
              // private-component can import from same parent's _components, feature, shared, db
              from: "private-component",
              allow: [
                ["feature", { name: "${from.name}" }],
                ["private-component", { name: "${from.name}", parent: "${from.parent}" }],
                "shared",
                "db",
              ],
            },
          ],
        },
      ],
    },
  },
];
