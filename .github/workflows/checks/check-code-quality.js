/**
 * DLF Code Review Agent — Checagem de Qualidade de Código (consolidado)
 *
 * - Tamanho do arquivo → fileLevel (vai pro resumo)
 * - Imports não utilizados → 1 issue consolidada
 * - console.log → 1 issue consolidada
 */

const { CONFIG, isInsideCatchBlock } = require('./helpers');

function checkFileSize(filePath, lines) {
  const issues = [];
  if (lines.length > CONFIG.MAX_FILE_LINES) {
    issues.push({
      line: 1,
      fileLevel: true,
      message: `📏 **Arquivo com ${lines.length} linhas** — nosso padrão DLF é no máximo ${CONFIG.MAX_FILE_LINES}. Divida em componentes menores, hooks e utilitários.`,
      severity: 'warn',
      category: 'file-size',
    });
  }
  return issues;
}

function checkUnusedImports(filePath, content, lines) {
  const issues = [];
  const allUnused = [];

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
    if (defaultMatch && defaultMatch[1] !== 'type') importedNames.push(defaultMatch[1]);
    const nsMatch = text.match(/\*\s+as\s+(\w+)/);
    if (nsMatch) importedNames.push(nsMatch[1]);

    const restOfFile = lines.slice(imp.endLine + 1).join('\n');
    const unused = importedNames.filter(name => {
      const regex = new RegExp(`\\b${name}\\b`);
      return !regex.test(restOfFile);
    });

    if (unused.length > 0) {
      allUnused.push({ names: unused, line: imp.line });
    }
  }

  if (allUnused.length > 0) {
    const firstLine = allUnused[0].line;
    const lastLine = allUnused[allUnused.length - 1].line;
    const allNames = allUnused.flatMap(u => u.names);
    const lineRange = firstLine === lastLine ? `L${firstLine}` : `L${firstLine}–L${lastLine}`;

    issues.push({
      line: firstLine,
      message:
        `🧹 **Imports não utilizados (${lineRange})**: \`${allNames.join('`, `')}\`\n\n` +
        `Remova-os antes de mergear. No VS Code: \`Ctrl+Shift+P → Organize Imports\`.`,
      severity: 'warn',
      category: 'unused-import',
    });
  }

  return issues;
}

function checkConsoleLogs(filePath, content, lines) {
  const issues = [];
  const consoleLines = [];

  for (let i = 0; i < lines.length; i++) {
    const consoleMatch = lines[i].trim().match(/\bconsole\.(log|warn|info|debug|error|trace)\b/);
    if (!consoleMatch) continue;
    consoleLines.push({ line: i + 1, method: consoleMatch[1], inCatch: isInsideCatchBlock(lines, i) });
  }

  if (consoleLines.length > 0) {
    const linesList = consoleLines.map(c => `L${c.line}`).join(', ');
    const hasCatchConsole = consoleLines.some(c => c.inCatch);

    let tip = `Remova \`console.*\` antes de mergear.`;
    if (hasCatchConsole) {
      tip += ` Em blocos catch, use **toast.error()** para feedback ao usuário.`;
    }

    issues.push({
      line: consoleLines[0].line,
      message: `🧹 **${consoleLines.length} console(s) detectado(s)** — ${linesList}\n\n${tip}`,
      severity: 'warn',
      category: 'console-log',
    });
  }

  return issues;
}

module.exports = { checkFileSize, checkUnusedImports, checkConsoleLogs };
