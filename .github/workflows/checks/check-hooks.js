/**
 * DLF Code Review Agent — Checagem de Hooks (consolidado)
 *
 * - Custom hooks fora de /hooks → 1 issue por hook
 * - Hook extraction → fileLevel (vai pro resumo)
 * - Muitos useState → 1 issue consolidada
 */

const { CONFIG, findBlockEnd, isInFolder, isComponent } = require('./helpers');

function checkHooksPlacement(filePath, content, lines) {
  const issues = [];
  if (isInFolder(filePath, 'hooks')) return issues;

  const misplacedHooks = [];

  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim();
    const funcMatch = trimmed.match(/^(?:export\s+)?(?:const|function)\s+(\w+)/);
    if (!funcMatch) continue;
    const funcName = funcMatch[1];

    if (/^use[A-Z]/.test(funcName)) {
      misplacedHooks.push({ name: funcName, line: i + 1 });
      continue;
    }

    if (/^[A-Z]/.test(funcName)) continue;

    const endLine = findBlockEnd(lines, i);
    const funcBody = lines.slice(i, endLine + 1).join('\n');
    if (/\buse[A-Z]\w*\(/.test(funcBody) && !funcName.startsWith('use')) {
      misplacedHooks.push({ name: funcName, line: i + 1, needsRename: true });
    }
  }

  if (misplacedHooks.length > 0) {
    const list = misplacedHooks.map(h =>
      h.needsRename
        ? `\`${h.name}\` (L${h.line}) → renomear para \`use${h.name.charAt(0).toUpperCase() + h.name.slice(1)}\``
        : `\`${h.name}\` (L${h.line})`
    ).join(', ');

    issues.push({
      line: misplacedHooks[0].line,
      message: `🪝 **Hook(s) fora de /hooks**: ${list}\n\nMova para a pasta \`/hooks\` para fácil localização e reutilização.`,
      severity: 'warn',
      category: 'hook-placement',
    });
  }

  // Hook extraction → fileLevel
  if (isComponent(filePath)) {
    const useEffectCount = (content.match(/useEffect\s*\(/g) || []).length;
    const useCallbackCount = (content.match(/useCallback\s*\(/g) || []).length;
    const useMemoCount = (content.match(/useMemo\s*\(/g) || []).length;
    const totalHooks = useEffectCount + useCallbackCount + useMemoCount;

    if (totalHooks >= 4) {
      issues.push({
        line: 1,
        fileLevel: true,
        message: `🪝 **${totalHooks} hooks de efeito/memo** — Extraia lógica para custom hooks. Ex: \`const { data, loading } = useMyFeature()\``,
        severity: 'warn',
        category: 'hook-extraction',
      });
    }
  }

  return issues;
}

function checkStateCount(filePath, content, lines) {
  const issues = [];
  if (!isComponent(filePath)) return issues;

  const stateNames = [];
  let firstLine = 0;
  for (let i = 0; i < lines.length; i++) {
    if (/\buseState\b/.test(lines[i])) {
      const nameMatch = lines[i].match(/const\s*\[(\w+)/);
      stateNames.push(nameMatch ? nameMatch[1] : 'state');
      if (!firstLine) firstLine = i + 1;
    }
  }

  if (stateNames.length > CONFIG.MAX_USESTATE_COUNT) {
    issues.push({
      line: firstLine,
      message: `🧠 **${stateNames.length} useState**: \`${stateNames.join('`, `')}\`\n\nExtraia para um custom hook ou use \`useReducer\`. Máximo recomendado: ${CONFIG.MAX_USESTATE_COUNT}.`,
      severity: 'warn',
      category: 'too-many-states',
    });
  }

  return issues;
}

module.exports = { checkHooksPlacement, checkStateCount };
