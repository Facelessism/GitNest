const JS_TS_FILE = /\.(mjs|cjs|js|jsx|ts|tsx)$/i;

const lineNumberFor = (content, index) => content.slice(0, index).split('\n').length;

const addMatchSymbols = (symbols, content, regex, symbolType, buildSymbol) => {
  for (const match of content.matchAll(regex)) {
    symbols.push({
      symbolType,
      line: lineNumberFor(content, match.index || 0),
      ...buildSymbol(match),
    });
  }
};

export const isSupportedSourceFile = (filePath) => JS_TS_FILE.test(filePath);

export const extractSymbolsFromContent = (content, filePath) => {
  if (!isSupportedSourceFile(filePath)) return [];

  const symbols = [];

  addMatchSymbols(
    symbols,
    content,
    /\b(?:export\s+(?:default\s+)?)?(?:async\s+)?function\s+([A-Za-z_$][\w$]*)\s*\(/g,
    'function',
    (match) => ({ symbolName: match[1], exportName: match[0].trim().startsWith('export') ? match[1] : null })
  );

  addMatchSymbols(
    symbols,
    content,
    /\b(?:export\s+(?:default\s+)?)?class\s+([A-Za-z_$][\w$]*)\b/g,
    'class',
    (match) => ({ symbolName: match[1], exportName: match[0].trim().startsWith('export') ? match[1] : null })
  );

  addMatchSymbols(
    symbols,
    content,
    /\bexport\s+(?:default\s+)?(?:async\s+)?(?:function|class|const|let|var)\s+([A-Za-z_$][\w$]*)\b/g,
    'export',
    (match) => ({ symbolName: match[1], exportName: match[1], metadata: { declaration: true } })
  );

  addMatchSymbols(
    symbols,
    content,
    /\bexport\s*\{([^}]+)\}/g,
    'export',
    (match) => {
      const firstExport = match[1].split(',')[0].trim();
      const [localName, aliasName] = firstExport.split(/\s+as\s+/i).map((part) => part.trim());
      return { symbolName: localName, exportName: aliasName || localName, metadata: { namedExport: true } };
    }
  );

  addMatchSymbols(
    symbols,
    content,
    /\bmodule\.exports(?:\.([A-Za-z_$][\w$]*))?\s*=/g,
    'export',
    (match) => ({ symbolName: match[1] || 'module.exports', exportName: match[1] || 'module.exports' })
  );

  addMatchSymbols(
    symbols,
    content,
    /\bimport\s+(?:[^'"]+\s+from\s+)?['"]([^'"]+)['"]/g,
    'import',
    (match) => ({ symbolName: match[1], metadata: { source: match[1] } })
  );

  addMatchSymbols(
    symbols,
    content,
    /\brequire\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
    'import',
    (match) => ({ symbolName: match[1], metadata: { source: match[1], commonjs: true } })
  );

  addMatchSymbols(
    symbols,
    content,
    /\b(?:app|router)\s*\.\s*(get|post|put|patch|delete|use)\s*\(\s*['"`]([^'"`]+)['"`]/g,
    'route',
    (match) => ({
      symbolName: `${match[1].toUpperCase()} ${match[2]}`,
      metadata: { method: match[1].toUpperCase(), route: match[2] },
    })
  );

  return symbols.map((symbol) => ({
    filePath,
    exportName: null,
    metadata: {},
    ...symbol,
  }));
};

export const extractSymbolsFromFiles = (files) =>
  files.flatMap((file) => extractSymbolsFromContent(file.content, file.path));
