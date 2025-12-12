/**
 * Knowledge graph ingest stub.
 * Consumes annotations and writes to a graph adapter (interface).
 */

export type GraphNode = { id: string; kind: string; props: Record<string, unknown> };
export type GraphEdge = { from: string; to: string; kind: string; props?: Record<string, unknown> };

export interface GraphAdapter {
  upsertNodes(nodes: GraphNode[]): Promise<void>;
  upsertEdges(edges: GraphEdge[]): Promise<void>;
}

export type Annotation = { file: string; symbols: string[]; comments: string[] };

export class GraphIngest {
  constructor(private readonly graph: GraphAdapter) {}

  async ingest(annotations: Annotation[]): Promise<void> {
    const nodes: GraphNode[] = [];
    const edges: GraphEdge[] = [];

    for (const ann of annotations) {
      const fileNodeId = `file:${ann.file}`;
      nodes.push({ id: fileNodeId, kind: "file", props: { path: ann.file } });

      for (const sym of ann.symbols) {
        const symId = `symbol:${ann.file}#${sym}`;
        nodes.push({ id: symId, kind: "symbol", props: { name: sym, file: ann.file } });
        edges.push({ from: fileNodeId, to: symId, kind: "contains" });
      }

      for (const comment of ann.comments) {
        const commentId = `comment:${ann.file}#${comment.slice(0, 12)}`;
        nodes.push({ id: commentId, kind: "comment", props: { text: comment } });
        edges.push({ from: fileNodeId, to: commentId, kind: "notes" });
      }
    }

    await this.graph.upsertNodes(nodes);
    await this.graph.upsertEdges(edges);
  }
}
