/**
 * Vector store adapter stub (pgvector-like).
 */

export type Embedding = { id: string; vector: number[]; metadata?: Record<string, unknown> };

export interface VectorStore {
  upsert(embeddings: Embedding[]): Promise<void>;
  query(vector: number[], k: number): Promise<Embedding[]>;
}

export class InMemoryVectorStore implements VectorStore {
  private store = new Map<string, Embedding>();

  async upsert(embeddings: Embedding[]): Promise<void> {
    for (const e of embeddings) this.store.set(e.id, e);
  }

  async query(_vector: number[], k: number): Promise<Embedding[]> {
    return Array.from(this.store.values()).slice(0, k);
  }
}
