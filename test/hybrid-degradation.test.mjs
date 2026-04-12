import assert from "node:assert/strict";
import jitiFactory from "jiti";

const jiti = jitiFactory(import.meta.url, { interopDefault: true });

const { createRetriever, DEFAULT_RETRIEVAL_CONFIG } = jiti("../src/retriever.ts");

// Fake store where vector rejects but BM25 returns empty results
const fakeStoreEmpty = {
  hasFtsSupport: true,
  vectorSearch: async () => { throw new Error("vector unavailable"); },
  bm25Search: async () => [],  // empty but legitimate
  hasId: async () => false,
};

const fakeEmbedder = {
  async embedQuery() { return [1, 0]; },
};

// Fake store where both reject
const fakeStoreBothFail = {
  hasFtsSupport: true,
  vectorSearch: async () => { throw new Error("vector unavailable"); },
  bm25Search: async () => { throw new Error("bm25 unavailable"); },
  hasId: async () => false,
};

// Fake store where both return empty (legitimate zero results)
const fakeStoreBothEmpty = {
  hasFtsSupport: true,
  vectorSearch: async () => [],
  bm25Search: async () => [],
  hasId: async () => false,
};

const retrieverConfig = {
  ...DEFAULT_RETRIEVAL_CONFIG,
  filterNoise: false,
};

const retrieverEmpty = createRetriever(fakeStoreEmpty, fakeEmbedder, retrieverConfig);
const retrieverBothFail = createRetriever(fakeStoreBothFail, fakeEmbedder, retrieverConfig);
const retrieverBothEmpty = createRetriever(fakeStoreBothEmpty, fakeEmbedder, retrieverConfig);

// F1 regression: one reject + one empty[] should NOT throw
await retrieverEmpty.retrieve({ query: "test", limit: 5 });
console.log("✅ F1: vector reject + bm25 empty[] → returns [] (no throw)");

// F1+: both reject → should throw
await assert.rejects(
  retrieverBothFail.retrieve({ query: "test", limit: 5 }),
  /both vector and BM25 search failed/,
  "both rejected should throw 'both vector and BM25 search failed'"
);
console.log("✅ F1+: both reject → throws correctly");

// F1++: both return empty[] → should NOT throw (was broken with length check)
const emptyResults = await retrieverBothEmpty.retrieve({ query: "test", limit: 5 });
assert.equal(emptyResults.length, 0, "both empty should return [] not throw");
console.log("✅ F1++: both empty[] → returns [] (no throw — was broken before fix)");
