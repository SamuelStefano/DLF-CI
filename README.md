# DLF-CI

Workflow de CI reutilizável para validar código em pull requests: roda lint e typecheck, comenta erros inline com Reviewdog, e notifica falhas.

## O que faz

1. **Lint com ESLint** — Reviewdog roda ESLint e comenta erros inline no PR
2. **Typecheck** — verifica tipos TypeScript
3. **Notificação de falha** — bot comenta no PR se algo quebrar

**Regras de qualidade (warnings):**
- ⚠️ Arquivos com mais de 150 linhas
- ⚠️ Comentários no código (inline ou mal posicionados)
- ⚠️ Regras TypeScript recomendadas (unused vars, any, etc)

**Comportamento:**
- ✅ Sucesso → CI passa em silêncio
- ❌ Falha → comentários inline do Reviewdog + comentário de resumo do bot

**Como funciona:**
- O Reviewdog executa o ESLint automaticamente nos arquivos modificados
- Comentários aparecem inline nas linhas com erro
- Não precisa configurar output JSON ou relatórios

## Como usar em outro repositório

### 1. Adicione o workflow

Crie `.github/workflows/ci.yml` no seu repo:

```yaml
name: CI

on:
  pull_request:

permissions:
  contents: read
  pull-requests: write

jobs:
  ci:
    uses: SEU-USUARIO/DLF-CI/.github/workflows/ci.yml@main
    secrets: inherit
```

Substitua `SEU-USUARIO` pelo usuário/org do GitHub onde este repo está.

### 2. Configure os scripts no package.json

```json
{
  "scripts": {
    "typecheck": "tsc --noEmit"
  },
  "devDependencies": {
    "eslint": "^9.18.0",
    "typescript": "^5.7.2",
    "@typescript-eslint/parser": "^8.20.0",
    "@typescript-eslint/eslint-plugin": "^8.20.0"
  }
}
```

**Importante:** O Reviewdog roda o ESLint automaticamente. Você só precisa do script `typecheck`.

### 3. Crie eslint.config.js

Configuração mínima para TypeScript com regras de qualidade:

```js
const tsPlugin = require("@typescript-eslint/eslint-plugin");
const tsParser = require("@typescript-eslint/parser");

module.exports = [
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: { jsx: true }
      }
    },
    plugins: {
      "@typescript-eslint": tsPlugin
    },
    rules: {
      "max-lines": ["warn", { max: 150 }],
      "no-inline-comments": ["warn"],
      "line-comment-position": ["warn", { "position": "above" }],
      ...tsPlugin.configs.recommended.rules
    }
  }
];
```

Ajuste as regras conforme necessário. As regras acima garantem:
- Aviso em arquivos com +150 linhas
- Aviso em comentários inline
- TypeScript com regras recomendadas

### 4. Crie tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020"],
    "moduleResolution": "node",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "jsx": "react-jsx",
    "noEmit": true
  },
  "include": ["**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules"]
}
```

### 5. Instale as dependências

```bash
npm install
```

Pronto. Abra um PR e o CI vai rodar automaticamente.

## Requisitos

- Node.js 20+
- TypeScript (`.ts`, `.tsx`)
- `package.json` com script `typecheck`
- ESLint + plugins TypeScript instalados
- `eslint.config.js` configurado
- `package-lock.json` commitado
- `tsconfig.json` configurado

## Estrutura mínima esperada

```
seu-repo/
├── .github/
│   └── workflows/
│       └── ci.yml
├── eslint.config.js
├── tsconfig.json
├── package.json
├── package-lock.json
└── src/
    └── *.ts ou *.tsx (seu código TypeScript)
```

## Exemplo de falha

### Comentários inline (Reviewdog)

Se houver erros de lint, o Reviewdog comenta diretamente nas linhas:

```
exemplo.ts linha 15:
⚠️ File has too many lines (152). Maximum allowed is 150
```

```
exemplo.ts linha 3:
⚠️ Unexpected comment inline with code
```

### Comentário de resumo (Bot)

Se o CI falhar completamente, o bot adiciona um comentário no PR:

> ❌ CI falhou (lint/typecheck).
>
> Logs completos: [link]
>
> Próximo passo: abrir os logs, corrigir o erro apontado e rodar `npm run typecheck` localmente antes do próximo push.

## Troubleshooting

### Reviewdog não está comentando

1. **Verifique se há erros de lint:** Rode `npx eslint --config eslint.config.js .` localmente
2. **Verifique as permissões:** O workflow precisa de `pull-requests: write`
3. **Verifique se o eslint.config.js existe:** Reviewdog usa `--config eslint.config.js .`
4. **Verifique os arquivos modificados:** Reviewdog só comenta em arquivos que foram alterados no PR

### CI passa mas há erros no código

- O Reviewdog pode gerar warnings sem falhar o CI se `fail_on_error: false`
- Verifique se os erros são warnings (⚠️) ou errors (❌)
- Errors devem fazer o CI falhar

### Lint funciona local mas não no CI

- Verifique se `eslint.config.js` está commitado
- Verifique se todas as dependências estão no `package.json`
- Compare as versões do Node (local vs CI)

## Customização

Se quiser adaptar o workflow (mudar Node version, adicionar testes, etc), fork este repo e edite `.github/workflows/ci.yml`.

---

**Dúvidas?** Veja os arquivos deste repo como referência de setup funcional.
