/**
 * Regression pack generator (stub).
 * Generates simple unit/integration placeholders and returns a manifest.
 */

import fs from "fs";
import path from "path";

export type Target = { name: string; kind: "unit" | "integration" | "e2e" };
export type GeneratedTest = { path: string; kind: Target["kind"]; content: string };
export type Manifest = { generated: GeneratedTest[] };

export class TestGenerator {
  constructor(private readonly outDir: string) {}

  async generate(targets: Target[]): Promise<Manifest> {
    if (!fs.existsSync(this.outDir)) fs.mkdirSync(this.outDir, { recursive: true });
    const generated: GeneratedTest[] = targets.map((t) => this.writeTest(t));
    return { generated };
  }

  private writeTest(target: Target): GeneratedTest {
    const filename = `${target.name}.${target.kind}.spec.ts`;
    const testBody = this.buildBody(target);
    const outPath = path.join(this.outDir, filename);
    fs.writeFileSync(outPath, testBody, "utf8");
    return { path: outPath, kind: target.kind, content: testBody };
  }

  private buildBody(target: Target): string {
    const imports = this.generateImports(target);
    const scenarios = this.buildScenarios(target);
    const body =
      scenarios
        .map(
          (s) => [
            `  it("${s.title}", async () => {`,
            ...s.arrange.map((l) => `    ${l}`),
            `    const result = await ${s.act};`,
            ...s.assert.map((l) => `    ${l}`),
            `  });`,
          ].join("\n")
        )
        .join("\n\n") ||
      `  it("should execute default sanity path", async () => {\n    const result = await Promise.resolve(/* TODO */);\n    expect(result).toBeDefined();\n  });`;

    return [`// Auto-generated ${target.kind} tests for ${target.name}`, ...imports, ``, `describe("${target.name}", () => {`, body, `});`, ""].join("\n");
  }

  private buildScenarios(target: Target): Array<{ title: string; arrange: string[]; act: string; assert: string[] }> {
    const graph = this.graph;
    if (!graph || graph.nodes.length === 0) {
      return [
        {
          title: "should execute default sanity path",
          arrange: [`// TODO: setup inputs for ${target.name}`],
          act: `${this.callExprSafe(target)}`,
          assert: [`expect(result).toBeDefined();`],
        },
      ];
    }

    const symbolNodes = graph.nodes
      .filter((n) => n.kind === "symbol" && this.matchesTarget(n, target))
      .filter((n) => this.isGrounded(n));
    const scenarios: Array<{ title: string; arrange: string[]; act: string; assert: string[] }> = [];

    for (const sym of symbolNodes) {
      const deps = this.dependenciesOf(sym.id, graph.edges);
      const comments = this.commentsFor(sym.id, graph);
      const variants = this.variantHints(comments);

      // Use specialized test scenarios for known functions
      const specializedScenarios = this.generateTestScenarios(sym, deps);
      scenarios.push(...specializedScenarios);

      for (const variant of variants) {
        scenarios.push({
          title: `should handle ${variant.label} for ${sym.props.name || sym.id}`,
          arrange: [...this.arrangeLines(sym, deps), `// Variant: ${variant.reason}`],
          act: this.callExprSafe(String(sym.props.name || target.name), variant.inputHint),
          assert: variant.assertions.length ? variant.assertions : [`expect(result).toBeDefined();`],
        });
      }
    }

    if (!scenarios.length) {
      this.warnings.push(`No grounded symbols for target ${target.name}; falling back to sanity test.`);
    return [
      `// Auto-generated ${target.kind} test for ${target.name}`,
      `describe("${target.name}", () => {`,
      `  it("should execute placeholder assertion", () => {`,
      `    expect(true).toBe(true);`,
      `  });`,
      `});`,
      "",
    ].join("\n");
  }
}
