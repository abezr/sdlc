/**
 * Approval/review queue backend (in-memory stub).
 */

export type Approval = {
  id: string;
  subject: string;
  status: "pending" | "approved" | "rejected";
  createdAt: number;
  rationale?: string;
};

export class ApprovalStore {
  private readonly items = new Map<string, Approval>();

  add(subject: string): Approval {
    const id = `apr-${Math.random().toString(36).slice(2, 8)}`;
    const approval: Approval = { id, subject, status: "pending", createdAt: Date.now() };
    this.items.set(id, approval);
    return approval;
  }

  list(): Approval[] {
    return [...this.items.values()];
  }

  update(id: string, status: Approval["status"], rationale?: string): Approval | undefined {
    const item = this.items.get(id);
    if (!item) return undefined;
    const next = { ...item, status, rationale };
    this.items.set(id, next);
    return next;
  }
}
