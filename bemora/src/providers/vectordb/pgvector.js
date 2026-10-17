/**
 * pgvector provider — query and manage vector embeddings stored in PostgreSQL.
 *
 * This provider does NOT bundle a pg client. Pass in your own `pg` Pool/Client:
 *
 *   import pg from 'pg';
 *   import * as pgv from 'bemora/src/providers/vectordb/pgvector.js';
 *
 *   const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
 *
 *   // Initialize table
 *   await pgv.createTable({ pool, table: 'embeddings', dimensions: 1536 });
 *
 *   // Upsert
 *   await pgv.upsert({ pool, table: 'embeddings', vectors: [{ id: 'doc1', embedding: [...], metadata: { source: 'wiki' } }] });
 *
 *   // Query
 *   const { results } = await pgv.query({ pool, table: 'embeddings', vector: [...], topK: 5 });
 */

import { ConfigurationError, ProviderError } from '../../core/errors.js';

// ── DDL helpers ───────────────────────────────────────────────────────────────

/**
 * Create the pgvector extension and embeddings table if they don't exist.
 * @param {{ pool, table?: string, dimensions: number }} params
 */
export async function createTable({ pool, table = 'bemora_embeddings', dimensions } = {}) {
  if (!pool) throw new ConfigurationError('[pgvector] Missing pool (pg Pool/Client)', { provider: 'pgvector' });
  if (!dimensions) throw new ConfigurationError('[pgvector] Missing dimensions', { provider: 'pgvector' });
  try {
    await pool.query('CREATE EXTENSION IF NOT EXISTS vector');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS ${table} (
        id TEXT PRIMARY KEY,
        embedding vector(${dimensions}),
        metadata JSONB,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    await pool.query(`CREATE INDEX IF NOT EXISTS ${table}_embedding_idx ON ${table} USING ivfflat (embedding vector_cosine_ops)`);
    return { created: true, table };
  } catch (err) {
    throw new ProviderError(`[pgvector] createTable failed: ${err.message}`, { provider: 'pgvector', cause: err });
  }
}

/**
 * Upsert vectors.
 * @param {{ pool, table?: string, vectors: Array<{ id: string, embedding: number[], metadata?: object }> }} params
 */
export async function upsert({ pool, table = 'bemora_embeddings', vectors } = {}) {
  if (!pool) throw new ConfigurationError('[pgvector] Missing pool', { provider: 'pgvector' });
  try {
    const client = typeof pool.connect === 'function' ? await pool.connect() : pool;
    try {
      await client.query('BEGIN');
      for (const { id, embedding, metadata = {} } of vectors) {
        await client.query(
          `INSERT INTO ${table} (id, embedding, metadata) VALUES ($1, $2, $3)
           ON CONFLICT (id) DO UPDATE SET embedding = EXCLUDED.embedding, metadata = EXCLUDED.metadata`,
          [id, `[${embedding.join(',')}]`, JSON.stringify(metadata)]
        );
      }
      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      if (typeof client.release === 'function') client.release();
    }
    return { upsertedCount: vectors.length };
  } catch (err) {
    throw new ProviderError(`[pgvector] upsert failed: ${err.message}`, { provider: 'pgvector', cause: err });
  }
}

/**
 * Query by vector similarity (cosine distance).
 * @param {{ pool, table?: string, vector: number[], topK?: number, filter?: object, threshold?: number }} params
 */
export async function query({ pool, table = 'bemora_embeddings', vector, topK = 10, filter, threshold } = {}) {
  if (!pool) throw new ConfigurationError('[pgvector] Missing pool', { provider: 'pgvector' });
  try {
    const vectorStr = `[${vector.join(',')}]`;
    let sql = `SELECT id, metadata, 1 - (embedding <=> $1::vector) AS similarity FROM ${table}`;
    const params = [vectorStr];

    if (filter && Object.keys(filter).length) {
      sql += ` WHERE metadata @> $${params.length + 1}`;
      params.push(JSON.stringify(filter));
    }
    if (threshold) {
      sql += ` HAVING 1 - (embedding <=> $1::vector) >= ${threshold}`;
    }
    sql += ` ORDER BY embedding <=> $1::vector LIMIT $${params.length + 1}`;
    params.push(topK);

    const { rows } = await pool.query(sql, params);
    return { results: rows.map((r) => ({ id: r.id, similarity: parseFloat(r.similarity), metadata: r.metadata })) };
  } catch (err) {
    throw new ProviderError(`[pgvector] query failed: ${err.message}`, { provider: 'pgvector', cause: err });
  }
}

/**
 * Delete vectors by ID.
 */
export async function deleteVectors({ pool, table = 'bemora_embeddings', ids } = {}) {
  if (!pool) throw new ConfigurationError('[pgvector] Missing pool', { provider: 'pgvector' });
  try {
    await pool.query(`DELETE FROM ${table} WHERE id = ANY($1)`, [ids]);
    return { deletedCount: ids.length };
  } catch (err) {
    throw new ProviderError(`[pgvector] delete failed: ${err.message}`, { provider: 'pgvector', cause: err });
  }
}

/**
 * Get a vector by ID.
 */
export async function getById({ pool, table = 'bemora_embeddings', id } = {}) {
  if (!pool) throw new ConfigurationError('[pgvector] Missing pool', { provider: 'pgvector' });
  try {
    const { rows } = await pool.query(`SELECT id, embedding::text, metadata, created_at FROM ${table} WHERE id = $1`, [id]);
    return rows[0] || null;
  } catch (err) {
    throw new ProviderError(`[pgvector] getById failed: ${err.message}`, { provider: 'pgvector', cause: err });
  }
}

/**
 * Count vectors in a table.
 */
export async function count({ pool, table = 'bemora_embeddings', filter } = {}) {
  if (!pool) throw new ConfigurationError('[pgvector] Missing pool', { provider: 'pgvector' });
  try {
    const params = [];
    let sql = `SELECT COUNT(*) FROM ${table}`;
    if (filter) { sql += ' WHERE metadata @> $1'; params.push(JSON.stringify(filter)); }
    const { rows } = await pool.query(sql, params);
    return { count: parseInt(rows[0].count, 10) };
  } catch (err) {
    throw new ProviderError(`[pgvector] count failed: ${err.message}`, { provider: 'pgvector', cause: err });
  }
}
