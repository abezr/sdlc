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
