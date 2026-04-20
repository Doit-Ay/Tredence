import type { NodeTypes } from '@xyflow/react';
import { StartNode } from './StartNode';
import { TaskNode } from './TaskNode';
import { ApprovalNode } from './ApprovalNode';
import { AutomatedNode } from './AutomatedNode';
import { EndNode } from './EndNode';

/**
 * Registry mapping workflow node type identifiers to their React components.
 * Passed to the React Flow <ReactFlow nodeTypes={nodeTypes} /> prop.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const nodeTypes: NodeTypes = {
  startNode: StartNode as any,
  taskNode: TaskNode as any,
  approvalNode: ApprovalNode as any,
  automatedNode: AutomatedNode as any,
  endNode: EndNode as any,
};
