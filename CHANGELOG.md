# Changelog

## [Unreleased]

### Adicionado

**Análise de Arquitetura Inteligente:**
- 🏗️ Detecta types/interfaces que deveriam estar em `@/types`
- 🏗️ Identifica constantes dispersas que deveriam estar em `@/constants`
- 🏗️ Sugere extrair lógica para hooks customizados em `@/hooks`
- 🏗️ Detecta queries do Supabase em componentes (devem estar em `@/lib`)
- 🏗️ Identifica funções que usam hooks e deveriam ser custom hooks
- 🏗️ Alerta sobre componentes com muito JSX (50+ linhas)
- 🏗️ Detecta `fetch` direto em componentes (deveria estar em `@/lib/api`)

**Next.js:**
- ✅ Suporte completo para Next.js (@next/eslint-plugin-next)
- ✅ Validação de uso de `<Link>` vs `<a>`
- ✅ Validação de uso de `<Image>` vs `<img>`
- ✅ Verificação de scripts síncronos
- ✅ Sugestão de uso do `next/font`

**Componentização:**
- ✅ Detecta componentes muito longos (100+ linhas de função)
- ✅ Alerta sobre muitos `useState` no mesmo componente (5+)
- ✅ Identifica funções com muitos parâmetros (3+)
- ✅ Detecta muitas declarações em uma função (15+)

**Geral:**
- ✅ Suporte completo para React e React Hooks
- ✅ Comentários em português com mensagens específicas e contextuais
- ✅ Detecção de complexidade de código (funções, aninhamento)
- ✅ Verificação de imports não utilizados
- ✅ Regras para prop `key` em listas React
- ✅ Validação de regras de Hooks (rules-of-hooks, exhaustive-deps)
- ✅ Sistema customizado de tradução de mensagens do ESLint
- ✅ Badge de status para README

### Melhorado
- 🔧 Mensagens de erro agora são 100% em português
- 🔧 Cache automático de node_modules (via actions/setup-node)
- 🔧 Comentários inline explicam o problema e sugerem solução
- 🔧 Workflow reutilizável via `workflow_call`

### Regras incluídas

**TypeScript:**
- `@typescript-eslint/no-unused-vars` - variáveis não usadas
- `@typescript-eslint/no-explicit-any` - uso de any
- `@typescript-eslint/no-unused-expressions` - expressões sem efeito

**Qualidade de código:**
- `max-lines` - arquivos com +150 linhas
- `complexity` - funções muito complexas
- `max-depth` - aninhamento excessivo
- `max-nested-callbacks` - callbacks aninhados
- `no-console` - console.log no código

**Comentários:**
- `no-inline-comments` - comentários na mesma linha
- `line-comment-position` - posição incorreta
- `no-warning-comments` - TODOs/FIXMEs

**React:**
- `react/jsx-key` - faltou key em listas
- `react/jsx-no-undef` - componente não importado
- `react/no-direct-mutation-state` - mutação direta de state
- `react/self-closing-comp` - componentes sem auto-closing

**React Hooks:**
- `react-hooks/rules-of-hooks` - hooks usados incorretamente
- `react-hooks/exhaustive-deps` - dependências faltando

**Next.js:**
- `@next/next/no-html-link-for-pages` - uso de <a> em vez de <Link>
- `@next/next/no-img-element` - uso de <img> em vez de <Image>
- `@next/next/no-sync-scripts` - scripts síncronos
- `@next/next/no-page-custom-font` - fontes customizadas

**Componentização:**
- `max-lines-per-function` - funções/componentes muito longos
- `max-statements` - muitas declarações (states, vars)
- `max-params` - muitos parâmetros (use objeto)

**Organização:**
- `@typescript-eslint/consistent-type-definitions` - preferir interface

## [1.0.0] - 2026-02-06

### Adicionado
- 🎉 Versão inicial com lint, typecheck e comentários automáticos
