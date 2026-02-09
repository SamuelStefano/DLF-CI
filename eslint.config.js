const tsPlugin = require("@typescript-eslint/eslint-plugin");
const tsParser = require("@typescript-eslint/parser");
const reactPlugin = require("eslint-plugin-react");
const reactHooksPlugin = require("eslint-plugin-react-hooks");
const nextPlugin = require("@next/eslint-plugin-next");

module.exports = [
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: {
          jsx: true
        }
      }
    },
    plugins: {
      "@typescript-eslint": tsPlugin,
      "react": reactPlugin,
      "react-hooks": reactHooksPlugin,
      "@next/next": nextPlugin
    },
    settings: {
      react: {
        version: "detect"
      }
    },
    rules: {
      // ─── Padrão DLF: arquivo máximo de 200 linhas ───
      "max-lines": ["warn", {
        max: 200,
        skipBlankLines: false,
        skipComments: false
      }],
      
      // ─── Componentização: função/componente máximo de 100 linhas ───
      "max-lines-per-function": ["warn", {
        max: 100,
        skipBlankLines: true,
        skipComments: true,
        IIFEs: true
      }],
      
      // ─── Complexidade de código ───
      "max-statements": ["warn", 15],
      "complexity": ["warn", 10],
      "max-depth": ["warn", 3],
      "max-nested-callbacks": ["warn", 3],
      "max-params": ["warn", 3],

      // ─── Comentários: sinalizar sempre ───
      "no-inline-comments": ["warn"],
      "line-comment-position": ["warn", { "position": "above" }],
      "no-warning-comments": ["warn", {
        "terms": ["todo", "fixme", "xxx", "note", "hack", "bug"],
        "location": "anywhere"
      }],
      "spaced-comment": ["warn", "always", {
        "line": { "markers": ["!"], "exceptions": ["-", "+", "*", "/"] },
        "block": { "markers": ["!"], "exceptions": ["*"], "balanced": true }
      }],

      // ─── Console: sempre sinalizar (usar Toast) ───
      "no-console": ["warn"],

      // ─── Imports e variáveis não utilizadas ───
      "@typescript-eslint/no-unused-vars": ["error", {
        "argsIgnorePattern": "^_",
        "varsIgnorePattern": "^_",
        "ignoreRestSiblings": true
      }],

      // ─── TypeScript ───
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/consistent-type-definitions": ["warn", "interface"],

      // ─── React ───
      "react/jsx-uses-react": "off",
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
      "react/jsx-key": "error",
      "react/jsx-no-duplicate-props": "error",
      "react/jsx-no-undef": "error",
      "react/no-children-prop": "error",
      "react/no-danger-with-children": "error",
      "react/no-deprecated": "warn",
      "react/no-direct-mutation-state": "error",
      "react/no-unescaped-entities": "warn",
      "react/self-closing-comp": "warn",

      // ─── React Hooks ───
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",

      // ─── Next.js ───
      "@next/next/no-html-link-for-pages": "error",
      "@next/next/no-img-element": "warn",
      "@next/next/no-sync-scripts": "error",
      "@next/next/no-page-custom-font": "warn",

      // ─── Regras TypeScript recomendadas ───
      ...tsPlugin.configs.recommended.rules
    }
  }
];
