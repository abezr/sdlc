/**
 * Plugin host skeleton (TypeScript).
 * Mirrors the Go/Fx pattern using a simple registry + dispatcher.
 * For module lifecycles, see ./di.ts and build modules around this registry.
 */

export type StrategyDeps = {
  logger: Logger;
  // Extension seam: add db, outbox, metrics, etc.
};

export interface Strategy {
  name(): string;
  topic(): string;
  handle(message: unknown, deps: StrategyDeps): Promise<void> | void;
}

export type Logger = {
  info(msg: string, meta?: Record<string, unknown>): void;
  error(msg: string, meta?: Record<string, unknown>): void;
};

export class StrategyRegistry {
  private readonly byTopic = new Map<string, Strategy>();

  register(strategy: Strategy): void {
    const topic = strategy.topic();
    if (this.byTopic.has(topic)) {
      throw new Error(`strategy already registered for topic: ${topic}`);
    }
    this.byTopic.set(topic, strategy);
  }

  get(topic: string): Strategy | undefined {
    return this.byTopic.get(topic);
  }
}

export class Dispatcher {
  constructor(
    private readonly registry: StrategyRegistry,
    private readonly deps: StrategyDeps
  ) {}

  async dispatch(topic: string, message: unknown): Promise<void> {
    const strategy = this.registry.get(topic);
    if (!strategy) throw new Error(`no strategy for topic: ${topic}`);
    this.deps.logger.info(`dispatching`, { topic, strategy: strategy.name() });
    await strategy.handle(message, this.deps);
  }
}

// Demo strategy to illustrate shape.
class HelloStrategy implements Strategy {
  name() {
    return "hello";
  }
  topic() {
    return "hello.topic";
  }
  handle(message: unknown, deps: StrategyDeps) {
    deps.logger.info("hello strategy received", { message });
  }
}

// Factory for a demo host.
export function createDemoHost(logger: Logger = consoleLogger()) {
  const registry = new StrategyRegistry();
  registry.register(new HelloStrategy());
  const deps: StrategyDeps = { logger };
  return new Dispatcher(registry, deps);
}

function consoleLogger(): Logger {
  return {
    info: (msg, meta) => console.log(`[INFO] ${msg}`, meta ?? ""),
    error: (msg, meta) => console.error(`[ERROR] ${msg}`, meta ?? ""),
  };
}
