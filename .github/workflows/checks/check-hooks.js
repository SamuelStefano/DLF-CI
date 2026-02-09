/**
 * DLF Code Review Agent — Checagem de Hooks
 *
 * - Custom hooks fora da pasta /hooks
 * - Funções que usam hooks mas não são hooks
 * - Componentes com muitos hooks de efeito/memo (extrair)
 * - Muitos useState (> 4)
 */

const { CONFIG, findBlockEnd, isInFolder, isComponent } = require('./helpers');

// ─────────────────────────────────────────────
// Hooks fora de /hooks
// ─────────────────────────────────────────────
function checkHooksPlacement(filePath, content, lines) {
  const issues = [];
  if (isInFolder(filePath, 'hooks')) return issues;

  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim();
    const funcMatch = trimmed.match(/^(?:export\s+)?(?:const|function)\s+(\w+)/);
    if (!funcMatch) continue;

    const funcName = funcMatch[1];

    if (/^use[A-Z]/.test(funcName)) {
      issues.push({
        line: i + 1,
        message:
          `🪝 **Custom hook \`${funcName}\` fora da pasta /hooks** — Mova para o lugar correto.\n\n` +
          `💡 **Dica**: Todos os custom hooks devem ficar em \`/hooks\` para fácil localização:\n` +
          `\`\`\`\nhooks/${funcName.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()}.ts\n\`\`\``,
        severity: 'warn',
        category: 'hook-placement',
      });
      continue;
    }

    if (/^[A-Z]/.test(funcName)) continue;

    const endLine = findBlockEnd(lines, i);
    const funcBody = lines.slice(i, endLine + 1).join('\n');

    if (/\buse[A-Z]\w*\(/.test(funcBody) && !funcName.startsWith('use')) {
      issues.push({
        line: i + 1,
        message:
          `🪝 **Função \`${funcName}\` usa hooks internamente** — Transforme em um custom hook.\n\n` +
          `💡 **Dica**: Funções que usam \`useState\`, \`useEffect\`, etc. precisam ser hooks.\n` +
          `Renomeie para \`use${funcName.charAt(0).toUpperCase() + funcName.slice(1)}\` e mova para:\n` +
          `\`\`\`\nhooks/use-${funcName.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()}.ts\n\`\`\``,
        severity: 'warn',
        category: 'hook-placement',
      });
    }
  }

  // Componentes com muitos hooks de efeito/memo
  if (isComponent(filePath)) {
    const useEffectCount = (content.match(/useEffect\s*\(/g) || []).length;
    const useCallbackCount = (content.match(/useCallback\s*\(/g) || []).length;
    const useMemoCount = (content.match(/useMemo\s*\(/g) || []).length;

    const totalHooks = useEffectCount + useCallbackCount + useMemoCount;
    if (totalHooks >= 4) {
      issues.push({
        line: 1,
        message:
          `🪝 **Componente com ${totalHooks} hooks de efeito/memo** — Extraia lógica para custom hooks.\n\n` +
          `💡 **Dica**: Quando um componente tem muitos hooks, a lógica está acoplada ao render. ` +
          `Crie hooks customizados que encapsulem a lógica relacionada:\n` +
          `\`\`\`tsx\n` +
          `// Em vez de 4 hooks no componente:\n` +
          `const { data, loading, refetch } = useMyFeature()\n` +
          `\`\`\``,
        severity: 'warn',
        category: 'hook-extraction',
      });
    }
  }

  return issues;
}

// ─────────────────────────────────────────────
// Muitos useState
// ─────────────────────────────────────────────
function checkStateCount(filePath, content, lines) {
  const issues = [];
  if (!isComponent(filePath)) return issues;

  const useStateMatches = [];
  for (let i = 0; i < lines.length; i++) {
    if (/\buseState\b/.test(lines[i])) {
      const nameMatch = lines[i].match(/const\s*\[(\w+)/);
      useStateMatches.push({ name: nameMatch ? nameMatch[1] : 'state', line: i + 1 });
    }
  }

  if (useStateMatches.length > CONFIG.MAX_USESTATE_COUNT) {
    const stateNames = useStateMatches.map(s => `\`${s.name}\``).join(', ');
    issues.push({
      line: useStateMatches[0].line,
      message:
        `🧠 **${useStateMatches.length} useState neste componente**: ${stateNames}\n\n` +
        `💡 **Dica**: Muitos estados indicam um componente com responsabilidades demais. Opções:\n` +
        `1. **Custom hook**: agrupe estados relacionados em \`hooks/use-nome.ts\`\n` +
        `2. **useReducer**: se os estados mudam juntos, use um reducer\n` +
        `3. **Dividir componente**: cada sub-componente gerencia seu próprio estado\n\n` +
        `\`\`\`tsx\n` +
        `// Em vez de 5+ useState:\n` +
        `const { formData, errors, isSubmitting, handleChange, handleSubmit } = useMyForm()\n` +
        `\`\`\``,
      severity: 'warn',
      category: 'too-many-states',
    });
  }

  return issues;
}

module.exports = { checkHooksPlacement, checkStateCount };
