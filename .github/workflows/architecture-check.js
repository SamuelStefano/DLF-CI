// Checagem customizada de arquitetura
const fs = require('fs');
const path = require('path');

function checkArchitecture(filePath, content) {
  const issues = [];
  const lines = content.split('\n');
  const fileName = path.basename(filePath);
  
  // Detectar tipos inline que deveriam estar em @/types
  const inlineTypeRegex = /(?:type|interface)\s+\w+\s*=/;
  const hasInlineTypes = lines.some(line => inlineTypeRegex.test(line));
  
  if (hasInlineTypes && !filePath.includes('/types/') && !filePath.includes('\\types\\')) {
    issues.push({
      line: lines.findIndex(line => inlineTypeRegex.test(line)) + 1,
      message: '**Organização: Type/Interface inline**: Mova types e interfaces para a pasta `@/types` ou para um arquivo `.types.ts` no mesmo diretório.',
      severity: 'warn'
    });
  }
  
  // Detectar constantes que deveriam estar em @/constants
  const constantRegex = /^export const [A-Z_]{2,}/;
  const hasConstants = lines.filter(line => constantRegex.test(line.trim())).length;
  
  if (hasConstants >= 3 && !filePath.includes('/constants/') && !filePath.includes('\\constants\\')) {
    issues.push({
      line: lines.findIndex(line => constantRegex.test(line.trim())) + 1,
      message: `**Organização: Constantes dispersas**: Encontradas ${hasConstants} constantes. Considere criar um arquivo em \`@/constants\` para centralizá-las.`,
      severity: 'warn'
    });
  }
  
  // Detectar múltiplos useState (componente complexo)
  const useStateCount = (content.match(/useState/g) || []).length;
  const useEffectCount = (content.match(/useEffect/g) || []).length;
  
  if (useStateCount >= 5 && fileName.endsWith('.tsx')) {
    issues.push({
      line: 1,
      message: `**Componentização: Muitos states (${useStateCount})**: Este componente tem muitos states. Considere:\n- Extrair lógica para um hook customizado em \`@/hooks\`\n- Dividir em componentes menores\n- Usar useReducer se os states estão relacionados`,
      severity: 'warn'
    });
  }
  
  // Detectar funções complexas que poderiam ser hooks
  const functionRegex = /const\s+(\w+)\s*=\s*(?:async\s*)?\([^)]*\)\s*=>/g;
  const functions = [...content.matchAll(functionRegex)];
  
  // Detectar funções que usam hooks (deveriam ser custom hooks)
  const functionsUsingHooks = functions.filter(match => {
    const funcName = match[1];
    const funcStartIndex = match.index;
    const nextFuncIndex = content.indexOf('const ', funcStartIndex + 10);
    const funcContent = content.substring(
      funcStartIndex, 
      nextFuncIndex > 0 ? nextFuncIndex : content.length
    );
    
    return /use[A-Z]/.test(funcContent) && !funcName.startsWith('use');
  });
  
  if (functionsUsingHooks.length > 0 && fileName.endsWith('.tsx')) {
    const funcName = functionsUsingHooks[0][1];
    const lineNumber = content.substring(0, functionsUsingHooks[0].index).split('\n').length;
    
    issues.push({
      line: lineNumber,
      message: `**Hook customizado detectado**: A função \`${funcName}\` usa hooks internamente mas não está em \`@/hooks\`. Transforme em um hook customizado:\n\`\`\`ts\n// @/hooks/use-${funcName.toLowerCase()}.ts\nexport function use${funcName.charAt(0).toUpperCase() + funcName.slice(1)}() {\n  // lógica aqui\n}\n\`\`\``,
      severity: 'warn'
    });
  }
  
  // Detectar queries do Supabase que poderiam estar em @/lib/supabase
  const hasSupabaseQuery = /supabase\s*\.\s*from\(['"]\w+['"]\)/.test(content);
  const isInLib = filePath.includes('/lib/') || filePath.includes('\\lib\\');
  
  if (hasSupabaseQuery && !isInLib && fileName.endsWith('.tsx')) {
    const lineNumber = lines.findIndex(line => /supabase\s*\.\s*from/.test(line)) + 1;
    issues.push({
      line: lineNumber,
      message: '**Organização: Query do Supabase no componente**: Extraia queries do Supabase para funções em `@/lib/supabase` ou em um hook customizado. Componentes não devem ter lógica de banco.',
      severity: 'warn'
    });
  }
  
  // Detectar componentes com muito JSX (deveria ser dividido)
  const jsxLineCount = lines.filter(line => 
    /<[A-Z]/.test(line) || /<\/[A-Z]/.test(line) || /<div/.test(line)
  ).length;
  
  if (jsxLineCount > 50 && fileName.endsWith('.tsx')) {
    issues.push({
      line: 1,
      message: `**Componentização: Muito JSX (${jsxLineCount} linhas)**: Este componente tem muito markup. Divida em subcomponentes:\n- Extraia seções repetidas\n- Crie componentes para partes complexas\n- Use composition (children props)`,
      severity: 'warn'
    });
  }
  
  // Detectar fetch direto (deveria usar lib ou hook)
  if (/\bfetch\(/.test(content) && !isInLib && fileName.endsWith('.tsx')) {
    const lineNumber = lines.findIndex(line => /\bfetch\(/.test(line)) + 1;
    issues.push({
      line: lineNumber,
      message: '**Organização: Fetch direto no componente**: Centralize chamadas de API:\n- Use funções em `@/lib/api`\n- Ou crie um hook customizado em `@/hooks`\n- Considere usar React Query/SWR para cache',
      severity: 'warn'
    });
  }
  
  return issues;
}

module.exports = { checkArchitecture };
