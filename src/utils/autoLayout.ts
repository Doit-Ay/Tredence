import Dagre from 'dagre';
import type { WorkflowNode, WorkflowEdge } from '../types/workflow';

/**
 * Auto-layouts nodes using dagre's directed graph algorithm.
 * Returns a new array of nodes with updated positions.
 */
export function autoLayout(
  nodes: WorkflowNode[],
  edges: WorkflowEdge[],
  direction: 'TB' | 'LR' = 'TB'
): WorkflowNode[] {
  const g = new Dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));

  g.setGraph({
    rankdir: direction,
    nodesep: 60,
    ranksep: 80,
    marginx: 40,
    marginy: 40,
  });

  nodes.forEach((node) => {
    g.setNode(node.id, { width: 200, height: 60 });
  });

  edges.forEach((edge) => {
    g.setEdge(edge.source, edge.target);
  });

  Dagre.layout(g);

  return nodes.map((node) => {
    const pos = g.node(node.id);
    return {
      ...node,
      position: {
        x: pos.x - 100, // center offset (width/2)
        y: pos.y - 30,   // center offset (height/2)
      },
    };
  });
}
