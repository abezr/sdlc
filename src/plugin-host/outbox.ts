/**
 * Transactional outbox skeleton (TypeScript).
 * Explicit record shape, store/publisher interfaces, and relay loop.
 */

export type OutboxRecord = {
  id: string;
  channel: string;
  payload: Buffer;
  attempts: number;
  createdAt: number;
};

export interface OutboxStore {
  append(rec: OutboxRecord): Promise<void>;
  nextBatch(limit: number): Promise<OutboxRecord[]>;
  markDone(id: string): Promise<void>;
  markFailed(id: string, error: string): Promise<void>;
}

export interface Publisher {
  publish(channel: string, payload: Buffer): Promise<void>;
}

export type Backoff = (attempt: number) => number;

export class OutboxRelay {
  constructor(
    private readonly store: OutboxStore,
    private readonly publisher: Publisher,
    private readonly backoff: Backoff = () => 0
  ) {}

  async tick(limit = 50): Promise<void> {
    const batch = await this.store.nextBatch(limit);
    for (const rec of batch) {
      try {
        if (!rec.channel) throw new Error("empty channel");
        await this.publisher.publish(rec.channel, rec.payload);
        await this.store.markDone(rec.id);
        if (rec.attempts > 0) {
          await new Promise((resolve) => setTimeout(resolve, this.backoff(rec.attempts)));
        }
      } catch (err) {
        await this.store.markFailed(rec.id, err instanceof Error ? err.message : String(err));
      }
    }
  }
}
