/**
 * Minimal DI container with module-scoped lifecycles.
 * Goals:
 * - Simple token-based provider registry
 * - Lazy singleton resolution
 * - Module start/stop hooks with reverse-order shutdown
 */

export type Resolver = <T = unknown>(token: string) => T;

export type Provider<T = unknown> = {
  token: string;
  create: (resolve: Resolver) => T;
};

export type Module = {
  name: string;
  providers?: Provider[];
  start?: (container: Container) => Promise<void> | void;
  stop?: (container: Container) => Promise<void> | void;
};

export interface Container {
  resolve<T = unknown>(token: string): T;
  start(): Promise<void>;
  stop(): Promise<void>;
}

class ContainerImpl implements Container {
  private readonly providers = new Map<string, Provider>();
  private readonly instances = new Map<string, unknown>();
  private readonly startHooks: Array<(c: Container) => Promise<void> | void> = [];
  private readonly stopHooks: Array<(c: Container) => Promise<void> | void> = [];
  private started = false;

  constructor(modules: Module[]) {
    for (const mod of modules) {
      for (const p of mod.providers ?? []) {
        if (this.providers.has(p.token)) {
          throw new Error(`duplicate provider for token: ${p.token}`);
        }
        this.providers.set(p.token, p);
      }
      if (mod.start) this.startHooks.push(mod.start);
      if (mod.stop) this.stopHooks.unshift(mod.stop); // reverse on shutdown
    }
  }

  resolve<T = unknown>(token: string): T {
    if (this.instances.has(token)) return this.instances.get(token) as T;
    const provider = this.providers.get(token);
    if (!provider) {
      throw new Error(`no provider for token: ${token}`);
    }
    const instance = provider.create(this.resolve.bind(this));
    this.instances.set(token, instance);
    return instance as T;
  }

  async start(): Promise<void> {
    if (this.started) return;
    this.started = true;
    for (const hook of this.startHooks) {
      await hook(this);
    }
  }

  async stop(): Promise<void> {
    if (!this.started) return;
    this.started = false;
    for (const hook of this.stopHooks) {
      await hook(this);
    }
  }
}

export function createContainer(modules: Module[]): Container {
  return new ContainerImpl(modules);
}

// Example usage:
// const app = createContainer([
//   {
//     name: "core",
//     providers: [
//       { token: "logger", create: () => console },
//       { token: "svc", create: (r) => new Service(r("logger")) },
//     ],
//     start: (c) => c.resolve("svc"), // force construction
//   },
// ]);
// await app.start();
// await app.stop();
