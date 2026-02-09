# Changelog

## [2.0.0] - 2026-02-09

### ✨ DLF Code Review Agent v2.0

Reescrita completa do sistema de review. Agora funciona como um **agente inteligente** que dá dicas educacionais.

### Adicionado

**🤖 Agent Mode:**
- Resumo completo do PR em formato de relatório (tabela, categorias, próximos passos)
- Mensagens educacionais com formato `💡 Dica:` em todos os comentários
- Elogio quando o PR está impecável (zero issues)
- Dicas contextuais baseadas nos problemas encontrados
- Atualização automática do comentário de resumo (não duplica)

**🧹 Código Limpo:**
- Detecção de **todos os comentários** no código com flag como warning
- Detecção de **código comentado** (código que foi comentado em vez de removido)
- Detecção de **TODO/FIXME/HACK** com sugestão de criar Issue
- Detecção de **imports não utilizados** com dica de Organize Imports
- Detecção de **console.log** com sugestão de usar **Toast**
- console.log em **catch blocks** → sugestão específica de Toast para erros

**📦 Constantes:**
- Detecção de constantes com **10+ linhas** → sugerir arquivo próprio em `/consts`
- Detecção de **3+ constantes UPPER_CASE** dispersas → sugerir centralização

**🧩 Componentização & Atomic Design:**
- Detecção de **múltiplos componentes** no mesmo arquivo
- Sugestão de organização em **atoms/molecules/organisms** baseada na complexidade
- Detecção de **JSX extenso** (50+ linhas) → sugerir subcomponentes

**📐 Funções & Abstração:**
- Detecção de **funções com 30+ linhas** → sugerir divisão
- Detecção de **handlers repetitivos** com padrão similar → sugerir abstração
- Detecção de **muitos parâmetros** (3+) → sugerir objeto de configuração
- Detecção de **try-catch repetitivos** (3+) → sugerir wrapper genérico

**🪝 Hooks:**
- Detecção de **custom hooks fora de /hooks**
- Detecção de **funções que usam hooks** mas não são hooks
- Detecção de **4+ hooks de efeito/memo** → sugerir extração para custom hook
- Detecção de **4+ useState** → sugerir custom hook ou useReducer

**🔧 CI Melhorado:**
- Mapa de diff para comentar apenas em linhas que estão no diff
- Fallback gracioso quando architecture-check.js não existe
- Captura de output do typecheck para incluir no resumo
- Melhor tratamento de erros com mensagens informativas

### Alterado
- `max-lines`: limite alterado de **150 → 200 linhas** (novo padrão DLF)
- `MAX_USESTATE_COUNT`: de **5 → 4** (mais rigoroso)
- Mensagens reescritas para serem **educacionais** (formato de dica/mentor)
- Traduções do ESLint ampliadas e melhoradas
- README completamente reescrito
- CUSTOMIZATION.md atualizado com novas opções

### Configuração

Novo objeto `CONFIG` no `architecture-check.js` para ajuste fácil de limites:
```js
const CONFIG = {
  MAX_FILE_LINES: 200,
  MAX_CONSTANT_LINES: 10,
  MAX_FUNCTION_LINES: 30,
  MAX_JSX_LINES: 50,
  MAX_USESTATE_COUNT: 4,
  MAX_PARAMS: 3,
  MAX_INLINE_COMMENTS_TO_FLAG: 15,
};
```

---

## [1.1.0] - 2026-02-06

### Adicionado

**Análise de Arquitetura:**
- Detecta types/interfaces inline → sugere mover para `@/types`
- Identifica constantes dispersas → sugere centralizar em `@/constants`
- Sugere extrair lógica para hooks customizados
- Detecta queries Supabase em componentes
- Identifica funções que usam hooks → sugere custom hook
- Alerta sobre JSX extenso (50+ linhas)
- Detecta `fetch` direto em componentes

**Next.js:**
- Suporte completo para Next.js (`@next/eslint-plugin-next`)
- Validação de `<Link>` vs `<a>`, `<Image>` vs `<img>`

**Componentização:**
- Detecta componentes muito longos (100+ linhas)
- Alerta sobre muitos `useState` (5+)
- Funções com muitos parâmetros (3+)

**Geral:**
- Comentários 100% em português
- Sistema de tradução de mensagens ESLint
- Suporte para React e React Hooks

## [1.0.0] - 2026-02-06

### Adicionado
- 🎉 Versão inicial com lint, typecheck e comentários automáticos
