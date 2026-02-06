# Guia de Customização

## Ajustar severidade das regras

### Mudar warning para error

No `eslint.config.js`, troque `"warn"` por `"error"`:

```js
// Antes: só avisa
"max-lines": ["warn", { max: 150 }],

// Depois: faz CI falhar
"max-lines": ["error", { max: 150 }],
```

### Desabilitar regras

```js
// Desabilitar completamente
"no-console": "off",

// Desabilitar apenas para warnings
"no-console": ["error"],  // só falha em errors, ignora warnings
```

## Customizar limites

### Aumentar limite de linhas

```js
"max-lines": ["warn", { 
  max: 200,  // era 150
  skipBlankLines: true,  // ignorar linhas vazias
  skipComments: true     // ignorar comentários
}],
```

### Ajustar complexidade

```js
"complexity": ["warn", 15],  // era 10
"max-depth": ["warn", 4],    // era 3
```

## Adicionar novas traduções

No `.github/workflows/ci.yml`, edite o objeto `translations`:

```js
const translations = {
  // Adicione sua regra aqui
  'sua-regra-id': '**Título**: Explicação em português do problema e como resolver.',
  
  // Exemplo real
  'no-var': '**Use let/const**: A palavra `var` está deprecated. Use `let` ou `const` para declarar variáveis.',
};
```

## Configurar apenas TypeScript (sem React)

Se seu projeto não usa React, remova as dependências e regras:

### 1. Remover do package.json

```json
{
  "devDependencies": {
    "eslint": "^9.18.0",
    "typescript": "^5.7.2",
    "@typescript-eslint/parser": "^8.20.0",
    "@typescript-eslint/eslint-plugin": "^8.20.0"
    // Remover estas linhas:
    // "eslint-plugin-react": "^7.37.2",
    // "eslint-plugin-react-hooks": "^5.1.0"
  }
}
```

### 2. Simplificar eslint.config.js

```js
const tsPlugin = require("@typescript-eslint/eslint-plugin");
const tsParser = require("@typescript-eslint/parser");

module.exports = [
  {
    files: ["**/*.{ts}"],  // remover tsx se não usar
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module"
      }
    },
    plugins: {
      "@typescript-eslint": tsPlugin
    },
    rules: {
      // Apenas regras de TypeScript e qualidade
      "max-lines": ["warn", { max: 150 }],
      "complexity": ["warn", 10],
      "no-console": ["warn"],
      ...tsPlugin.configs.recommended.rules
    }
  }
];
```

## Adicionar Prettier

### 1. Instalar

```bash
npm install -D prettier eslint-config-prettier
```

### 2. Criar .prettierrc

```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5"
}
```

### 3. Adicionar ao eslint.config.js

```js
const prettier = require("eslint-config-prettier");

module.exports = [
  {
    // ... suas configs
    rules: {
      // ... suas regras
    }
  },
  prettier  // desabilita regras que conflitam com Prettier
];
```

### 4. Adicionar script no package.json

```json
{
  "scripts": {
    "format": "prettier --write .",
    "typecheck": "tsc --noEmit"
  }
}
```

## Executar só em arquivos específicos

### Apenas src/

```js
files: ["src/**/*.{ts,tsx}"],
```

### Ignorar arquivos

Crie `.eslintignore`:

```
node_modules/
dist/
build/
*.config.js
*.test.ts
__tests__/
```

## Ajustar Node version

No `.github/workflows/ci.yml`:

```yaml
- name: Setup Node
  uses: actions/setup-node@v4
  with:
    node-version: 22  # era 20
    cache: npm
```

## Desabilitar comentários do bot

Se não quiser comentários inline, apenas falhar o CI:

No `.github/workflows/ci.yml`, remova o step "Comentar erros inline" e deixe apenas:

```yaml
- name: Lint
  run: npx eslint --config eslint.config.js .

- name: Typecheck
  run: npm run typecheck
```

## Adicionar testes ao workflow

```yaml
- name: Typecheck
  run: npm run typecheck

# Adicionar depois do typecheck
- name: Run tests
  run: npm test
```

---

**Dúvidas?** Abra uma issue no repo ou consulte a [documentação do ESLint](https://eslint.org/docs/latest/).
