/**
 * Artifact store adapter stub (local FS).
 */

import fs from "fs";
import path from "path";

export interface ArtifactStore {
  save(relPath: string, content: string | Buffer): Promise<string>;
  load(relPath: string): Promise<Buffer>;
}

export class LocalArtifactStore implements ArtifactStore {
  constructor(private readonly root: string) {}

  async save(relPath: string, content: string | Buffer): Promise<string> {
    const full = path.join(this.root, relPath);
    fs.mkdirSync(path.dirname(full), { recursive: true });
    fs.writeFileSync(full, content);
    return full;
  }

  async load(relPath: string): Promise<Buffer> {
    const full = path.join(this.root, relPath);
    return fs.readFileSync(full);
  }
}
