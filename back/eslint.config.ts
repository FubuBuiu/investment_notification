import tseslint from "typescript-eslint";
import importPlugin from "eslint-plugin-import";
import simpleImportSort from "eslint-plugin-simple-import-sort";

// NÃO use defineConfig() - exporte o array diretamente
export default [
  // Configuração base do TypeScript
  ...tseslint.configs.recommended,

  // Configuração personalizada
  {
    files: ["**/*.{js,ts,jsx,tsx}"],

    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: "./tsconfig.json",
        tsconfigRootDir: import.meta.dirname,
        ecmaVersion: "latest",
        sourceType: "module",
      },
    },

    plugins: {
      "@typescript-eslint": tseslint.plugin,
      import: importPlugin,
      "simple-import-sort": simpleImportSort,
    },

    settings: {
      "import/resolver": {
        typescript: {
          alwaysTryTypes: true,
          project: "./tsconfig.json",
        },
        node: true,
      },
    },

    rules: {
      // Ordenação de imports
      "simple-import-sort/imports": "error",
      "simple-import-sort/exports": "error",

      // Regras do import
      "import/first": "error",
      "import/newline-after-import": "error",
      "import/no-duplicates": "error",
      "import/no-unresolved": "error",
      "import/no-cycle": "error",
      "import/order": "off",

      // Namespace
      "@typescript-eslint/no-namespace": "off",
    },
  },

  // Config específica para JS
  {
    files: ["**/*.js", "**/*.jsx"],
    languageOptions: {
      parserOptions: {
        project: null,
      },
    },
  },
] satisfies import("eslint").Linter.Config[];
