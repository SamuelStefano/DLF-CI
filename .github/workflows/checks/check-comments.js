/**
 * DLF Code Review Agent — Checagem de Comentários (consolidado)
 *
 * Retorna NO MÁXIMO 1 issue de comentários + 1 de código comentado + 1 de TODOs.
 * Lista as linhas afetadas em cada uma.
 */

const { CONFIG, looksLikeCommentedCode } = require('./helpers');

function checkComments(filePath, lines) {
  const issues = [];
  let inMultiline = false;

  const commentLines = [];
  const commentedCodeLines = [];
  const todoLines = [];

  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim();

    if (/^\s*\/[/*]\s*(eslint|@ts-|prettier|istanbul|c8|vitest|jest)/.test(lines[i])) continue;
    if (/^['"]use (client|server)['"]/.test(trimmed)) continue;

    // Multi-line comment
    if (!inMultiline && /\/\*/.test(trimmed) && !/\/\*\*/.test(trimmed)) {
      inMultiline = true;
      if (/\*\//.test(trimmed)) { inMultiline = false; commentLines.push(i + 1); }
      continue;
    }
    if (inMultiline && /\*\//.test(trimmed)) { inMultiline = false; commentLines.push(i + 1); continue; }
    if (inMultiline) continue;

    // JSDoc — permitido
    if (/^\s*\/\*\*/.test(lines[i])) {
      while (i < lines.length && !/\*\//.test(lines[i])) i++;
      continue;
    }

    // Single-line comment
    if (/^\s*\/\//.test(trimmed)) {
      if (looksLikeCommentedCode(lines[i])) {
        commentedCodeLines.push(i + 1);
      } else if (/\/\/\s*(todo|fixme|hack|xxx|bug|note)\b/i.test(lines[i])) {
        todoLines.push(i + 1);
      } else {
        commentLines.push(i + 1);
      }
      continue;
    }

    // Inline comment (code // comment)
    if (/\S+.*\/\/\s*\S/.test(trimmed) && !/https?:\/\//.test(trimmed) && !trimmed.startsWith('//')) {
      commentLines.push(i + 1);
    }
  }

  // 1 issue para comentários regulares
  if (commentLines.length > 0) {
    const linesList = commentLines.slice(0, 15).join(', ');
    issues.push({
      line: commentLines[0],
      message:
        `💬 **${commentLines.length} comentário(s) no código** — Linhas: ${linesList}${commentLines.length > 15 ? '...' : ''}\n\n` +
        `Nosso padrão DLF preza por código autodocumentável. Remova comentários desnecessários antes de mergear.`,
      severity: 'warn',
      category: 'comment',
    });
  }

  // 1 issue para código comentado
  if (commentedCodeLines.length > 0) {
    const linesList = commentedCodeLines.join(', ');
    issues.push({
      line: commentedCodeLines[0],
      message:
        `🗑️ **Código comentado detectado** — Linhas: ${linesList}\n\n` +
        `Remova código comentado antes de mergear. O Git guarda o histórico — você pode recuperar depois.`,
      severity: 'warn',
      category: 'commented-code',
    });
  }

  // 1 issue para TODOs
  if (todoLines.length > 0) {
    const linesList = todoLines.join(', ');
    issues.push({
      line: todoLines[0],
      message:
        `🏷️ **TODO/FIXME encontrado** — Linhas: ${linesList}\n\n` +
        `Resolva antes de mergear, ou crie uma Issue no GitHub para não se perder.`,
      severity: 'warn',
      category: 'todo-comment',
    });
  }

  return issues;
}

module.exports = { checkComments };
