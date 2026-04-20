// ─── Automation Action (from GET /automations) ───────────────────────
export interface AutomationAction {
  id: string;
  label: string;
  params: string[];
}

// ─── Simulation Request/Response ──────────────────────────────────────
export interface SimulationRequest {
  nodes: SerializedNode[];
  edges: SerializedEdge[];
}

export interface SerializedNode {
  id: string;
  type: string;
  data: Record<string, unknown>;
}

export interface SerializedEdge {
  id: string;
  source: string;
  target: string;
}

export type SimulationStepStatus = 'pending' | 'running' | 'completed' | 'failed' | 'skipped';

export interface SimulationStep {
  nodeId: string;
  nodeType: string;
  title: string;
  status: SimulationStepStatus;
  message: string;
  duration: number; // ms
}

export interface SimulationResult {
  success: boolean;
  steps: SimulationStep[];
  totalDuration: number;
  errors: string[];
}
