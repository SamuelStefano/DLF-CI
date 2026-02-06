# DLF-CI

Workflow de CI reutilizável para validar código em pull requests: roda lint e typecheck, comenta erros inline com Reviewdog, e notifica falhas.

## O que faz

1. **Lint com ESLint** — valida o código e gera relatório
2. **Typecheck** — verifica tipos (se aplicável ao projeto)
3. **Code review inline** — Reviewdog comenta erros diretamente nas linhas do PR
4. **Notificação de falha** — bot comenta no PR se algo quebrar

**Comportamento:**
- ✅ Sucesso → CI passa em silêncio
- ❌ Falha → comentário no PR + review inline

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
    "lint:ci": "eslint --config eslint.config.js .",
    "typecheck": "tsc --noEmit"
  },
  "devDependencies": {
    "eslint": "^9.x",
    "typescript": "^5.x"
  }
}
```

Ajuste os comandos conforme o setup do seu projeto. O importante é que `lint:ci` e `typecheck` existam.

### 3. Crie eslint.config.js

Exemplo básico (ajuste as regras pro seu caso):

```js
module.exports = [
  {
    files: ["**/*.{js,ts,tsx}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module"
    },
    rules: {
      "no-console": "warn",
      "no-unused-vars": "error"
    }
  }
];
```

### 4. Instale as dependências

```bash
npm install
```

Pronto. Abra um PR e o CI vai rodar automaticamente.

## Requisitos

- Node.js 20+
- `package.json` com scripts `lint:ci` e `typecheck`
- ESLint configurado
- `package-lock.json` commitado

## Estrutura mínima esperada

```
seu-repo/
├── .github/
│   └── workflows/
│       └── ci.yml
├── eslint.config.js
├── package.json
├── package-lock.json
└── src/ (ou onde estiver seu código)
```

## Exemplo de falha

Se o lint ou typecheck falhar, o bot comenta no PR:

> ❌ CI falhou (lint/typecheck).
>
> Logs completos: [link]
>
> Próximo passo: abrir os logs, corrigir o erro apontado e rodar `npm run lint` e `npm run typecheck` localmente antes do próximo push.

E o Reviewdog adiciona comentários inline nas linhas problemáticas.

## Customização

Se quiser adaptar o workflow (mudar Node version, adicionar testes, etc), fork este repo e edite `.github/workflows/ci.yml`.

---

**Dúvidas?** Veja os arquivos deste repo como referência de setup funcional.
