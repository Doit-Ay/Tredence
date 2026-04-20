import type { Node, Edge } from '@xyflow/react';

// ─── Node Type Identifiers ────────────────────────────────────────────
export type WorkflowNodeType =
  | 'startNode'
  | 'taskNode'
  | 'approvalNode'
  | 'automatedNode'
  | 'endNode';

// ─── Node Data Payloads ───────────────────────────────────────────────
export interface KeyValuePair {
  key: string;
  value: string;
}

export interface StartNodeData {
  label: string;
  title: string;
  metadata: KeyValuePair[];
  [key: string]: unknown;
}

export interface TaskNodeData {
  label: string;
  title: string;
  description: string;
  assignee: string;
  dueDate: string;
  customFields: KeyValuePair[];
  [key: string]: unknown;
}

export interface ApprovalNodeData {
  label: string;
  title: string;
  approverRole: 'Manager' | 'HRBP' | 'Director' | string;
  autoApproveThreshold: number;
  [key: string]: unknown;
}

export interface AutomatedNodeData {
  label: string;
  title: string;
  actionId: string;
  actionParams: Record<string, string>;
  [key: string]: unknown;
}

export interface EndNodeData {
  label: string;
  title: string;
  endMessage: string;
  showSummary: boolean;
  [key: string]: unknown;
}

export type WorkflowNodeData =
  | StartNodeData
  | TaskNodeData
  | ApprovalNodeData
  | AutomatedNodeData
  | EndNodeData;

// ─── React Flow Node/Edge Types ───────────────────────────────────────
export type WorkflowNode = Node<WorkflowNodeData, WorkflowNodeType>;
export type WorkflowEdge = Edge;

// ─── Validation ───────────────────────────────────────────────────────
export interface ValidationError {
  nodeId?: string;
  message: string;
  severity: 'error' | 'warning';
}

// ─── Default Data Factories ───────────────────────────────────────────
export const createStartNodeData = (): StartNodeData => ({
  label: 'Start',
  title: 'Workflow Start',
  metadata: [],
});

export const createTaskNodeData = (): TaskNodeData => ({
  label: 'Task',
  title: 'New Task',
  description: '',
  assignee: '',
  dueDate: '',
  customFields: [],
});

export const createApprovalNodeData = (): ApprovalNodeData => ({
  label: 'Approval',
  title: 'Approval Step',
  approverRole: 'Manager',
  autoApproveThreshold: 0,
});

export const createAutomatedNodeData = (): AutomatedNodeData => ({
  label: 'Automated',
  title: 'Automated Step',
  actionId: '',
  actionParams: {},
});

export const createEndNodeData = (): EndNodeData => ({
  label: 'End',
  title: 'Workflow End',
  endMessage: 'Workflow completed successfully.',
  showSummary: true,
});
