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
      // Componentização: arquivo com mais de 150 linhas
      "max-lines": ["warn", {
        max: 150,
        skipBlankLines: false,
        skipComments: false
      }],
      
      // Componentização: componente muito longo (100 linhas de função)
      "max-lines-per-function": ["warn", {
        max: 100,
        skipBlankLines: true,
        skipComments: true,
        IIFEs: true
      }],
      
      // Componentização: muitas variáveis de estado (considere dividir)
      "max-statements": ["warn", 15],
      
      // Aviso: comentários no código
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

      // Aviso: console.log
      "no-console": ["warn"],

      // Complexidade de código
      "complexity": ["warn", 10],
      "max-depth": ["warn", 3],
      "max-nested-callbacks": ["warn", 3],

      // Imports não utilizados
      "@typescript-eslint/no-unused-vars": ["error", {
        "argsIgnorePattern": "^_",
        "varsIgnorePattern": "^_"
      }],

      // Regras React
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

      // Regras React Hooks
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",

      // Next.js
      "@next/next/no-html-link-for-pages": "error",
      "@next/next/no-img-element": "warn",
      "@next/next/no-sync-scripts": "error",
      "@next/next/no-page-custom-font": "warn",

      // Organização: preferir named exports
      "import/no-default-export": "off",
      
      // Tipos: evitar declaração inline de tipos complexos
      "@typescript-eslint/consistent-type-definitions": ["warn", "interface"],
      
      // Funções: parâmetros demais = precisa de objeto de config
      "max-params": ["warn", 3],

      // Regras TypeScript recomendadas
      ...tsPlugin.configs.recommended.rules
    }
  }
];
