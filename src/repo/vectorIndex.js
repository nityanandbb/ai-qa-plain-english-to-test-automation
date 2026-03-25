// src/repo/vectorIndex.js
const crypto = require("crypto");

function hashEmbedding(text, dims = 256) {
  const vec = new Array(dims).fill(0);
  const tokens = text
    .toLowerCase()
    .split(/[^a-z0-9_]+/g)
    .filter(Boolean)
    .slice(0, 5000);

  for (const t of tokens) {
    const h = crypto.createHash("sha256").update(t).digest();
    const idx = h.readUInt16BE(0) % dims;
    vec[idx] += 1;
  }

  const norm = Math.sqrt(vec.reduce((s, x) => s + x * x, 0)) || 1;
  return vec.map((x) => x / norm);
}

function cosine(a, b) {
  let s = 0;
  for (let i = 0; i < a.length; i++) s += a[i] * b[i];
  return s;
}

function buildVectorIndex(files, opts = {}) {
  const { dims = 256, chunkSize = 1200 } = opts;
  const chunks = [];

  for (const f of files) {
    const content = f.content || "";
    for (let i = 0; i < content.length; i += chunkSize) {
      const text = content.slice(i, i + chunkSize);
      const embedding = hashEmbedding(text, dims);
      chunks.push({ path: f.path, start: i, text, embedding });
    }
  }

  return { dims, chunks };
}

function searchVectorIndex(index, query, topK = 6) {
  const q = hashEmbedding(query, index.dims);
  return index.chunks
    .map((c) => ({ ...c, score: cosine(q, c.embedding) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .map(({ embedding, ...rest }) => rest);
}

module.exports = { buildVectorIndex, searchVectorIndex };
