/**
 * DLF Code Review Agent — Checagem de Comentários
 *
 * Detecta todos os comentários no código:
 * - Comentários regulares (// e blocos multi-linha)
 * - Código comentado (mais grave)
 * - TODO / FIXME / HACK
 * - Comentários inline (na mesma linha do código)
 * - Blocos de comentário multi-linha
 *
 * Ignora: JSDoc (/**), eslint directives, pragmas.
 */

const { CONFIG, looksLikeCommentedCode } = require('./helpers');

function checkComments(filePath, lines) {
  const issues = [];
  let inMultiline = false;
  let multilineStart = -1;
  let flaggedCount = 0;

  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim();

    if (/^\s*\/[/*]\s*(eslint|@ts-|prettier|istanbul|c8|vitest|jest)/.test(lines[i])) continue;
    if (/^['"]use (client|server)['"]/.test(trimmed)) continue;

    if (!inMultiline && /\/\*/.test(trimmed) && !/\/\*\*/.test(trimmed)) {
      inMultiline = true;
      multilineStart = i;
      if (/\*\//.test(trimmed)) {
        inMultiline = false;
        if (flaggedCount < CONFIG.MAX_INLINE_COMMENTS_TO_FLAG) {
          flaggedCount++;
          issues.push({
            line: i + 1,
            message:
              `💬 **Comentário detectado** — Nosso padrão DLF preza por **código autodocumentável**.\n\n` +
              `💡 **Dica**: Se o código precisa de um comentário para ser entendido, talvez ele possa ser simplificado. ` +
              `Use nomes de variáveis e funções descritivos — eles são a melhor documentação.`,
            severity: 'warn',
            category: 'comment',
          });
        }
      }
      continue;
    }

    if (inMultiline && /\*\//.test(trimmed)) {
      inMultiline = false;
      if (flaggedCount < CONFIG.MAX_INLINE_COMMENTS_TO_FLAG) {
        flaggedCount++;
        const blockLength = i - multilineStart + 1;
        issues.push({
          line: multilineStart + 1,
          message:
            `💬 **Bloco de comentário (${blockLength} linhas)** — Comentários longos geralmente indicam código complexo demais.\n\n` +
            `💡 **Dica**: Simplifique a lógica ou extraia para uma função com nome descritivo. ` +
            `Se é documentação de API, considere usar JSDoc no arquivo de types.`,
          severity: 'warn',
          category: 'comment',
        });
      }
      continue;
    }
    if (inMultiline) continue;

    if (/^\s*\/\*\*/.test(lines[i])) {
      while (i < lines.length && !/\*\//.test(lines[i])) i++;
      continue;
    }

    if (/^\s*\/\//.test(trimmed)) {
      if (flaggedCount >= CONFIG.MAX_INLINE_COMMENTS_TO_FLAG) continue;
      flaggedCount++;

      if (looksLikeCommentedCode(lines[i])) {
        issues.push({
          line: i + 1,
          message:
            `🗑️ **Código comentado detectado** — Nunca deixe código comentado no PR.\n\n` +
            `💡 **Dica**: Código comentado polui o arquivo e confunde quem lê. ` +
            `Se não está sendo usado, remova. O Git guarda o histórico — você sempre pode recuperar depois.`,
          severity: 'warn',
          category: 'commented-code',
        });
        continue;
      }

      if (/\/\/\s*(todo|fixme|hack|xxx|bug|note)\b/i.test(lines[i])) {
        const tag = lines[i].match(/\/\/\s*(todo|fixme|hack|xxx|bug|note)/i)[1].toUpperCase();
        issues.push({
          line: i + 1,
          message:
            `🏷️ **${tag} encontrado** — Resolva antes de fazer merge.\n\n` +
            `💡 **Dica**: Comentários ${tag} são lembretes temporários. Se não pode resolver agora, ` +
            `crie uma issue no GitHub e referencie aqui para não se perder.`,
          severity: 'warn',
          category: 'todo-comment',
        });
        continue;
      }

      issues.push({
        line: i + 1,
        message:
          `💬 **Comentário no código** — Nosso padrão DLF preza por código autodocumentável.\n\n` +
          `💡 **Dica**: Antes de adicionar um comentário, pergunte-se:\n` +
          `- O nome da variável/função já explica o que faz?\n` +
          `- A lógica pode ser simplificada para ser mais clara?\n` +
          `- É realmente uma informação que o código não consegue expressar?\n\n` +
          `Se a resposta for "sim" para a última, o comentário é válido. Caso contrário, melhore o código.`,
        severity: 'warn',
        category: 'comment',
      });
      continue;
    }

    if (/\S+.*\/\/\s*\S/.test(trimmed) && !/https?:\/\//.test(trimmed) && !trimmed.startsWith('//')) {
      if (flaggedCount >= CONFIG.MAX_INLINE_COMMENTS_TO_FLAG) continue;
      flaggedCount++;
      issues.push({
        line: i + 1,
        message:
          `💬 **Comentário inline** — Evite comentários na mesma linha do código.\n\n` +
          `💡 **Dica**: Se precisa de um comentário, coloque na linha acima. ` +
          `Mas primeiro, tente melhorar o nome da variável ou função para que o comentário seja desnecessário.`,
        severity: 'warn',
        category: 'inline-comment',
      });
    }
  }

  return issues;
}

module.exports = { checkComments };
