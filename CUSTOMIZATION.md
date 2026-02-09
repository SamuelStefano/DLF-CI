# Guia de Customização

## Configuração do Architecture Checker

### Ajustar limites

No `.github/workflows/architecture-check.js`, edite o objeto `CONFIG`:

```js
const CONFIG = {
  MAX_FILE_LINES: 200,       // Máximo de linhas por arquivo
  MAX_CONSTANT_LINES: 10,    // Constante acima disso → arquivo próprio
  MAX_FUNCTION_LINES: 30,    // Função acima disso → dividir
  MAX_JSX_LINES: 50,         // JSX acima disso → subcomponentes
  MAX_USESTATE_COUNT: 4,     // useState acima disso → custom hook
  MAX_PARAMS: 3,             // Parâmetros acima disso → objeto
  MAX_INLINE_COMMENTS_TO_FLAG: 15, // Limite de comentários sinalizados por arquivo
};
```

### Desabilitar checagens específicas

Na função `checkArchitecture` do `architecture-check.js`, comente as linhas das checagens que não quer:

```js
function checkArchitecture(filePath, content) {
  const lines = content.split('\n');
  const issues = [];

  issues.push(...checkFileSize(filePath, lines));
  // issues.push(...checkComments(filePath, lines));        // Desabilitar comentários
  issues.push(...checkUnusedImports(filePath, content, lines));
  // issues.push(...checkConsoleLogs(filePath, content, lines)); // Permitir console.log
  issues.push(...checkLargeConstants(filePath, content, lines));
  // ... etc
}
```

## Configuração do ESLint

### Ajustar severidade das regras

No `eslint.config.js`:

```js
// Antes: só avisa (CI passa)
"max-lines": ["warn", { max: 200 }],

// Depois: faz CI falhar
"max-lines": ["error", { max: 200 }],
```

### Desabilitar regras

```js
// Desabilitar completamente
"no-console": "off",

// Mudar para apenas warning
"@typescript-eslint/no-unused-vars": ["warn", {
  "argsIgnorePattern": "^_",
  "varsIgnorePattern": "^_"
}],
```

### Ajustar limites

```js
// Aumentar limite de linhas
"max-lines": ["warn", { 
  max: 300,              // era 200
  skipBlankLines: true,  // ignorar linhas vazias
  skipComments: true     // ignorar comentários
}],

// Ajustar complexidade
"complexity": ["warn", 15],  // era 10
"max-depth": ["warn", 4],    // era 3
```

## Adicionar novas traduções

No `.github/workflows/ci.yml`, edite o objeto `translations` dentro do script `Comentar erros inline`:

```js
const translations = {
  // Adicione sua regra aqui
  'sua-regra-id': '🔍 **Título**: Explicação em português.\n\n💡 **Dica**: Como resolver.',
  
  // Exemplo real
  'no-var': '🧹 **Use let/const** — A palavra `var` tem escopo confuso.\n\n💡 **Dica**: Use `const` para valores que não mudam e `let` para variáveis.',
};
```

**Padrão de mensagem:**
```
[emoji] **Título curto** — Descrição do problema.

💡 **Dica**: Explicação educacional e como corrigir.
```

## Configurar apenas TypeScript (sem React)

### 1. Remover dependências React do `package.json`

```json
{
  "devDependencies": {
    "eslint": "^9.18.0",
    "typescript": "^5.7.2",
    "@typescript-eslint/parser": "^8.20.0",
    "@typescript-eslint/eslint-plugin": "^8.20.0"
  }
}
```

### 2. Simplificar `eslint.config.js`

```js
const tsPlugin = require("@typescript-eslint/eslint-plugin");
const tsParser = require("@typescript-eslint/parser");

module.exports = [
  {
    files: ["**/*.ts"],
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
      "max-lines": ["warn", { max: 200 }],
      "no-console": ["warn"],
      "complexity": ["warn", 10],
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

### 2. Criar `.prettierrc`

```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5"
}
```

### 3. Adicionar ao `eslint.config.js`

```js
const prettier = require("eslint-config-prettier");

module.exports = [
  {
    // ... suas configs
  },
  prettier  // desabilita regras que conflitam com Prettier
];
```

### 4. Adicionar scripts

```json
{
  "scripts": {
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "typecheck": "tsc --noEmit"
  }
}
```

## Executar só em arquivos específicos

### Apenas src/

No `eslint.config.js`:
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

## Desabilitar o resumo do Agent

Se não quiser o comentário de resumo, remova o step `🤖 DLF Agent — Resumo da Review` do `ci.yml`.

## Desabilitar comentários inline

Se quiser apenas o resumo (sem comentários inline), remova o step `🤖 DLF Agent — Comentários inline` do `ci.yml`.

## Adicionar testes ao workflow

No `ci.yml`, adicione depois do typecheck:

```yaml
- name: Run tests
  id: tests
  run: npm test
  continue-on-error: true
```

---

**Dúvidas?** Abra uma issue no repo ou consulte a [documentação do ESLint](https://eslint.org/docs/latest/).
