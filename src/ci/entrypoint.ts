/**
 * CI entrypoint stub.
 * Invokes annotate + tests.generate tools via MCP server.
 */

import { createDemoServer } from "../mcp/server";

async function run() {
  const server = createDemoServer(process.cwd());
  const annotate = await server.handle({ id: "ci", name: "annotate.code", args: { scope: "src" } });
  const tests = await server.handle({ id: "ci", name: "tests.generate", args: { target: "all" } });
  console.log("annotate:", annotate);
  console.log("tests:", tests);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
