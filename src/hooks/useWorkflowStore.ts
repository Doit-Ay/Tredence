import { create } from 'zustand';
import {
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  type OnNodesChange,
  type OnEdgesChange,
  type Connection,
} from '@xyflow/react';
import type {
  WorkflowNode,
  WorkflowEdge,
  WorkflowNodeType,
  WorkflowNodeData,
} from '../types/workflow';
import {
  createStartNodeData,
  createTaskNodeData,
  createApprovalNodeData,
  createAutomatedNodeData,
  createEndNodeData,
} from '../types/workflow';

// Snapshot for undo/redo
interface Snapshot {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
}

interface WorkflowState {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  selectedNodeId: string | null;

  // Undo/Redo
  past: Snapshot[];
  future: Snapshot[];
  canUndo: boolean;
  canRedo: boolean;

  // React Flow callbacks
  onNodesChange: OnNodesChange<WorkflowNode>;
  onEdgesChange: OnEdgesChange;
  onConnect: (connection: Connection) => void;

  // Actions
  addNode: (type: WorkflowNodeType, position: { x: number; y: number }) => void;
  updateNodeData: (nodeId: string, data: Partial<WorkflowNodeData>) => void;
  setSelectedNodeId: (id: string | null) => void;
  deleteSelectedNode: () => void;
  clearCanvas: () => void;
  setNodes: (nodes: WorkflowNode[]) => void;

  // Undo/Redo actions
  undo: () => void;
  redo: () => void;

  // Import/Export
  exportWorkflow: () => string;
  importWorkflow: (json: string) => void;
  loadTemplate: (nodes: WorkflowNode[], edges: WorkflowEdge[]) => void;
}

let nodeIdCounter = 0;
const generateId = () => `node_${++nodeIdCounter}_${Date.now()}`;

const dataFactories: Record<WorkflowNodeType, () => WorkflowNodeData> = {
  startNode: createStartNodeData,
  taskNode: createTaskNodeData,
  approvalNode: createApprovalNodeData,
  automatedNode: createAutomatedNodeData,
  endNode: createEndNodeData,
};

const MAX_HISTORY = 30;

// Push current state to past before a destructive action
function pushHistory(get: () => WorkflowState): Partial<WorkflowState> {
  const { nodes, edges, past } = get();
  const snapshot: Snapshot = {
    nodes: JSON.parse(JSON.stringify(nodes)),
    edges: JSON.parse(JSON.stringify(edges)),
  };
  const newPast = [...past, snapshot].slice(-MAX_HISTORY);
  return { past: newPast, future: [], canUndo: true, canRedo: false };
}

export const useWorkflowStore = create<WorkflowState>((set, get) => ({
  nodes: [],
  edges: [],
  selectedNodeId: null,
  past: [],
  future: [],
  canUndo: false,
  canRedo: false,

  // React Flow drag/move — no undo for these (too noisy)
  onNodesChange: (changes) => {
    set({ nodes: applyNodeChanges(changes, get().nodes) });
  },

  onEdgesChange: (changes) => {
    set({ edges: applyEdgeChanges(changes, get().edges) });
  },

  onConnect: (connection) => {
    const history = pushHistory(get);
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const edgeColor = isDark ? '#5c6370' : '#94a3b8';
    set({
      ...history,
      edges: addEdge(
        { ...connection, animated: true, style: { stroke: edgeColor, strokeWidth: 1.5 } },
        get().edges
      ),
    });
  },

  addNode: (type, position) => {
    const factory = dataFactories[type];
    if (!factory) return;

    const history = pushHistory(get);
    const newNode: WorkflowNode = {
      id: generateId(),
      type,
      position,
      data: factory(),
    };

    set({ ...history, nodes: [...get().nodes, newNode] });
  },

  updateNodeData: (nodeId, data) => {
    set({
      nodes: get().nodes.map((node) =>
        node.id === nodeId ? { ...node, data: { ...node.data, ...data } } : node
      ),
    });
  },

  setSelectedNodeId: (id) => {
    set({ selectedNodeId: id });
  },

  deleteSelectedNode: () => {
    const { selectedNodeId, nodes, edges } = get();
    if (!selectedNodeId) return;

    const history = pushHistory(get);
    set({
      ...history,
      nodes: nodes.filter((n) => n.id !== selectedNodeId),
      edges: edges.filter(
        (e) => e.source !== selectedNodeId && e.target !== selectedNodeId
      ),
      selectedNodeId: null,
    });
  },

  clearCanvas: () => {
    const history = pushHistory(get);
    set({ ...history, nodes: [], edges: [], selectedNodeId: null });
  },

  setNodes: (nodes) => {
    set({ nodes });
  },

  // Undo: restore last snapshot from past
  undo: () => {
    const { past, nodes, edges } = get();
    if (past.length === 0) return;

    const previous = past[past.length - 1];
    const newPast = past.slice(0, -1);

    set({
      past: newPast,
      future: [{ nodes: JSON.parse(JSON.stringify(nodes)), edges: JSON.parse(JSON.stringify(edges)) }, ...get().future],
      nodes: previous.nodes,
      edges: previous.edges,
      selectedNodeId: null,
      canUndo: newPast.length > 0,
      canRedo: true,
    });
  },

  // Redo: restore from future
  redo: () => {
    const { future, nodes, edges } = get();
    if (future.length === 0) return;

    const next = future[0];
    const newFuture = future.slice(1);

    set({
      past: [...get().past, { nodes: JSON.parse(JSON.stringify(nodes)), edges: JSON.parse(JSON.stringify(edges)) }],
      future: newFuture,
      nodes: next.nodes,
      edges: next.edges,
      selectedNodeId: null,
      canUndo: true,
      canRedo: newFuture.length > 0,
    });
  },

  exportWorkflow: () => {
    const { nodes, edges } = get();
    return JSON.stringify({ nodes, edges }, null, 2);
  },

  importWorkflow: (json) => {
    try {
      const data = JSON.parse(json);
      if (data.nodes && data.edges) {
        const history = pushHistory(get);
        set({
          ...history,
          nodes: data.nodes,
          edges: data.edges,
          selectedNodeId: null,
        });
      }
    } catch (e) {
      console.error('Failed to import workflow:', e);
    }
  },

  loadTemplate: (nodes, edges) => {
    const history = pushHistory(get);
    set({
      ...history,
      nodes: [...nodes],
      edges: [...edges],
      selectedNodeId: null,
    });
  },
}));
