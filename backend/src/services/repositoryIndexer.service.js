import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';
import sagaQueue from '../queue/sagaQueue.js';
import { crawlRepositoryFiles } from '../security/fileCrawler.js';
import IndexedSymbol from '../models/IndexedSymbol.model.js';
import { extractSymbolsFromFiles } from './symbolExtractor.js';

export const REPOSITORY_INDEX_TYPE = 'REPOSITORY_INDEX';

export const buildRepositoryIndexSteps = () => [
  {
    name: 'crawl_and_extract_symbols',
    execute: async (context) => {
      const { userId, repoName } = context;
      const repoPath = path.resolve(process.cwd(), 'repositories', userId, repoName);

      if (!fs.existsSync(repoPath)) {
        throw new Error(`Repository directory does not exist at path: ${repoPath}`);
      }

      const files = crawlRepositoryFiles(repoPath);
      const symbols = extractSymbolsFromFiles(files);

      return { fileCount: files.length, symbols };
    },
  },
  {
    name: 'replace_indexed_symbols',
    execute: async (context, session) => {
      const { repositoryId, repositoryName, owner, symbols } = context;
      const indexedAt = new Date();

      await IndexedSymbol.deleteMany({ repositoryId }, { session });

      const documents = symbols.map((symbol) => ({
        repositoryId,
        repositoryName,
        owner,
        filePath: symbol.filePath,
        symbolName: symbol.symbolName,
        symbolType: symbol.symbolType,
        line: symbol.line,
        exportName: symbol.exportName,
        metadata: symbol.metadata,
        indexedAt,
      }));

      if (documents.length > 0) {
        await IndexedSymbol.insertMany(documents, { session });
      }

      return { symbolCount: documents.length, indexedAt, symbols: [] };
    },
    compensate: async (context, session) => {
      await IndexedSymbol.deleteMany({ repositoryId: context.repositoryId }, { session });
    },
  },
];

export const triggerRepositoryIndex = async ({ userId, repositoryId, repositoryName, owner }) => {
  const indexId = uuidv4();
  const initialContext = {
    userId: userId.toString(),
    repositoryId: repositoryId.toString(),
    repositoryName,
    repoName: repositoryName,
    owner,
    fileCount: 0,
    symbolCount: 0,
    symbols: [],
  };

  const promise = sagaQueue.enqueue(
    indexId,
    REPOSITORY_INDEX_TYPE,
    buildRepositoryIndexSteps(),
    initialContext,
    { maxRetries: 2, retryDelayMs: 200 }
  );

  return { indexId, promise };
};
