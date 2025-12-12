/**
 * Master-pattern MCP server shell (50–300 LOC target).
 *
 * Teaching goals (for Grok/maintainers):
 * - Keep transport, registry, and guardrails separated.
 * - Make invariants explicit before branching.
 * - Normalize responses for predictable caller handling.
 * - Leave extension seams (adapters/hooks) obvious.
 */

import { EventEmitter } from "events";
import { randomUUID } from "crypto";

// ---- Types -----------------------------------------------------------------

export type ToolContext = {
  workspaceRoot: string;
  logger: Logger;
  now: () => Date;
  // Extension seam: add adapters (vectorStore, graphStore, outbox, etc.)
};

export type ToolRequest = {
  id: string;
  name: string;
  args: Record<string, unknown>;
  meta?: Record<string, unknown>;
};

export type ToolResponse =
  | { status: "success"; data: unknown; warnings?: string[] }
  | { status: "error"; error: string; details?: unknown };

export type ToolHandler = (
  ctx: ToolContext,
  args: Record<string, unknown>
) => Promise<ToolResponse>;

export type ToolDefinition = {
  name: string;
  description: string;
  schema?: unknown; // Align with MCP tool schema if available.
  handler: ToolHandler;
};

export type Logger = {
  info(msg: string, meta?: Record<string, unknown>): void;
  warn(msg: string, meta?: Record<string, unknown>): void;
  error(msg: string, meta?: Record<string, unknown>): void;
};

// ---- Registry --------------------------------------------------------------

export class ToolRegistry {
  private readonly tools = new Map<string, ToolDefinition>();

  register(tool: ToolDefinition): void {
    if (this.tools.has(tool.name)) {
      throw new Error(`Tool already registered: ${tool.name}`);
    }
    this.tools.set(tool.name, tool);
  }

  get(name: string): ToolDefinition | undefined {
    return this.tools.get(name);
  }

  list(): ToolDefinition[] {
    return [...this.tools.values()];
  }
}

// ---- Observability hooks ---------------------------------------------------

export type ObserverEvent =
  | { type: "tool.start"; tool: string; requestId: string; argsPreview: string }
  | { type: "tool.success"; tool: string; requestId: string; durationMs: number }
  | { type: "tool.error"; tool: string; requestId: string; durationMs: number; error: string };

export class Observer extends EventEmitter {
  emitEvent(event: ObserverEvent): void {
    this.emit(event.type, event);
  }
}

// ---- MCP server shell ------------------------------------------------------

export type McpServerOptions = {
  registry: ToolRegistry;
  observer?: Observer;
  logger: Logger;
  context: Omit<ToolContext, "logger">;
};

export class McpServer {
  private readonly registry: ToolRegistry;
  private readonly observer: Observer;
  private readonly logger: Logger;
  private readonly baseCtx: ToolContext;

  constructor(opts: McpServerOptions) {
    this.registry = opts.registry;
    this.observer = opts.observer ?? new Observer();
    this.logger = opts.logger;
    this.baseCtx = {
      ...opts.context,
      logger: opts.logger,
    };
  }

  /**
   * Handle a single tool invocation with guardrails and observability.
   * Transport (stdio/socket/http) is intentionally outside this class.
   */
  async handle(request: ToolRequest): Promise<ToolResponse> {
    const startedAt = Date.now();
    const requestId = request.id || randomUUID();

    // Invariant: tool exists
    const tool = this.registry.get(request.name);
    if (!tool) {
      return {
        status: "error",
        error: `Unknown tool: ${request.name}`,
      };
    }

    // Observability start event (args preview to avoid token bloat).
    this.observer.emitEvent({
      type: "tool.start",
      tool: tool.name,
      requestId,
      argsPreview: JSON.stringify(Object.keys(request.args || {})),
    });

    try {
      const response = await tool.handler(this.baseCtx, request.args || {});
      const durationMs = Date.now() - startedAt;

      // Normalize response
      if (response.status === "success") {
        this.observer.emitEvent({
          type: "tool.success",
          tool: tool.name,
          requestId,
          durationMs,
        });
        return response;
      }

      this.observer.emitEvent({
        type: "tool.error",
        tool: tool.name,
        requestId,
        durationMs,
        error: response.error,
      });
      return response;
    } catch (err) {
      const durationMs = Date.now() - startedAt;
      const message = err instanceof Error ? err.message : String(err);
      this.observer.emitEvent({
        type: "tool.error",
        tool: tool.name,
        requestId,
        durationMs,
        error: message,
      });
      this.logger.error("Tool failed", { tool: tool.name, requestId, error: message });
      return { status: "error", error: message };
    }
  }
}

// ---- Example wiring (kept minimal and copy-paste friendly) -----------------

const consoleLogger: Logger = {
  info: (msg, meta) => console.log(`[INFO] ${msg}`, meta ?? ""),
  warn: (msg, meta) => console.warn(`[WARN] ${msg}`, meta ?? ""),
  error: (msg, meta) => console.error(`[ERROR] ${msg}`, meta ?? ""),
};

export function createDemoServer(workspaceRoot: string): McpServer {
  const registry = new ToolRegistry();

  // Example tool: ping (shows schema + handler shape).
  registry.register({
    name: "ping",
    description: "Health check tool; echoes payload.",
    schema: {
      type: "object",
      properties: { payload: { type: "string" } },
    },
    handler: async (_ctx, args) => {
      const payload = typeof args.payload === "string" ? args.payload : "pong";
      return { status: "success", data: { payload } };
    },
  });

  // Extension seam: register more tools here (annotate, graph.query, etc.)

  return new McpServer({
    registry,
    logger: consoleLogger,
    context: {
      workspaceRoot,
      now: () => new Date(),
    },
  });
}

// Note: Transport layer (stdio/socket/HTTP) intentionally omitted to keep this
// module within 50–300 LOC and focused on the “master” design pattern.
