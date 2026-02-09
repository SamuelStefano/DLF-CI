/**
 * DLF Code Review Agent — Checagem de Organização (consolidado)
 *
 * Cada tipo de problema gera NO MÁXIMO 1 issue com as linhas listadas.
 * Issues de "arquivo inteiro" vão com fileLevel: true → vão pro resumo.
 */

const path = require('path');
const { CONFIG, findBlockEnd, isInFolder, isComponent } = require('./helpers');

function checkLargeConstants(filePath, content, lines) {
  const issues = [];
  if (isInFolder(filePath, 'consts') || isInFolder(filePath, 'constants')) return issues;

  const largeConsts = [];
  for (let i = 0; i < lines.length; i++) {
    const constMatch = lines[i].trim().match(/^(?:export\s+)?const\s+([A-Z_][A-Z0-9_]*)\s*[=:]/);
    if (!constMatch) continue;
    const endLine = findBlockEnd(lines, i);
    const constLength = endLine - i + 1;
    if (constLength > CONFIG.MAX_CONSTANT_LINES) {
      largeConsts.push({ name: constMatch[1], line: i + 1, length: constLength });
    }
  }

  if (largeConsts.length > 0) {
    const names = largeConsts.map(c => `\`${c.name}\` (${c.length} linhas, L${c.line})`).join(', ');
    issues.push({
      line: largeConsts[0].line,
      message: `📦 **Constante(s) extensa(s)**: ${names}\n\nMova para arquivo próprio em \`/consts\`. Constantes com mais de ${CONFIG.MAX_CONSTANT_LINES} linhas merecem um arquivo dedicado.`,
      severity: 'warn',
      category: 'large-constant',
    });
  }

  const upperConstants = [];
  for (let i = 0; i < lines.length; i++) {
    if (/^(?:export\s+)?const\s+[A-Z_]{2,}\s*=/.test(lines[i].trim())) {
      upperConstants.push(lines[i].trim().match(/const\s+([A-Z_]+)/)[1]);
    }
  }
  if (upperConstants.length >= 3 && largeConsts.length === 0) {
    issues.push({
      line: 1,
      fileLevel: true,
      message: `📦 **${upperConstants.length} constantes dispersas**: \`${upperConstants.join('`, `')}\`. Centralize em \`/consts\`.`,
      severity: 'warn',
      category: 'scattered-constants',
    });
  }

  return issues;
}

function checkMultipleComponents(filePath, content, lines) {
  const issues = [];
  if (!isComponent(filePath)) return issues;

  const components = [];
  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim();
    const funcMatch = trimmed.match(/^(?:export\s+)?(?:default\s+)?function\s+([A-Z]\w+)\s*\(/);
    if (funcMatch) { components.push({ name: funcMatch[1], line: i + 1 }); continue; }
    const arrowMatch = trimmed.match(/^(?:export\s+)?const\s+([A-Z]\w+)\s*[=:]\s*(?:\([^)]*\)\s*=>|React\.FC|React\.memo|forwardRef|memo\()/);
    if (arrowMatch) components.push({ name: arrowMatch[1], line: i + 1 });
  }

  if (components.length > 1) {
    issues.push({
      line: components[1].line,
      message: `🧩 **${components.length} componentes no mesmo arquivo**: ${components.map(c => `\`${c.name}\` (L${c.line})`).join(', ')}\n\nSepare cada componente em seu próprio arquivo. No Atomic Design: 1 arquivo = 1 componente.`,
      severity: 'warn',
      category: 'multiple-components',
    });
  }

  return issues;
}

function checkInlineTypes(filePath, content, lines) {
  const issues = [];
  if (isInFolder(filePath, 'types') || isInFolder(filePath, 'interfaces')) return issues;
  if (filePath.endsWith('.types.ts') || filePath.endsWith('.d.ts')) return issues;

  const typeDeclarations = [];
  for (let i = 0; i < lines.length; i++) {
    const typeMatch = lines[i].trim().match(/^(?:export\s+)?(?:type|interface)\s+(\w+)/);
    if (!typeMatch) continue;
    const endLine = findBlockEnd(lines, i);
    typeDeclarations.push({ name: typeMatch[1], line: i + 1, length: endLine - i + 1 });
  }

  const longTypes = typeDeclarations.filter(t => t.length > 5);
  if (longTypes.length > 0) {
    const names = longTypes.map(t => `\`${t.name}\` (L${t.line})`).join(', ');
    issues.push({
      line: longTypes[0].line,
      message: `📐 **Types/Interfaces inline**: ${names}\n\nMova para \`/interfaces\` ou \`/types\`. Facilita reutilização e evita dependências circulares.`,
      severity: 'warn',
      category: 'inline-type',
    });
  } else if (typeDeclarations.length >= 3 && isComponent(filePath)) {
    issues.push({
      line: typeDeclarations[0].line,
      message: `📐 **${typeDeclarations.length} types/interfaces no componente**: ${typeDeclarations.map(t => `\`${t.name}\``).join(', ')}. Mova para \`/interfaces\`.`,
      severity: 'warn',
      category: 'inline-type',
    });
  }

  return issues;
}

function checkJSXSize(filePath, content, lines) {
  const issues = [];
  if (!isComponent(filePath)) return issues;

  for (let i = 0; i < lines.length; i++) {
    if (/^\s*return\s*\(/.test(lines[i])) {
      const endLine = findBlockEnd(lines, i);
      const jsxLength = endLine - i + 1;
      if (jsxLength > CONFIG.MAX_JSX_LINES) {
        issues.push({
          line: i + 1,
          message: `🧩 **JSX extenso (${jsxLength} linhas)** — Extraia seções em subcomponentes (atoms, molecules). Cada subcomponente deve caber na tela.`,
          severity: 'warn',
          category: 'large-jsx',
        });
      }
      break;
    }
  }

  return issues;
}

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
    if (useStateCount === 0 && useEffectCount === 0 && jsxComplexity <= 3) suggestion = `atoms/${fileName}.tsx`;
    else if (useStateCount <= 2 && jsxComplexity <= 8) suggestion = `molecules/${fileName}.tsx`;
    else suggestion = `organisms/${fileName}.tsx`;

    issues.push({
      line: 1,
      fileLevel: true,
      message: `🏗️ **Atomic Design** — Este componente deveria estar em \`components/${suggestion}\`.`,
      severity: 'warn',
      category: 'atomic-design',
    });
  }

  return issues;
}

module.exports = { checkLargeConstants, checkMultipleComponents, checkInlineTypes, checkJSXSize, checkAtomicDesign };
