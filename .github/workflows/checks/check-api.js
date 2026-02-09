/**
 * DLF Code Review Agent — Checagem de API & Banco de Dados
 *
 * - Queries Supabase diretas em componentes
 * - fetch() direto em componentes
 */

const { isInFolder, isComponent } = require('./helpers');

// ─────────────────────────────────────────────
// Queries Supabase em componentes
// ─────────────────────────────────────────────
function checkSupabaseQueries(filePath, content, lines) {
  const issues = [];
  if (isInFolder(filePath, 'lib') || isInFolder(filePath, 'services') || isInFolder(filePath, 'api')) return issues;
  if (!isComponent(filePath)) return issues;

  for (let i = 0; i < lines.length; i++) {
    if (/supabase\s*\.\s*from\(/.test(lines[i])) {
      issues.push({
        line: i + 1,
        message:
          `🗄️ **Query Supabase direta no componente** — Extraia para \`/lib/supabase\`.\n\n` +
          `💡 **Dica**: Componentes não devem ter lógica de banco de dados. Organize assim:\n` +
          `\`\`\`\n` +
          `lib/supabase/queries.ts   → funções de leitura\n` +
          `lib/supabase/mutations.ts → funções de escrita\n` +
          `hooks/use-*.ts            → hooks que consomem as queries\n` +
          `\`\`\`\n` +
          `Benefícios: reutilização, testes fáceis, separação de responsabilidades.`,
        severity: 'warn',
        category: 'supabase-in-component',
      });
      break;
    }
  }

  return issues;
}

// ─────────────────────────────────────────────
// fetch direto em componentes
// ─────────────────────────────────────────────
function checkFetchDirect(filePath, content, lines) {
  const issues = [];
  if (isInFolder(filePath, 'lib') || isInFolder(filePath, 'services') || isInFolder(filePath, 'api')) return issues;
  if (!isComponent(filePath)) return issues;

  for (let i = 0; i < lines.length; i++) {
    if (/\bfetch\s*\(/.test(lines[i]) && !/\/\//.test(lines[i].split('fetch')[0])) {
      issues.push({
        line: i + 1,
        message:
          `🌐 **\`fetch\` direto no componente** — Centralize chamadas de API.\n\n` +
          `💡 **Dica**: Crie funções de API centralizadas:\n` +
          `\`\`\`tsx\n` +
          `// lib/api/client.ts\n` +
          `export async function apiGet<T>(endpoint: string): Promise<T> {\n` +
          `  const res = await fetch(endpoint)\n` +
          `  if (!res.ok) throw new Error('Erro na requisição')\n` +
          `  return res.json()\n` +
          `}\n` +
          `\`\`\`\n` +
          `Ou use React Query / SWR para cache automático e revalidação.`,
        severity: 'warn',
        category: 'fetch-in-component',
      });
      break;
    }
  }

  return issues;
}

module.exports = { checkSupabaseQueries, checkFetchDirect };
