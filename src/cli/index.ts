#!/usr/bin/env node
/**
 * CLI wrapper stub. Connects to MCP server instance and calls tools by name.
 */

import { createDemoServer } from "../mcp/server";

async function main() {
  const [, , command, ...rest] = process.argv;
  const server = createDemoServer(process.cwd());

  if (!command) {
    console.log("Usage: ai-maint <tool> [key=value]");
    process.exit(1);
  }

  const args = parseArgs(rest);
  const res = await server.handle({ id: "cli", name: command, args });
  if (res.status === "success") {
    console.log(JSON.stringify(res.data, null, 2));
  } else {
    console.error("Error:", res.error);
    process.exit(1);
  }
}

function parseArgs(kvs: string[]): Record<string, string> {
  return kvs.reduce((acc, kv) => {
    const [k, v] = kv.split("=");
    if (k) acc[k] = v ?? "";
    return acc;
  }, {} as Record<string, string>);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
