/**
 * Inspector/Auditor rules engine (stub).
 * Consumes observability events and emits findings with throttling.
 */

import { EventEmitter } from "events";
import { SpanEvent } from "../observability/events";

export type Finding = {
  id: string;
  severity: "info" | "warn" | "error";
  message: string;
  tool?: string;
};

export class Inspector extends EventEmitter {
  private readonly last: Map<string, number> = new Map(); // finding id -> timestamp
  private readonly throttleMs: number;

  constructor(throttleMs = 5_000) {
    super();
    this.throttleMs = throttleMs;
  }

  handle(event: SpanEvent): void {
    // Simple rule: tool.error becomes finding
    if (event.type === "tool.error") {
      this.report({
        id: `error:${event.tool}`,
        severity: "error",
        message: `Tool ${event.tool} failed: ${event.error}`,
        tool: event.tool,
      });
    }
  }

  report(finding: Finding): void {
    const now = Date.now();
    const last = this.last.get(finding.id) ?? 0;
    if (now - last < this.throttleMs) return;
    this.last.set(finding.id, now);
    this.emit("finding", finding);
  }
}
