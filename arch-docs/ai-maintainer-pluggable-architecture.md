# AI Maintainer Pluggable Architecture (Fx + MCP)

Plug-in architecture for the AI Maintainer toolchain that matches the described Fx-based strategy pattern: strategies are registered as DI providers (grouped), carry lifecycle metadata (topics, DTO, UoW), rely on transactional outbox for external effects, and are exposed to AI agents via MCP and a dynamic tool dispatcher.

## Principles
- **Group-based DI**: Strategies register via `fx.Provide` into a shared group; consumers inject `[]Strategy` via `fx.In`.
- **Self-contained lifecycle**: Each strategy declares input topic, DTO contract, UoW handler, and outbox events. No hidden global state.
- **Transactional outbox**: External side effects are modeled as outbox events; strategies only touch DB + enqueue work.
- **Pluggable discovery**: New strategies/tools are discovered by scanning plugin folders; no core changes.
- **Contract-first**: DTO/models declared alongside strategy; architect gets interfaces + sample strategy for codegen.
- **Human-in-loop ready**: Generated strategies and tool schemas go through BI/UX review queues before activation.

## Component View (C4)
```mermaid
C4Component
    title Pluggable Strategy & Tool Runtime

    System_Boundary(toolchain, "AI Maintainer Toolchain") {
        Container(mcp, "MCP Server", "Node.js", "Exposes tools to agents/CLI/VS Code/SPA")
        Container(orchestrator, "Orchestrator", "Node.js", "Schedules jobs, streams events")
        Container(pluginHost, "Plugin Host", "Go + Fx", "Loads strategies via DI groups; executes UoW; writes outbox")
        Container(toolDispatcher, "Dynamic Tool Dispatcher", "Node.js/Python", "Loads tool modules, inspects run signature, injects dynamic args")
        ContainerDb(db, "App DB", "Postgres", "State, UoW data")
        ContainerDb(outbox, "Transactional Outbox", "Postgres table", "Buffered external events")
        Container(queue, "Workqueue", "Redis/SQS/NATS", "Dispatch outbound events")
    }

    Rel(mcp, orchestrator, "Receives tool invocations/events", "MCP/IPC")
    Rel(orchestrator, pluginHost, "Invokes strategies", "gRPC/IPC")
    Rel(pluginHost, db, "Reads/Writes", "SQL")
    Rel(pluginHost, outbox, "Writes outbound events", "SQL")
    Rel(outbox, queue, "Publisher", "Connector/relay")
    Rel(toolDispatcher, mcp, "Registers dynamic tools", "MCP schema")
    Rel(orchestrator, toolDispatcher, "Executes tool.run with injected deps", "IPC/call")
```

## Strategy Contract (Go + Fx)
- Interface shape:
  ```go
  type Strategy interface {
      Name() string
      Topic() string           // inbound topic to consume
      DTO() any                // expected DTO type (used for decoding/validation)
      Handle(ctx context.Context, msg any, deps Deps) (OutboxEvents, error)
  }

  type Deps struct {
      fx.In
      DB *sql.DB
      Logger *zap.Logger
      TimeSource clock.Clock
      // optional typed services (e.g., Annotator, GraphBuilder, TestGen)
  }
  ```
- Registration example:
  ```go
  var Module = fx.Module("strategies",
      fx.Provide(
          fx.Annotate(NewAnnotateStrategy, fx.ResultTags(`group:"strategies"`)),
          fx.Annotate(NewGraphIngestStrategy, fx.ResultTags(`group:"strategies"`)),
      ),
  )

  type StrategySet struct {
      fx.In
      Strategies []Strategy `group:"strategies"`
  }
  ```
- Consumer usage: `Dispatcher` injects `StrategySet`, builds topic -> strategy map, and routes inbound messages.

## Tool Plugin Contract (Dynamic run, MCP-exposed)
- Each tool module exports `TOOL_SCHEMA` (JSON schema) and `run(**kwargs)`.
- Dispatcher logic:
  ```python
  def execute(tool_func, tool_args, injected):
      all_args = {**injected, **tool_args}
      sig = inspect.signature(tool_func)
      filtered = {k: v for k, v in all_args.items() if k in sig.parameters}
      return tool_func(**filtered)
  ```
- Injected defaults: `db_manager`, `tool_executor`, `workspace`, `logger`, `outbox_writer`, etc.
- Tool registration: scan `plugins/` or `tools/` for `*_tool.py`, load `TOOL_SCHEMA`, register with MCP server; no core edits.

## Execution Flow
1) **Registration**: Fx app starts, loads all strategy providers in plugin folder, injects grouped `[]Strategy` into dispatcher.
2) **Message handling**: Dispatcher listens on topics (or receives from orchestrator), finds matching strategy, decodes DTO, calls `Handle`.
3) **UoW + outbox**: Handler performs DB work in transaction, writes outbound events to outbox table.
4) **Relay**: Outbox relayer publishes events to `queue`; downstream connectors deliver to external systems.
5) **MCP tools**: Tools are served by MCP; orchestrator/CLI/VS Code/SPA invoke them; dispatcher injects available deps.
6) **Observability**: All steps emit spans/metrics to Observability service and BI dashboards.

## Inspector / Auditor Mode
- **Purpose**: Monitor guardrails/policies (DTO validation, idempotency, rate limits, PII scrubbing, outbox integrity), detect unsafe plans, and whistleblow obvious correctness issues.
- **Placement**: Runs as a sidecar in orchestrator + plugin host; subscribes to spans/events/metrics and inspects MCP tool calls.
- **Checks**:
  - Missing validation or DTO mismatch for a strategy.
  - Outbox writes without paired commit; orphaned events; relay lag.
  - Excessive retries, circuit trips, or rate-limit breaches.
  - Token bloat in generated patches/tests; duplicate code without dedup plan.
  - Unreviewed tool/strategy activation (bypassing approval queue).
  - PII/secret leakage in embeddings/logs.
- **Alerting (unobtrusive but effective)**:
  - For implementor agent: return structured MCP warnings with severity + remediation hint; throttle repeats; block only on critical (e.g., missing validation or outbox off).
  - For humans: non-modal toasts in SPA/VS Code with “Inspect” deep link; BI panel “Auditor Warnings” with filters; daily digest in CLI (`ai-maint inspector report`).
  - Escalation: if the same issue repeats N times or is critical, open a review task in the approval queue instead of spamming.
- **APIs**:
  - `inspector.stream` (MCP): subscribe to live findings with scopes (strategy/tool/commit).
  - `inspector.snapshot` (MCP): fetch current outstanding findings grouped by severity.
  - `inspector.waive` (MCP): record a waivers with scope + expiry + rationale (logged).
- **Integration points**:
  - Fx middlewares wrap strategy dispatch to record validation/exceptions and emit events to inspector.
  - Tool dispatcher wraps `run` to log schema adherence and argument filtering.
  - Observability service forwards spans/metrics to inspector rules engine.
- **Signal hygiene**: deduplicate similar warnings, cap rate, include suppression/waiver metadata, and carry provenance (strategy/tool, commit, workspace, actor).

## Developer Workflow (Kilocode/Architect)
- Provide: service interfaces, sample strategy, DTO models, and algorithm description to the architect agent.
- Architect outputs: new strategy file (Fx provider + DTO + tests) or new tool module with `TOOL_SCHEMA` + `run`.
- Human review: BI/UX surfaces plan + diff; approval before activation.
- Deployment: Drop new strategy/tool file into plugin folder; restart/ hot-reload Fx app or tool dispatcher; MCP surface updates automatically.

## Safety & Guardrails
- DTO validation on ingest; type-checked decode.
- Idempotency keys per message; retry with backoff.
- Outbox relayer with exactly-once semantics per event id.
- Rate limits per strategy/topic; circuit breakers on downstream connectors.
- Audit log of tool/strategy executions; MCP actions trace to user/agent/session.
