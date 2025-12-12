/**
 * Graph store adapter stub.
 */

export type GraphNode = { id: string; kind: string; props: Record<string, unknown> };
export type GraphEdge = { from: string; to: string; kind: string; props?: Record<string, unknown> };

export interface GraphStore {
  upsertNodes(nodes: GraphNode[]): Promise<void>;
  upsertEdges(edges: GraphEdge[]): Promise<void>;
  getNode(id: string): Promise<GraphNode | undefined>;
}

export class InMemoryGraphStore implements GraphStore {
  private nodes = new Map<string, GraphNode>();
  private edges: GraphEdge[] = [];

  async upsertNodes(nodes: GraphNode[]): Promise<void> {
    for (const n of nodes) this.nodes.set(n.id, n);
  }
  async upsertEdges(edges: GraphEdge[]): Promise<void> {
    this.edges.push(...edges);
  }
  async getNode(id: string): Promise<GraphNode | undefined> {
    return this.nodes.get(id);
  }
}
