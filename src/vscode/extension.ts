/**
 * VS Code extension shell (minimal).
 * Provides a command that calls MCP ping tool and shows output.
 */

import * as vscode from "vscode";
import { createDemoServer } from "../mcp/server";

export function activate(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand("aiMaint.ping", async () => {
    const server = createDemoServer(vscode.workspace.rootPath ?? process.cwd());
    const res = await server.handle({ id: "vscode", name: "ping", args: { payload: "hello" } });
    vscode.window.showInformationMessage(
      res.status === "success" ? `Ping: ${JSON.stringify(res.data)}` : `Error: ${res.error}`
    );
  });

  context.subscriptions.push(disposable);
}

export function deactivate() {
  // noop
}
