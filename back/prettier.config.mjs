// prettier.config.mjs
/** @type {import("prettier").Config} */
const config = {
    plugins: ['@ianvs/prettier-plugin-sort-imports'],

    importOrder: [
        '^(react/(.*)$)|^(react$)',
        '',
        '<BUILTIN_MODULES>',
        '',
        '<THIRD_PARTY_MODULES>',
        '',
        '^@/(.*)$',
        '',
        '^[./]',
    ],

    importOrderParserPlugins: ['typescript', 'jsx', 'decorators-legacy'],
    importOrderTypeScriptVersion: '5.0.0',
    importOrderCaseSensitive: false,

    semi: true,
    singleQuote: true,
    trailingComma: 'all',
    tabWidth: 2,
    printWidth: 100,
};

export default config;