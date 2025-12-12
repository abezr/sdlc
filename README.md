# AI SDLC Repository

This repository contains the architecture documentation, scenarios, and source code for the AI Software Development Life Cycle project, including the AI Maintainer toolchain (MCP server, plugin host, annotator, graph ingest, tests, refactor, observability/inspector, BI clients).

## Repository Structure

```
.
├── arch-docs/          # Architecture, roadmap, strategy/tool guide
├── scenarios/          # Use case scenarios and examples
├── src/                # MCP server, plugin host, annotator, graph, tests, refactor, adapters, UX surfaces
└── README.md           # This file
```

## Getting Started

### Prerequisites
- Git
- Node.js (for potential JavaScript/TypeScript projects)
- Python (for potential Python projects)

### Installation

1) Clone the repository:
```bash
git clone <repository-url>
cd ai-sdlc
```

2) Install JS/TS deps (Node 18+):
```bash
npm install
```

3) (Optional) Python tools use the system interpreter for dispatcher plugins; no repo-level venv is required unless you add Python dependencies.

## Project Structure

- **arch-docs/**: Architecture (C4), AI maintainer design, pluggable architecture, roadmap, strategy/tool quickstart.
- **scenarios/**: Use case scenarios, user stories, example workflows.
- **src/**: Code for MCP server, plugin host (TypeScript), dynamic tool dispatcher (Python), annotator, graph ingest, test generator, refactor engine, observability/inspector, adapters (vector/graph/artifact), CLI, VS Code extension shell, SPA BI skeleton, approvals store, CI entrypoint.

## Quickstarts

- **MCP server demo**: `node dist/cli/index.js ping payload=hello` (after build) calls the MCP shell with demo tool.
- **Plugin host (TS) demo**: use `createDemoHost()` in `src/plugin-host/index.ts` and dispatch to `hello.topic`.
- **Tool dispatcher (Python)**: run `python src/dispatcher/tool_dispatcher.py` to load plugins in `src/dispatcher/plugins` (if present).
- **Annotator stub**: `ts-node src/annotator/worker.ts` to emit `.sem.json` sidecars.
- **Tests generator**: use `TestGenerator` in `src/tests/generator.ts` to create placeholder specs.

## Docs to read next
- `arch-docs/ai-maintainer-architecture.md` — end-to-end maintainer architecture.
- `arch-docs/ai-maintainer-pluggable-architecture.md` — DI/plugin pattern and inspector mode.
- `arch-docs/roadmap.md` — task-per-feature plan sized for 50–300 LOC.
- `arch-docs/strategy-tool-guide.md` — templates for strategies/tools.
