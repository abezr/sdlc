/**
 * Semantic annotator worker (stub).
 * Parses files, emits semantic sidecars, and (optionally) embeddings.
 * Kept small for teaching pattern: explicit interfaces and pure functions.
 */

import fs from "fs";
import path from "path";

export type Annotation = {
  file: string;
  symbols: string[];
  comments: string[];
};

export type AnnotatorConfig = {
  root: string;
  outDir: string;
};

export class AnnotatorWorker {
  constructor(private readonly cfg: AnnotatorConfig) {}

  async run(): Promise<Annotation[]> {
    const files = this.listSourceFiles(this.cfg.root);
    const results: Annotation[] = [];
    for (const file of files) {
      const content = fs.readFileSync(file, "utf8");
      results.push(this.annotateFile(file, content));
    }
    this.writeSidecars(results);
    return results;
  }

  private listSourceFiles(root: string): string[] {
    const entries = fs.readdirSync(root);
    return entries
      .filter((f) => f.endsWith(".ts") || f.endsWith(".js"))
      .map((f) => path.join(root, f));
  }

  private annotateFile(file: string, content: string): Annotation {
    // Very light stub: collect export names and TODO comments.
    const symbols = Array.from(content.matchAll(/export\s+(?:class|function|const|type)\s+(\w+)/g)).map(
      (m) => m[1]
    );
    const comments = Array.from(content.matchAll(/TODO:(.*)$/gm)).map((m) => m[1].trim());
    return { file, symbols, comments };
  }

  private writeSidecars(annotations: Annotation[]): void {
    if (!fs.existsSync(this.cfg.outDir)) fs.mkdirSync(this.cfg.outDir, { recursive: true });
    for (const ann of annotations) {
      const outPath = path.join(this.cfg.outDir, path.basename(ann.file) + ".sem.json");
      fs.writeFileSync(outPath, JSON.stringify(ann, null, 2), "utf8");
    }
  }
}

// Demo run hook (remove or replace in production)
if (require.main === module) {
  const worker = new AnnotatorWorker({ root: ".", outDir: ".sem" });
  worker.run().then((anns) => console.log(`Annotated ${anns.length} files`));
}
