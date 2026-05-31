# Distributed Repository Indexing & Semantic Code Intelligence

GitNest now includes a lightweight in-process repository indexing pipeline for JS/TS code intelligence.

## What changed

- `RepositoryIndexer` runs through the existing saga queue/orchestrator.
- Repository crawling reuses the security crawler and skips `node_modules`, `dist`, `build`, binaries, and files over 1MB.
- JS/TS extraction supports functions, classes, imports, exports, and Express routes using small regex utilities.
- `IndexedSymbol` stores searchable symbol metadata with indexes on `repositoryId`, `symbolName`, and `symbolType`.
- REST APIs were added under `/api/v1/repositories/:username/:reponame`.

## APIs

- `POST /index` triggers indexing.
- `GET /index/status/:indexId` returns saga status and summary.
- `GET /symbols/search?q=name&symbolType=function` searches indexed symbols.
- `GET /symbols/:symbolId` returns symbol details.

## Verification

```bash
cd backend
npm test -- codeIntelligence.test.js
npm test
npm run test:contracts
```
