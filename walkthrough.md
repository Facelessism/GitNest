# Repository Indexing, Dependency Graphs & Impact Analysis

GitNest now includes a lightweight in-process repository indexing pipeline for JS/TS code intelligence plus dependency graph impact analysis.

## What changed

- `RepositoryIndexer` runs through the existing saga queue/orchestrator.
- Repository crawling reuses the security crawler and skips `node_modules`, `dist`, `build`, binaries, and files over 1MB.
- JS/TS extraction supports functions, classes, imports, exports, and Express routes using small regex utilities.
- `IndexedSymbol` stores searchable symbol metadata with indexes on `repositoryId`, `symbolName`, and `symbolType`.
- `DependencyGraph` stores module, package, export, route handler, and service/controller reference edges.
- `DependencyGraphBuilder` rebuilds edges from the same crawl/extract pass and replaces stale edges after indexing.
- `ImpactAnalysis` uses simple in-memory BFS over stored edges for direct dependencies, dependents, affected symbols/files, and depth counts.
- REST APIs were added under `/api/v1/repositories/:username/:reponame`.

## APIs

- `POST /index` triggers indexing.
- `GET /index/status/:indexId` returns saga status and summary.
- `GET /symbols/search?q=name&symbolType=function` searches indexed symbols.
- `GET /symbols/:symbolId` returns symbol details.
- `POST /dependencies/rebuild` rebuilds the graph for a repository.
- `GET /dependencies` lists graph edges with optional `dependencyType`, `file`, and `symbol` filters.
- `GET /dependencies/impact?file=src/app.js` or `?symbol=handler` returns impact analysis.
- `GET /dependencies/symbol/:symbolName` returns dependencies and dependents for one symbol.

## Verification

```bash
cd backend
npm test -- codeIntelligence.test.js
npm test
npm run test:contracts
```

Current local note: contract tests pass. The integration suite could not complete in this environment because MongoMemoryServer fails to start with `Cannot start server with an unknown storage engine: ephemeralForTest`.
