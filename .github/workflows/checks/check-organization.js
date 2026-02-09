/**
 * DLF Code Review Agent — Checagem de Organização
 *
 * - Constantes extensas (> 10 linhas → arquivo próprio)
 * - Constantes dispersas (3+ UPPER_CASE)
 * - Múltiplos componentes no mesmo arquivo
 * - Types / Interfaces inline
 * - JSX extenso (> 50 linhas)
 * - Atomic Design — sugestão de pastas
 */

const path = require('path');
const { CONFIG, findBlockEnd, isInFolder, isComponent } = require('./helpers');

// ─────────────────────────────────────────────
// Constantes extensas
// ─────────────────────────────────────────────
function checkLargeConstants(filePath, content, lines) {
  const issues = [];
  if (isInFolder(filePath, 'consts') || isInFolder(filePath, 'constants')) return issues;

  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim();
    const constMatch = trimmed.match(/^(?:export\s+)?const\s+([A-Z_][A-Z0-9_]*)\s*[=:]/);
    if (!constMatch) continue;

    const constName = constMatch[1];
    const endLine = findBlockEnd(lines, i);
    const constLength = endLine - i + 1;

    if (constLength > CONFIG.MAX_CONSTANT_LINES) {
      issues.push({
        line: i + 1,
        message:
          `📦 **Constante extensa: \`${constName}\` tem ${constLength} linhas** — Nosso padrão DLF recomenda mover para arquivo próprio.\n\n` +
          `💡 **Dica**: Constantes com mais de ${CONFIG.MAX_CONSTANT_LINES} linhas merecem um arquivo dedicado:\n` +
          `\`\`\`\n` +
          `consts/${constName.toLowerCase().replace(/_/g, '-')}.ts\n` +
          `\`\`\`\n` +
          `Ou agrupe constantes relacionadas:\n` +
          `\`\`\`\n` +
          `consts/index.ts  (re-exporta tudo)\n` +
          `consts/routes.ts\n` +
          `consts/config.ts\n` +
          `\`\`\`\n` +
          `Isso mantém cada arquivo enxuto e facilita imports seletivos.`,
        severity: 'warn',
        category: 'large-constant',
      });
    }
  }

  const upperConstants = [];
  for (let i = 0; i < lines.length; i++) {
    if (/^(?:export\s+)?const\s+[A-Z_]{2,}\s*=/.test(lines[i].trim())) {
      upperConstants.push({ name: lines[i].trim().match(/const\s+([A-Z_]+)/)[1], line: i + 1 });
    }
  }

  if (upperConstants.length >= 3) {
    const names = upperConstants.map(c => `\`${c.name}\``).join(', ');
    issues.push({
      line: upperConstants[0].line,
      message:
        `📦 **${upperConstants.length} constantes dispersas**: ${names}\n\n` +
        `💡 **Dica**: Quando um arquivo tem 3+ constantes UPPER_CASE, é sinal de que elas merecem ` +
        `um arquivo dedicado em \`/consts\`. Isso facilita a reutilização e evita imports circulares.`,
      severity: 'warn',
      category: 'scattered-constants',
    });
  }

  return issues;
}

// ─────────────────────────────────────────────
// Múltiplos componentes no mesmo arquivo
// ─────────────────────────────────────────────
function checkMultipleComponents(filePath, content, lines) {
  const issues = [];
  if (!isComponent(filePath)) return issues;

  const componentDeclarations = [];

  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim();
    const funcMatch = trimmed.match(/^(?:export\s+)?(?:default\s+)?function\s+([A-Z]\w+)\s*\(/);
    if (funcMatch) {
      componentDeclarations.push({ name: funcMatch[1], line: i + 1 });
      continue;
    }
    const arrowMatch = trimmed.match(/^(?:export\s+)?const\s+([A-Z]\w+)\s*[=:]\s*(?:\([^)]*\)\s*=>|React\.FC|React\.memo|forwardRef|memo\()/);
    if (arrowMatch) {
      componentDeclarations.push({ name: arrowMatch[1], line: i + 1 });
    }
  }

  if (componentDeclarations.length > 1) {
    const names = componentDeclarations.map(c => `\`${c.name}\``).join(', ');
    issues.push({
      line: componentDeclarations[1].line,
      message:
        `🧩 **${componentDeclarations.length} componentes no mesmo arquivo**: ${names}\n\n` +
        `💡 **Dica**: No padrão Atomic Design, cada componente deve ter seu próprio arquivo. Isso facilita:\n` +
        `- **Testes**: testar cada componente isoladamente\n` +
        `- **Reutilização**: importar apenas o que precisa\n` +
        `- **Manutenção**: encontrar e editar rapidamente\n\n` +
        `Sugestão de organização:\n` +
        componentDeclarations.map(c =>
          `\`components/${c.name.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()}.tsx\``
        ).join('\n'),
      severity: 'warn',
      category: 'multiple-components',
    });
  }

  return issues;
}

// ─────────────────────────────────────────────
// Types / Interfaces inline
// ─────────────────────────────────────────────
function checkInlineTypes(filePath, content, lines) {
  const issues = [];
  if (isInFolder(filePath, 'types') || isInFolder(filePath, 'interfaces')) return issues;
  if (filePath.endsWith('.types.ts') || filePath.endsWith('.d.ts')) return issues;

  const typeDeclarations = [];

  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim();
    const typeMatch = trimmed.match(/^(?:export\s+)?(?:type|interface)\s+(\w+)/);
    if (!typeMatch) continue;

    const typeName = typeMatch[1];
    const endLine = findBlockEnd(lines, i);
    const typeLength = endLine - i + 1;

    typeDeclarations.push({ name: typeName, line: i + 1, length: typeLength });
  }

  const longTypes = typeDeclarations.filter(t => t.length > 5);
  if (longTypes.length > 0) {
    for (const t of longTypes) {
      issues.push({
        line: t.line,
        message:
          `📐 **Type/Interface \`${t.name}\` inline (${t.length} linhas)** — Mova para um arquivo de types.\n\n` +
          `💡 **Dica**: Types e interfaces com mais de 5 linhas devem ficar em:\n` +
          `- \`interfaces/${t.name.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()}.ts\`\n` +
          `- Ou \`types/${t.name.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()}.ts\`\n\n` +
          `Isso permite reutilizar o type em outros arquivos sem criar dependências circulares.`,
        severity: 'warn',
        category: 'inline-type',
      });
    }
  }

  if (typeDeclarations.length >= 3 && isComponent(filePath)) {
    issues.push({
      line: typeDeclarations[0].line,
      message:
        `📐 **${typeDeclarations.length} types/interfaces no componente** — Componentes não devem definir múltiplos types.\n\n` +
        `💡 **Dica**: Mova para a pasta \`/interfaces\` ou \`/types\` e importe com:\n` +
        `\`\`\`tsx\nimport type { ${typeDeclarations.map(t => t.name).join(', ')} } from '@/interfaces/...'\n\`\`\``,
      severity: 'warn',
      category: 'inline-type',
    });
  }

  return issues;
}

// ─────────────────────────────────────────────
// JSX extenso
// ─────────────────────────────────────────────
function checkJSXSize(filePath, content, lines) {
  const issues = [];
  if (!isComponent(filePath)) return issues;

  let returnStart = -1;
  let returnEnd = -1;
  for (let i = 0; i < lines.length; i++) {
    if (/^\s*return\s*\(/.test(lines[i])) {
      returnStart = i;
      returnEnd = findBlockEnd(lines, i);
      break;
    }
  }

  if (returnStart >= 0) {
    const jsxLength = returnEnd - returnStart + 1;
    if (jsxLength > CONFIG.MAX_JSX_LINES) {
      issues.push({
        line: returnStart + 1,
        message:
          `🧩 **JSX extenso (${jsxLength} linhas)** — Divida em subcomponentes.\n\n` +
          `💡 **Dica**: Blocos grandes de JSX são difíceis de ler e manter. Extraia seções:\n` +
          `- **Seções visuais** → componentes em \`/atoms\` ou \`/molecules\`\n` +
          `- **Listas/grids** → componente próprio com .map interno\n` +
          `- **Formulários** → componente de formulário separado\n` +
          `- **Modals/Drawers** → componente próprio\n\n` +
          `Cada subcomponente deve ser simples o suficiente para entender em 30 segundos.`,
        severity: 'warn',
        category: 'large-jsx',
      });
    }
  }

  return issues;
}

// ─────────────────────────────────────────────
// Atomic Design — estrutura de pastas
// ─────────────────────────────────────────────
function checkAtomicDesign(filePath, content, lines) {
  const issues = [];
  if (!isComponent(filePath)) return issues;

  const normalized = filePath.replace(/\\/g, '/');
  const fileName = path.basename(filePath, path.extname(filePath));

  if (/\/components\/[^/]+\.tsx$/.test(normalized) && !isInFolder(filePath, 'ui')) {
    const useStateCount = (content.match(/useState/g) || []).length;
    const useEffectCount = (content.match(/useEffect/g) || []).length;
    const jsxComplexity = (content.match(/<[A-Z]/g) || []).length;

    let suggestion = '';
    if (useStateCount === 0 && useEffectCount === 0 && jsxComplexity <= 3) {
      suggestion = `atoms/${fileName}.tsx`;
    } else if (useStateCount <= 2 && jsxComplexity <= 8) {
      suggestion = `molecules/${fileName}.tsx`;
    } else {
      suggestion = `organisms/${fileName}.tsx`;
    }

    issues.push({
      line: 1,
      message:
        `🏗️ **Organização Atomic Design** — Este componente poderia estar em \`components/${suggestion}\`\n\n` +
        `💡 **Dica**: No Atomic Design, organizamos por complexidade:\n` +
        `- **atoms/** → componentes simples sem estado (Button, Input, Badge)\n` +
        `- **molecules/** → combinações de atoms com pouco estado (SearchBar, FormField)\n` +
        `- **organisms/** → seções complexas com lógica (Header, UserProfile, DataTable)\n` +
        `- **ui/** → componentes de design system (shadcn, etc.)\n\n` +
        `Essa organização facilita encontrar e reutilizar componentes.`,
      severity: 'warn',
      category: 'atomic-design',
    });
  }

  return issues;
}

module.exports = {
  checkLargeConstants,
  checkMultipleComponents,
  checkInlineTypes,
  checkJSXSize,
  checkAtomicDesign,
};
