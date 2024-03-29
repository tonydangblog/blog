module.exports = {
  root: true,
  ignorePatterns: ["*.cjs"],
  env: {
    browser: true,
    node: true,
  },
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
    ecmaFeatures: {
      impliedStrict: true,
    },
  },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:astro/recommended",
    "plugin:astro/jsx-a11y-recommended",
    // "react-app",
    "prettier",
  ],
  plugins: ["svelte3"],
  settings: { "svelte3/typescript": () => require("typescript") },
  overrides: [
    { files: ["*.astro"], parser: "astro-eslint-parser" },
    { files: ["*.svelte"], processor: "svelte3/svelte3" },
  ],
};
