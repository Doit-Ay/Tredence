import { useMemo } from 'react';
import type { WorkflowNode, WorkflowEdge, ValidationError } from '../types/workflow';

/**
 * Real-time validation hook.
 * Runs on every node/edge change and produces live validation errors
 * that are displayed as warning badges directly on the canvas nodes.
 */
export function useValidation(nodes: WorkflowNode[], edges: WorkflowEdge[]) {
  const validationErrors = useMemo(() => {
    const errors: ValidationError[] = [];

    const startNodes = nodes.filter((n) => n.type === 'startNode');
    const endNodes = nodes.filter((n) => n.type === 'endNode');

    // ─── Global Checks ──────────────────────────────────────────
    if (nodes.length > 0 && startNodes.length === 0) {
      errors.push({
        message: 'Workflow must have a Start Node.',
        severity: 'error',
      });
    }

    if (startNodes.length > 1) {
      startNodes.forEach((n) =>
        errors.push({
          nodeId: n.id,
          message: 'Only one Start Node is allowed.',
          severity: 'error',
        })
      );
    }

    if (nodes.length > 1 && endNodes.length === 0) {
      errors.push({
        message: 'Workflow should have an End Node.',
        severity: 'warning',
      });
    }

    // ─── Per-Node Checks ────────────────────────────────────────
    const incomingEdges = new Map<string, number>();
    const outgoingEdges = new Map<string, number>();

    for (const edge of edges) {
      incomingEdges.set(edge.target, (incomingEdges.get(edge.target) || 0) + 1);
      outgoingEdges.set(edge.source, (outgoingEdges.get(edge.source) || 0) + 1);
    }

    for (const node of nodes) {
      const incoming = incomingEdges.get(node.id) || 0;
      const outgoing = outgoingEdges.get(node.id) || 0;

      // Start node shouldn't have incoming edges
      if (node.type === 'startNode' && incoming > 0) {
        errors.push({
          nodeId: node.id,
          message: 'Start Node should not have incoming connections.',
          severity: 'warning',
        });
      }

      // Start node must have outgoing
      if (node.type === 'startNode' && outgoing === 0 && nodes.length > 1) {
        errors.push({
          nodeId: node.id,
          message: 'Start Node has no outgoing connections.',
          severity: 'error',
        });
      }

      // End node shouldn't have outgoing edges
      if (node.type === 'endNode' && outgoing > 0) {
        errors.push({
          nodeId: node.id,
          message: 'End Node should not have outgoing connections.',
          severity: 'warning',
        });
      }

      // End node must have incoming
      if (node.type === 'endNode' && incoming === 0 && nodes.length > 1) {
        errors.push({
          nodeId: node.id,
          message: 'End Node has no incoming connections.',
          severity: 'error',
        });
      }

      // Middle nodes should have both incoming and outgoing (if workflow has >1 node)
      if (
        node.type !== 'startNode' &&
        node.type !== 'endNode' &&
        nodes.length > 1
      ) {
        if (incoming === 0) {
          errors.push({
            nodeId: node.id,
            message: `"${node.data.title || node.type}" has no incoming connections (orphan).`,
            severity: 'warning',
          });
        }
        if (outgoing === 0) {
          errors.push({
            nodeId: node.id,
            message: `"${node.data.title || node.type}" has no outgoing connections.`,
            severity: 'warning',
          });
        }
      }
    }

    // ─── Cycle Detection (DFS) ──────────────────────────────────
    if (nodes.length > 0 && startNodes.length === 1) {
      const adjacency = new Map<string, string[]>();
      for (const edge of edges) {
        const targets = adjacency.get(edge.source) || [];
        targets.push(edge.target);
        adjacency.set(edge.source, targets);
      }

      const visited = new Set<string>();
      const inStack = new Set<string>();

      function hasCycle(nodeId: string): boolean {
        visited.add(nodeId);
        inStack.add(nodeId);

        for (const neighbor of adjacency.get(nodeId) || []) {
          if (!visited.has(neighbor)) {
            if (hasCycle(neighbor)) return true;
          } else if (inStack.has(neighbor)) {
            return true;
          }
        }

        inStack.delete(nodeId);
        return false;
      }

      for (const node of nodes) {
        if (!visited.has(node.id)) {
          if (hasCycle(node.id)) {
            errors.push({
              message: 'Cycle detected in the workflow. Workflows should be acyclic.',
              severity: 'error',
            });
            break;
          }
        }
      }
    }

    return errors;
  }, [nodes, edges]);

  // Build a per-node error map for quick lookups in node components
  const nodeErrors = useMemo(() => {
    const map = new Map<string, ValidationError[]>();
    for (const error of validationErrors) {
      if (error.nodeId) {
        const existing = map.get(error.nodeId) || [];
        existing.push(error);
        map.set(error.nodeId, existing);
      }
    }
    return map;
  }, [validationErrors]);

  return { validationErrors, nodeErrors };
}
