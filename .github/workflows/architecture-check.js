/**
 * DLF Code Review Agent — Architecture Analyzer v2.0
 *
 * Orquestrador principal que importa e executa todos os módulos de checagem.
 *
 * Módulos:
 *   checks/helpers.js            → CONFIG e funções utilitárias
 *   checks/check-comments.js     → Comentários, código comentado, TODOs
 *   checks/check-code-quality.js → Tamanho do arquivo, imports, console.log
 *   checks/check-organization.js → Constantes, types, componentes, atomic design, JSX
 *   checks/check-functions.js    → Funções longas, abstraíveis, parâmetros, duplicados
 *   checks/check-hooks.js        → Hooks placement, extração, state count
 *   checks/check-api.js          → Supabase, fetch direto
 *
 * Para desabilitar uma checagem, comente a linha correspondente abaixo.
 * Para ajustar limites, edite checks/helpers.js → CONFIG.
 */

const { checkComments } = require('./checks/check-comments');
const { checkFileSize, checkUnusedImports, checkConsoleLogs } = require('./checks/check-code-quality');
const { checkLargeConstants, checkMultipleComponents, checkInlineTypes, checkJSXSize, checkAtomicDesign } = require('./checks/check-organization');
const { checkAbstractableFunctions, checkDuplicatePatterns } = require('./checks/check-functions');
const { checkHooksPlacement, checkStateCount } = require('./checks/check-hooks');
const { checkSupabaseQueries, checkFetchDirect } = require('./checks/check-api');

function checkArchitecture(filePath, content) {
  const lines = content.split('\n');
  const issues = [];

  // ── Qualidade de Código ──
  issues.push(...checkFileSize(filePath, lines));
  issues.push(...checkComments(filePath, lines));
  issues.push(...checkUnusedImports(filePath, content, lines));
  issues.push(...checkConsoleLogs(filePath, content, lines));

  // ── Organização & Atomic Design ──
  issues.push(...checkLargeConstants(filePath, content, lines));
  issues.push(...checkMultipleComponents(filePath, content, lines));
  issues.push(...checkInlineTypes(filePath, content, lines));
  issues.push(...checkJSXSize(filePath, content, lines));
  issues.push(...checkAtomicDesign(filePath, content, lines));

  // ── Funções & Abstração ──
  issues.push(...checkAbstractableFunctions(filePath, content, lines));
  issues.push(...checkDuplicatePatterns(filePath, content, lines));

  // ── Hooks ──
  issues.push(...checkHooksPlacement(filePath, content, lines));
  issues.push(...checkStateCount(filePath, content, lines));

  // ── API & Banco de Dados ──
  issues.push(...checkSupabaseQueries(filePath, content, lines));
  issues.push(...checkFetchDirect(filePath, content, lines));

  return issues;
}

module.exports = { checkArchitecture };
