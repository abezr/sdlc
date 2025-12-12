# Roadmap (Tasks Sized 50–300 LOC Each)

Each task maps to a single feature/function and is scoped so a sub-agent produces ~50–300 lines of code (tests included where reasonable).

## Execution Order (suggested)
1. **MCP server shell** (TypeScript): minimal server with tool registry, stdio/socket transport, stub tool handlers returning “not implemented”.
2. **Plugin host (Go + Fx) skeleton**: load strategies from folder via `fx.Provide` group; dispatch by `Topic()`; stub UoW + logger.
3. **Dynamic tool dispatcher (Python/Node)**: scan `plugins/` for `TOOL_SCHEMA` + `run`; inspect signature; inject deps; return normalized result.
4. **Transactional outbox + relay** (Go): outbox table DDL, write helper, relay loop to queue with idempotency + retry/backoff hooks (no external connector yet).
5. **Semantic annotator worker** (TS): parse files via tree-sitter/TS AST; emit sidecar sem JSON; push embeddings stub to vector adapter interface.
6. **Knowledge graph ingest** (Node/Python): consume annotation facts; map to graph schema; write via graph adapter interface; stub schema + Cypher helper.
7. **Regression pack generator core** (TS/Python): accept target list; generate unit + integration test stubs; emit artifacts to temp dir; return manifest.
8. **Refactor plan/apply module** (TS): detect near-dupes via embeddings stub; propose patch set structure; apply patches via fs with dry-run flag.
9. **Observability event schema + emitter** (TS): define span/event shapes; emit from MCP server + dispatcher; send to in-memory sink.
10. **Inspector/Auditor rules engine** (TS): subscribe to events; run rules (DTO mismatch, missing validation, outbox off, PII flag, rate limit breach); expose MCP `inspector.stream/snapshot/waive`; throttle duplicate warnings.
11. **Vector store adapter** (TS): interface + pgvector stub; upsert/query embeddings; config via env.
12. **Graph store adapter** (TS): interface + Neo4j/TypeDB stub; write/read nodes/edges for code entities.
13. **Artifact store adapter** (TS): interface + local-fs backend; save/load artifacts, diffs, reports.
14. **CLI wrapper** (TS): commands `annotate`, `graph query`, `tests generate`, `refactor plan/apply`, `inspector report`; connects to MCP.
15. **VS Code extension shell** (TS): activate command; connect to MCP; simple panel showing inspector warnings + command palette bindings.
16. **SPA BI skeleton** (React TS): basic dashboard consuming observability/inspector streams; cards for warnings, recent runs, coverage placeholders.
17. **Approval/review queue backend** (TS): minimal store (in-memory/file) for pending actions; API to approve/waive; hook into MCP responses.
18. **CI entrypoint script** (TS): headless CLI invocation for annotate/graph/tests; outputs JUnit/JSON; posts artifacts to artifact adapter.
19. **Docs: add strategy/tool guide**: short how-to with sample strategy (Go Fx) and tool module (Python) templates.

## Notes
- Keep each task self-contained; no cross-task hard dependencies beyond shared interfaces.
- Include minimal tests or sample invocations to validate wiring without exceeding 300 LOC.
- Prefer stubs/interfaces for external systems to stay within size; real connectors can be follow-up tasks. 
