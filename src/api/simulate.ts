import type {
  SimulationRequest,
  SimulationResult,
  SimulationStep,
} from '../types/api';

/**
 * POST /simulate — accepts a serialized workflow graph and walks
 * through it from Start → End, producing a step-by-step execution log.
 *
 * Uses BFS traversal from the first Start node found.
 * Simulates async processing with random durations.
 */
export async function simulateWorkflow(
  request: SimulationRequest
): Promise<SimulationResult> {
  await new Promise((r) => setTimeout(r, 500));

  const { nodes, edges } = request;
  const errors: string[] = [];

  // Build adjacency map
  const adjacency = new Map<string, string[]>();
  for (const edge of edges) {
    const targets = adjacency.get(edge.source) || [];
    targets.push(edge.target);
    adjacency.set(edge.source, targets);
  }

  // Find start node
  const startNode = nodes.find((n) => n.type === 'startNode');
  if (!startNode) {
    return {
      success: false,
      steps: [],
      totalDuration: 0,
      errors: ['No Start Node found in the workflow.'],
    };
  }

  // Find end node
  const endNode = nodes.find((n) => n.type === 'endNode');
  if (!endNode) {
    errors.push('Warning: No End Node found. Simulation will run until no more connections.');
  }

  // BFS traversal
  const visited = new Set<string>();
  const queue = [startNode.id];
  const steps: SimulationStep[] = [];
  const nodeMap = new Map(nodes.map((n) => [n.id, n]));

  while (queue.length > 0) {
    const currentId = queue.shift()!;
    if (visited.has(currentId)) continue;
    visited.add(currentId);

    const node = nodeMap.get(currentId);
    if (!node) continue;

    const duration = getSimulatedDuration(node.type);
    const step = createStep(node, duration);
    steps.push(step);

    // Queue children
    const children = adjacency.get(currentId) || [];
    for (const childId of children) {
      if (!visited.has(childId)) {
        queue.push(childId);
      }
    }
  }

  // Check for unvisited nodes
  const unvisitedNodes = nodes.filter((n) => !visited.has(n.id));
  if (unvisitedNodes.length > 0) {
    errors.push(
      `${unvisitedNodes.length} node(s) are unreachable from the Start Node: ${unvisitedNodes
        .map((n) => (n.data.title as string) || n.id)
        .join(', ')}`
    );
  }

  const totalDuration = steps.reduce((sum, s) => sum + s.duration, 0);

  return {
    success: errors.length === 0,
    steps,
    totalDuration,
    errors,
  };
}

function getSimulatedDuration(type: string): number {
  switch (type) {
    case 'startNode':
      return 100;
    case 'taskNode':
      return 800 + Math.random() * 1200;
    case 'approvalNode':
      return 500 + Math.random() * 2000;
    case 'automatedNode':
      return 200 + Math.random() * 500;
    case 'endNode':
      return 50;
    default:
      return 300;
  }
}

function createStep(
  node: { id: string; type: string; data: Record<string, unknown> },
  duration: number
): SimulationStep {
  const title = (node.data.title as string) || node.type;
  const messages: Record<string, string> = {
    startNode: `Workflow initiated: "${title}"`,
    taskNode: `Task "${title}" assigned to ${(node.data.assignee as string) || 'unassigned'}`,
    approvalNode: `Awaiting approval from ${(node.data.approverRole as string) || 'Manager'} for "${title}"`,
    automatedNode: `Executing automated action: "${title}"`,
    endNode: (node.data.endMessage as string) || 'Workflow completed',
  };

  return {
    nodeId: node.id,
    nodeType: node.type,
    title,
    status: 'completed',
    message: messages[node.type] || `Processing "${title}"`,
    duration: Math.round(duration),
  };
}
