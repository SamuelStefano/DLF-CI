# DLF-CI

Workflow de CI reutilizável otimizado para **Next.js + TypeScript + Supabase**.

Valida código em pull requests, comenta erros inline em português, e **sugere melhorias de arquitetura e componentização**.

## 🎯 Principais recursos

- ✅ **Lint + Typecheck** automáticos
- 🇧🇷 **Comentários 100% em português** com contexto específico
- 🏗️ **Análise de arquitetura** - detecta problemas de organização
- 🔍 **Sugestões de componentização** - identifica quando dividir componentes
- 📦 **Detecção de hooks customizados** - sugere extrair lógica
- 🗂️ **Organização de código** - alerta sobre types, constants e queries mal posicionados
- ⚡ **Next.js otimizado** - valida uso de Link, Image, Script
- 🔒 **Supabase patterns** - detecta queries fora de lib/

## O que faz

1. **Lint com ESLint** — valida código e comenta erros inline no PR **em português**
2. **Typecheck** — verifica tipos TypeScript
3. **Comentários específicos** — mensagens traduzidas e com contexto claro
4. **Notificação de falha** — bot comenta no PR se algo quebrar

**Regras de qualidade:**

*Qualidade de código:*
- ⚠️ Arquivos com mais de 150 linhas
- ⚠️ Funções muito complexas (complexidade > 10)
- ⚠️ Aninhamento excessivo de if/for
- ⚠️ Callbacks aninhados (prefira async/await)

*TypeScript:*
- ⚠️ Variáveis não utilizadas
- ⚠️ Uso de `any`
- ⚠️ Imports desnecessários

*Código limpo:*
- ⚠️ Comentários no código (inline ou mal posicionados)
- ⚠️ TODOs/FIXMEs commitados
- ⚠️ `console.log` no código

*React/Hooks:*
- 🚫 Faltou prop `key` em listas
- 🚫 Componente não importado
- 🚫 Hooks usados incorretamente (condições, loops)
- ⚠️ Dependências faltando em useEffect/useCallback
- ⚠️ Componentes sem auto-closing

*Next.js:*
- 🚫 Uso de `<a>` em vez de `<Link>`
- ⚠️ Uso de `<img>` em vez de `<Image>`
- 🚫 Scripts síncronos sem `<Script>`
- ⚠️ Fontes customizadas sem `next/font`

*Arquitetura e Componentização:*
- 💡 Types/Interfaces inline (mova para `@/types`)
- 💡 Constantes dispersas (centralize em `@/constants`)
- 💡 Muitos `useState` (5+) - extraia para hook customizado
- 💡 Funções usando hooks - transforme em custom hook em `@/hooks`
- 💡 Queries do Supabase no componente (mova para `@/lib/supabase`)
- 💡 Muito JSX (50+ linhas) - divida em subcomponentes
- 💡 `fetch` direto no componente (use `@/lib/api` ou hook)
- ⚠️ Componente/função com 100+ linhas
- ⚠️ Função com 3+ parâmetros (use objeto de config)

**Comportamento:**
- ✅ Sucesso → CI passa em silêncio
- ❌ Falha → comentários inline **em português** + comentário de resumo do bot

**Diferencial:**
- Mensagens **100% em português** com contexto específico
- **Análise de arquitetura** além das regras do ESLint
- Detecta problemas de organização (types, constants, hooks)
- Sugere extrações e refatorações (hooks customizados, subcomponentes)
- Focado em Next.js + TypeScript + Supabase

Exemplo: em vez de "Expected an assignment or function call", aparece:
> 🚫 ERRO
> 
> **Expressão sem efeito**: Esta linha não faz nada útil. Você esqueceu de atribuir a uma variável ou chamar uma função?

Exemplo de análise de arquitetura:
> 💡 SUGESTÃO
>
> **Componentização: Muitos states (7)**: Este componente tem muitos states. Considere:
> - Extrair lógica para um hook customizado em `@/hooks`
> - Dividir em componentes menores
> - Usar useReducer se os states estão relacionados

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

### 6. (Opcional) Adicionar badge de status

Adicione no README.md do seu repo para mostrar o status do CI:

```markdown
![CI](https://github.com/SEU-USUARIO/SEU-REPO/actions/workflows/ci.yml/badge.svg)
```

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

## Exemplo de comentários

### Comentários inline (em português)

Quando houver erros, o bot comenta diretamente nas linhas problemáticas:

**Exemplo 1: Variável não usada**
```
🚫 ERRO

Variável não utilizada: 'resultado' foi declarada mas nunca é usada. 
Remova-a ou adicione um underscore no início se for intencional.

---
Regra: @typescript-eslint/no-unused-vars
```

**Exemplo 2: Expressão sem efeito**
```
🚫 ERRO

Expressão sem efeito: Esta linha não faz nada útil. 
Você esqueceu de atribuir a uma variável ou chamar uma função?

---
Regra: @typescript-eslint/no-unused-expressions
```

**Exemplo 3: Arquivo muito longo**
```
⚠️ ATENÇÃO

Arquivo muito longo: Este arquivo tem mais de 150 linhas. 
Considere dividir em componentes ou módulos menores.

---
Regra: max-lines
```

**Exemplo 4: Comentário inline**
```
⚠️ ATENÇÃO

Comentário inline: Evite comentários na mesma linha do código. 
Coloque o comentário na linha de cima para melhor legibilidade.

---
Regra: no-inline-comments
```

### Sugestões de arquitetura (além do ESLint)

O CI também analisa a estrutura do código e sugere melhorias:

**Exemplo 5: Muitos states**
```
💡 SUGESTÃO

Componentização: Muitos states (7): Este componente tem muitos states. Considere:
- Extrair lógica para um hook customizado em @/hooks
- Dividir em componentes menores
- Usar useReducer se os states estão relacionados

---
Análise de Arquitetura
```

**Exemplo 6: Query do Supabase no componente**
```
💡 SUGESTÃO

Organização: Query do Supabase no componente: Extraia queries do Supabase 
para funções em @/lib/supabase ou em um hook customizado. 
Componentes não devem ter lógica de banco.

---
Análise de Arquitetura
```

**Exemplo 7: Types inline**
```
💡 SUGESTÃO

Organização: Type/Interface inline: Mova types e interfaces para a pasta 
@/types ou para um arquivo .types.ts no mesmo diretório.

---
Análise de Arquitetura
```

**Exemplo 8: Hook customizado detectado**
```
💡 SUGESTÃO

Hook customizado detectado: A função handleUserData usa hooks internamente 
mas não está em @/hooks. Transforme em um hook customizado:

// @/hooks/use-handle-user-data.ts
export function useHandleUserData() {
  // lógica aqui
}

---
Análise de Arquitetura
```

### Comentário de resumo (Bot)

Se o CI falhar completamente, o bot adiciona um comentário no PR:

> ❌ CI falhou (lint/typecheck).
>
> Logs completos: [link]
>
> Próximo passo: abrir os logs, corrigir o erro apontado e rodar `npm run typecheck` localmente antes do próximo push.

## Troubleshooting

### Bot não está comentando

1. **Verifique se há erros de lint:** Rode `npx eslint --config eslint.config.js .` localmente
2. **Verifique as permissões:** O workflow precisa de `pull-requests: write`
3. **Verifique se o eslint.config.js existe:** O bot usa `--config eslint.config.js .`
4. **Verifique os arquivos modificados:** Só comenta em arquivos que foram alterados no PR
5. **Verifique os logs do workflow:** Procure por erros na etapa "Comentar erros inline"

### CI passa mas há erros no código

- Warnings (⚠️) não fazem o CI falhar, apenas comentam
- Errors (🚫) fazem o CI falhar
- Verifique se são warnings ou errors no output do ESLint local

### Lint funciona local mas não no CI

- Verifique se `eslint.config.js` está commitado
- Verifique se todas as dependências estão no `package.json`
- Compare as versões do Node (local vs CI)
- Rode `npm ci` localmente para testar com as mesmas dependências do CI

### Adicionar novas traduções

Para adicionar traduções de novas regras do ESLint, edite o workflow `.github/workflows/ci.yml` e adicione entradas no objeto `translations` dentro do script `Comentar erros inline`.

## Customização

Quer ajustar regras, desabilitar React, adicionar Prettier ou mudar limites?

👉 **[Veja o guia completo de customização](CUSTOMIZATION.md)**

Tópicos incluídos:
- Ajustar severidade (warning → error)
- Desabilitar regras específicas
- Customizar limites (linhas, complexidade)
- Configurar apenas TypeScript (sem React)
- Integrar Prettier
- Adicionar novas traduções

---

**Arquivos importantes:**
- 📋 [CHANGELOG.md](CHANGELOG.md) - histórico de mudanças e regras incluídas
- ⚙️ [CUSTOMIZATION.md](CUSTOMIZATION.md) - guia de personalização
- 🏗️ [ARCHITECTURE.md](ARCHITECTURE.md) - guia de arquitetura e componentização
- 📖 README.md (este arquivo) - como usar

**Recomendado para iniciantes:**
1. Leia este README para configurar o CI
2. Consulte [ARCHITECTURE.md](ARCHITECTURE.md) para entender a estrutura recomendada
3. Use [CUSTOMIZATION.md](CUSTOMIZATION.md) para ajustar regras conforme necessário

**Dúvidas?** Veja os arquivos deste repo como referência de setup funcional.
