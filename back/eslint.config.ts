import path from 'path';
import { fileURLToPath } from 'url';

import importPlugin from 'eslint-plugin-import';
import tseslint from 'typescript-eslint';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// NÃO use defineConfig() - exporte o array diretamente
export default [
  // Configuração base do TypeScript
  ...tseslint.configs.recommended,

  // Configuração personalizada
  {
    files: ['**/*.{js,ts,jsx,tsx}'],

    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: __dirname,
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },

    plugins: {
      '@typescript-eslint': tseslint.plugin,
      import: importPlugin,
    },

    settings: {
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
          project: './tsconfig.json',
        },
        node: true,
      },
    },

    rules: {
      'no-unused-vars': 'off',

      // Regras do import
      'import/first': 'error',
      'import/newline-after-import': 'error',
      'import/no-duplicates': 'error',
      'import/no-unresolved': 'error',
      'import/no-cycle': 'error',
      'import/order': 'off',

      // Namespace
      '@typescript-eslint/no-namespace': 'off',
      // Desativa o erro para interfaces vazias
      '@typescript-eslint/no-empty-object-type': 'off',
      // Configura a regra do TypeScript
      '@typescript-eslint/no-unused-vars': 'warn',
      // Desativar o erro para tipagem any
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },

  // Config específica para JS
  {
    files: ['**/*.js', '**/*.jsx'],
    languageOptions: {
      parserOptions: {
        project: null,
      },
    },
  },
] satisfies import('eslint').Linter.Config[];
