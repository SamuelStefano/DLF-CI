/**
 * DLF Code Review Agent — Checagem de Qualidade de Código
 *
 * - Tamanho do arquivo (> 200 linhas)
 * - Imports não utilizados
 * - console.log / console.* (sugerir Toast)
 */

const { CONFIG, isInsideCatchBlock } = require('./helpers');

// ─────────────────────────────────────────────
// Tamanho do arquivo
// ─────────────────────────────────────────────
function checkFileSize(filePath, lines) {
  const issues = [];
  if (lines.length > CONFIG.MAX_FILE_LINES) {
    issues.push({
      line: 1,
      message:
        `📏 **Arquivo com ${lines.length} linhas — nosso padrão DLF é de no máximo ${CONFIG.MAX_FILE_LINES} linhas.**\n\n` +
        `💡 **Dica**: Arquivos grandes são difíceis de manter, testar e revisar. Considere:\n` +
        `- Extrair componentes menores (atoms → molecules → organisms)\n` +
        `- Mover lógica de estado para custom hooks em \`/hooks\`\n` +
        `- Separar constantes para \`/consts\`\n` +
        `- Mover types/interfaces para \`/interfaces\` ou \`/types\`\n\n` +
        `O objetivo é que cada arquivo tenha **uma única responsabilidade** e seja fácil de entender em uma leitura rápida.`,
      severity: 'warn',
      category: 'file-size',
    });
  }
  return issues;
}

// ─────────────────────────────────────────────
// Imports não utilizados
// ─────────────────────────────────────────────
function checkUnusedImports(filePath, content, lines) {
  const issues = [];
  const importLines = [];

  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim();
    if (/^import\s/.test(trimmed)) {
      let fullImport = trimmed;
      let endLine = i;
      while (!fullImport.includes(' from ') && endLine < lines.length - 1) {
        endLine++;
        fullImport += ' ' + lines[endLine].trim();
      }
      importLines.push({ text: fullImport, line: i + 1, endLine });
    }
  }

  for (const imp of importLines) {
    const text = imp.text;

    if (/^import\s+['"]/.test(text)) continue;

    const importedNames = [];

    const namedMatch = text.match(/\{([^}]+)\}/);
    if (namedMatch) {
      namedMatch[1].split(',').forEach(n => {
        const name = n.trim().split(/\s+as\s+/).pop().trim();
        if (name && name !== 'type') importedNames.push(name);
      });
    }

    const defaultMatch = text.match(/^import\s+(?:type\s+)?(\w+)\s*(?:,|\s+from)/);
    if (defaultMatch && defaultMatch[1] !== 'type') {
      importedNames.push(defaultMatch[1]);
    }

    const nsMatch = text.match(/\*\s+as\s+(\w+)/);
    if (nsMatch) {
      importedNames.push(nsMatch[1]);
    }

    const restOfFile = lines.slice(imp.endLine + 1).join('\n');
    const unused = importedNames.filter(name => {
      const regex = new RegExp(`\\b${name}\\b`);
      return !regex.test(restOfFile);
    });

    if (unused.length > 0) {
      issues.push({
        line: imp.line,
        message:
          `🧹 **Import não utilizado**: \`${unused.join('`, `')}\`\n\n` +
          `💡 **Dica**: Imports que não são usados aumentam o bundle da aplicação e poluem o código. ` +
          `Remova-os para manter o arquivo limpo. No VS Code, use \`Ctrl+Shift+P → Organize Imports\` para limpar automaticamente.`,
        severity: 'warn',
        category: 'unused-import',
      });
    }
  }

  return issues;
}

// ─────────────────────────────────────────────
// console.log / console.*
// ─────────────────────────────────────────────
function checkConsoleLogs(filePath, content, lines) {
  const issues = [];

  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim();
    const consoleMatch = trimmed.match(/\bconsole\.(log|warn|info|debug|error|trace)\b/);
    if (!consoleMatch) continue;

    const method = consoleMatch[1];
    const inCatch = isInsideCatchBlock(lines, i);

    if (inCatch) {
      issues.push({
        line: i + 1,
        message:
          `🧹 **\`console.${method}\` em tratamento de erro** — Use **Toast** para dar feedback ao usuário.\n\n` +
          `💡 **Dica**: O usuário não vê o console do navegador. Em vez disso:\n` +
          `\`\`\`tsx\n` +
          `try {\n` +
          `  // sua lógica\n` +
          `} catch (error) {\n` +
          `  toast.error('Ops! Algo deu errado. Tente novamente.')\n` +
          `  // Se precisa logar para debug: use um serviço como Sentry\n` +
          `}\n` +
          `\`\`\``,
        severity: 'warn',
        category: 'console-in-catch',
      });
    } else {
      issues.push({
        line: i + 1,
        message:
          `🧹 **\`console.${method}\` detectado** — Remova antes de fazer merge.\n\n` +
          `💡 **Dica**: \`console.log\` é ótimo para debug local, mas não deve ir para produção. Alternativas:\n` +
          `- Para **feedback ao usuário**: use \`toast.success()\` ou \`toast.error()\`\n` +
          `- Para **monitoramento**: use um serviço como Sentry ou LogRocket\n` +
          `- Para **debug temporário**: use breakpoints no DevTools (é mais poderoso!)`,
        severity: 'warn',
        category: 'console-log',
      });
    }
  }

  return issues;
}

module.exports = { checkFileSize, checkUnusedImports, checkConsoleLogs };
