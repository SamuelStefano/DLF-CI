/**
 * DLF Code Review Agent — Checagem de Funções (consolidado)
 *
 * - Funções longas → 1 issue listando todas
 * - Handlers repetitivos → 1 issue
 * - Muitos parâmetros → 1 issue por função
 * - Try-catch repetitivos → fileLevel
 */

const { CONFIG, findBlockEnd } = require('./helpers');

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

  // Funções longas — consolidar em 1 issue
  const longFuncs = functions.filter(f => f.length > CONFIG.MAX_FUNCTION_LINES);
  if (longFuncs.length > 0) {
    const list = longFuncs.map(f => `\`${f.name}\` (${f.length} linhas, L${f.line})`).join(', ');
    issues.push({
      line: longFuncs[0].line,
      message: `📐 **Função(ões) longa(s)**: ${list}\n\nDivida em funções menores. Extraia validações, transformações e chamadas de API.`,
      severity: 'warn',
      category: 'long-function',
    });
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
        message: `🔄 **Padrão repetitivo**: ${handlers.map(h => `\`${h.name}\``).join(', ')} têm lógica similar. Abstraia em um custom hook ou função genérica.`,
        severity: 'warn',
        category: 'repetitive-pattern',
      });
    }
  }

  // Funções com muitos parâmetros
  const tooManyParams = [];
  for (const func of functions) {
    const paramMatch = lines[func.startLine].match(/\(([^)]*)\)/);
    if (paramMatch) {
      const params = paramMatch[1].split(',').filter(p => p.trim().length > 0);
      if (params.length > CONFIG.MAX_PARAMS) {
        tooManyParams.push({ name: func.name, count: params.length, line: func.line });
      }
    }
  }
  if (tooManyParams.length > 0) {
    const list = tooManyParams.map(f => `\`${f.name}\` (${f.count} params, L${f.line})`).join(', ');
    issues.push({
      line: tooManyParams[0].line,
      message: `📐 **Muitos parâmetros**: ${list}\n\nUse um objeto de configuração em vez de múltiplos parâmetros.`,
      severity: 'warn',
      category: 'too-many-params',
    });
  }

  return issues;
}

function checkDuplicatePatterns(filePath, content, lines) {
  const issues = [];
  const tryCatchBlocks = [];
  for (let i = 0; i < lines.length; i++) {
    if (/\btry\s*\{/.test(lines[i].trim())) {
      tryCatchBlocks.push(i);
      const endLine = findBlockEnd(lines, i);
      i = endLine;
    }
  }

  if (tryCatchBlocks.length >= 3) {
    issues.push({
      line: 1,
      fileLevel: true,
      message: `🔄 **${tryCatchBlocks.length} blocos try-catch** — Considere criar uma função \`safeExecute()\` para abstrair o tratamento de erros com Toast.`,
      severity: 'warn',
      category: 'duplicate-pattern',
    });
  }

  return issues;
}

module.exports = { checkAbstractableFunctions, checkDuplicatePatterns };
