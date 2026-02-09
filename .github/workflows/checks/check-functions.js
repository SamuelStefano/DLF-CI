/**
 * DLF Code Review Agent — Checagem de Funções
 *
 * - Funções longas (> 30 linhas)
 * - Handlers repetitivos (padrão similar)
 * - Muitos parâmetros (> 3)
 * - Blocos try-catch repetitivos
 */

const { CONFIG, findBlockEnd } = require('./helpers');

// ─────────────────────────────────────────────
// Funções longas e abstraíveis
// ─────────────────────────────────────────────
function checkAbstractableFunctions(filePath, content, lines) {
  const issues = [];

  const functions = [];
  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim();

    const arrowMatch = trimmed.match(/^(?:export\s+)?(?:const|let)\s+(\w+)\s*=\s*(?:async\s*)?\(/);
    if (arrowMatch && /=>\s*\{?\s*$/.test(trimmed)) {
      const endLine = findBlockEnd(lines, i);
      functions.push({ name: arrowMatch[1], startLine: i, endLine, length: endLine - i + 1, line: i + 1 });
      continue;
    }

    const funcMatch = trimmed.match(/^(?:export\s+)?(?:async\s+)?function\s+(\w+)\s*\(/);
    if (funcMatch) {
      const endLine = findBlockEnd(lines, i);
      functions.push({ name: funcMatch[1], startLine: i, endLine, length: endLine - i + 1, line: i + 1 });
    }
  }

  // Funções longas
  for (const func of functions) {
    if (func.length > CONFIG.MAX_FUNCTION_LINES) {
      issues.push({
        line: func.line,
        message:
          `📐 **Função \`${func.name}\` tem ${func.length} linhas** — Considere dividir em funções menores.\n\n` +
          `💡 **Dica**: Funções longas são difíceis de testar e entender. Extraia:\n` +
          `- **Validações** → função \`validate${func.name.charAt(0).toUpperCase() + func.name.slice(1)}()\`\n` +
          `- **Transformações de dados** → função utilitária\n` +
          `- **Lógica de estado** → custom hook (se usar useState/useEffect)\n` +
          `- **Chamadas de API** → função em \`/lib\`\n\n` +
          `O ideal é que cada função faça **uma coisa** e caiba na tela.`,
        severity: 'warn',
        category: 'long-function',
      });
    }
  }

  // Handlers repetitivos
  const handlers = functions.filter(f => /^handle[A-Z]/.test(f.name) || /^on[A-Z]/.test(f.name));
  if (handlers.length >= 3) {
    const handlerBodies = handlers.map(h => lines.slice(h.startLine, h.endLine + 1).join('\n'));

    const hasRepetitivePattern = handlerBodies.filter(body =>
      /set\w+\(/.test(body) && (/fetch|supabase|axios|api/i.test(body))
    ).length >= 2;

    if (hasRepetitivePattern) {
      issues.push({
        line: handlers[0].line,
        message:
          `🔄 **Padrão repetitivo detectado** — ${handlers.length} handlers com lógica similar: ${handlers.map(h => `\`${h.name}\``).join(', ')}\n\n` +
          `💡 **Dica**: Quando vários handlers seguem o mesmo padrão (fetch → setState → loading), abstraia:\n` +
          `\`\`\`tsx\n` +
          `// hooks/use-api-action.ts\n` +
          `function useApiAction<T>(apiCall: () => Promise<T>) {\n` +
          `  const [data, setData] = useState<T | null>(null)\n` +
          `  const [loading, setLoading] = useState(false)\n` +
          `  const execute = async () => { ... }\n` +
          `  return { data, loading, execute }\n` +
          `}\n` +
          `\`\`\`\n` +
          `Isso elimina duplicação e facilita testes.`,
        severity: 'warn',
        category: 'repetitive-pattern',
      });
    }
  }

  // Funções com muitos parâmetros
  for (const func of functions) {
    const firstLine = lines[func.startLine];
    const paramMatch = firstLine.match(/\(([^)]*)\)/);
    if (paramMatch) {
      const params = paramMatch[1].split(',').filter(p => p.trim().length > 0);
      if (params.length > CONFIG.MAX_PARAMS) {
        issues.push({
          line: func.line,
          message:
            `📐 **Função \`${func.name}\` tem ${params.length} parâmetros** — Use um objeto de configuração.\n\n` +
            `💡 **Dica**: Muitos parâmetros tornam a chamada confusa. Agrupe em um objeto:\n` +
            `\`\`\`tsx\n` +
            `interface ${func.name.charAt(0).toUpperCase() + func.name.slice(1)}Params {\n` +
            `  // seus parâmetros aqui\n` +
            `}\n\n` +
            `function ${func.name}(params: ${func.name.charAt(0).toUpperCase() + func.name.slice(1)}Params) { ... }\n` +
            `\`\`\``,
          severity: 'warn',
          category: 'too-many-params',
        });
      }
    }
  }

  return issues;
}

// ─────────────────────────────────────────────
// Padrões duplicados (try-catch repetitivos)
// ─────────────────────────────────────────────
function checkDuplicatePatterns(filePath, content, lines) {
  const issues = [];

  const tryCatchBlocks = [];
  for (let i = 0; i < lines.length; i++) {
    if (/\btry\s*\{/.test(lines[i].trim())) {
      const endLine = findBlockEnd(lines, i);
      tryCatchBlocks.push({ start: i, end: endLine });
    }
  }

  if (tryCatchBlocks.length >= 3) {
    issues.push({
      line: tryCatchBlocks[0].start + 1,
      message:
        `🔄 **${tryCatchBlocks.length} blocos try-catch no mesmo arquivo** — Considere abstrair o tratamento de erros.\n\n` +
        `💡 **Dica**: Blocos try-catch repetitivos podem ser abstraídos:\n` +
        `\`\`\`tsx\n` +
        `// lib/utils/safe-execute.ts\n` +
        `async function safeExecute<T>(\n` +
        `  action: () => Promise<T>,\n` +
        `  errorMessage = 'Algo deu errado'\n` +
        `): Promise<T | null> {\n` +
        `  try {\n` +
        `    return await action()\n` +
        `  } catch (error) {\n` +
        `    toast.error(errorMessage)\n` +
        `    return null\n` +
        `  }\n` +
        `}\n` +
        `\`\`\``,
      severity: 'warn',
      category: 'duplicate-pattern',
    });
  }

  return issues;
}

module.exports = { checkAbstractableFunctions, checkDuplicatePatterns };
