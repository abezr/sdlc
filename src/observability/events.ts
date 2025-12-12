/**
 * Observability events schema + emitter (stub).
 */

import { EventEmitter } from "events";

export type SpanEvent =
  | { type: "tool.start"; tool: string; requestId: string; argsPreview: string }
  | { type: "tool.success"; tool: string; requestId: string; durationMs: number }
  | { type: "tool.error"; tool: string; requestId: string; durationMs: number; error: string };

export class ObsEmitter extends EventEmitter {
  emitEvent(ev: SpanEvent): void {
    this.emit(ev.type, ev);
  }
}

// Simple sink for demos/tests.
export class MemorySink {
  events: SpanEvent[] = [];
  hook(emitter: ObsEmitter): void {
    emitter.on("tool.start", (e) => this.events.push(e));
    emitter.on("tool.success", (e) => this.events.push(e));
    emitter.on("tool.error", (e) => this.events.push(e));
  }
}
