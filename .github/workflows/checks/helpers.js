/**
 * DLF Code Review Agent — Helpers & Configuração
 *
 * Funções utilitárias compartilhadas entre todos os módulos de checagem.
 * Ajuste o CONFIG para personalizar os limites do seu projeto.
 */

const path = require('path');

// ─────────────────────────────────────────────
// Configuração (ajuste conforme seu padrão)
// ─────────────────────────────────────────────
const CONFIG = {
  MAX_FILE_LINES: 200,
  MAX_CONSTANT_LINES: 10,
  MAX_FUNCTION_LINES: 30,
  MAX_JSX_LINES: 50,
  MAX_USESTATE_COUNT: 4,
  MAX_PARAMS: 3,
  MAX_INLINE_COMMENTS_TO_FLAG: 15,
};

// ─────────────────────────────────────────────
// Funções utilitárias
// ─────────────────────────────────────────────

/** Verifica se uma linha está dentro de um bloco catch/try-catch */
function isInsideCatchBlock(lines, lineIndex) {
  let braceDepth = 0;
  for (let i = lineIndex; i >= 0; i--) {
    const line = lines[i];
    braceDepth += (line.match(/\}/g) || []).length;
    braceDepth -= (line.match(/\{/g) || []).length;
    if (/\bcatch\s*\(/.test(line) && braceDepth <= 0) return true;
    if (/\btry\s*\{/.test(line) && braceDepth <= 0) return false;
  }
  return false;
}

/** Encontra a linha final de um bloco { } ou [ ] ou ( ) */
function findBlockEnd(lines, startLine) {
  let depth = 0;
  let started = false;
  for (let i = startLine; i < lines.length; i++) {
    for (const ch of lines[i]) {
      if (ch === '{' || ch === '[' || ch === '(') { depth++; started = true; }
      if (ch === '}' || ch === ']' || ch === ')') { depth--; }
    }
    if (started && depth <= 0) return i;
  }
  return lines.length - 1;
}

/** Retorna true se a linha parece código comentado (não comentário descritivo) */
function looksLikeCommentedCode(line) {
  const stripped = line.replace(/^\s*\/\/\s?/, '').trim();
  const codePatterns = [
    /^(const|let|var|function|class|import|export|return|if|else|for|while|switch|case|break|continue|throw|try|catch|finally|await|async)\b/,
    /^\w+\s*[=!<>]+/,
    /^\w+\.\w+\s*\(/,
    /^<\/?[A-Z]/,
    /^[}\]);]+\s*$/,
    /^[{[\(]+\s*$/,
    /^\w+\s*:\s*\w/,
    /=>\s*\{?\s*$/,
  ];
  return stripped.length > 2 && codePatterns.some(p => p.test(stripped));
}

/** Verifica se o caminho está em uma pasta específica */
function isInFolder(filePath, folderName) {
  const normalized = filePath.replace(/\\/g, '/');
  return normalized.includes(`/${folderName}/`) || normalized.startsWith(`${folderName}/`);
}

/** Retorna true se o arquivo é um componente React (.tsx) */
function isComponent(filePath) {
  return filePath.endsWith('.tsx');
}

module.exports = {
  CONFIG,
  isInsideCatchBlock,
  findBlockEnd,
  looksLikeCommentedCode,
  isInFolder,
  isComponent,
};
