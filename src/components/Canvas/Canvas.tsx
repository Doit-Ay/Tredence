import React, { useCallback, useMemo } from 'react';
import {
  ReactFlow,
  Background,
  MiniMap,
  Controls,
  BackgroundVariant,
  type ReactFlowInstance,
  type MiniMapNodeProps,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { useWorkflowStore } from '../../hooks/useWorkflowStore';
import { useThemeStore } from '../../hooks/useThemeStore';
import { useValidation } from '../../hooks/useValidation';
import { nodeTypes } from '../../nodes/nodeTypes';
import type { WorkflowNodeType, ValidationError } from '../../types/workflow';
import { AlertTriangle, MousePointerClick } from 'lucide-react';
import styles from './Canvas.module.css';

const NODE_COLORS: Record<string, string> = {
  startNode: '#10b981',
  taskNode: '#3b82f6',
  approvalNode: '#f59e0b',
  automatedNode: '#8b5cf6',
  endNode: '#ef4444',
};

// Custom MiniMap node
function MiniMapNode({ x, y, width, height, selected, id }: MiniMapNodeProps) {
  const node = useWorkflowStore.getState().nodes.find((n) => n.id === id);
  const theme = useThemeStore.getState().theme;
  const nodeType = (node?.type || '') as string;
  const barColor = NODE_COLORS[nodeType] || '#94a3b8';
  const radius = 4;
  const isDark = theme === 'dark';

  return (
    <g transform={`translate(${x}, ${y})`}>
      <rect
        width={width}
        height={height}
        rx={radius}
        ry={radius}
        fill={isDark ? 'rgba(30, 33, 44, 0.9)' : 'rgba(255, 255, 255, 0.9)'}
        stroke={selected ? (isDark ? '#2dd4bf' : '#0d9488') : (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)')}
        strokeWidth={selected ? 1.5 : 0.5}
      />
      <rect
        x={4}
        y={0}
        width={width - 8}
        height={2.5}
        rx={1}
        fill={barColor}
      />
    </g>
  );
}

interface CanvasProps {
  onNodeSelect: (nodeId: string | null) => void;
}


export function Canvas({ onNodeSelect }: CanvasProps) {
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    addNode,
    setSelectedNodeId,
  } = useWorkflowStore();

  const theme = useThemeStore((s) => s.theme);
  const isDark = theme === 'dark';

  const { validationErrors, nodeErrors } = useValidation(nodes, edges);
  const [reactFlowInstance, setReactFlowInstance] =
    React.useState<ReactFlowInstance | null>(null);

  const nodesWithValidation = useMemo(() => {
    return nodes.map((node) => ({
      ...node,
      data: {
        ...node.data,
        validationErrors: nodeErrors.get(node.id) || [],
      },
    }));
  }, [nodes, nodeErrors]);

  const globalErrors = useMemo(
    () => validationErrors.filter((e) => !e.nodeId),
    [validationErrors]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const type = event.dataTransfer.getData(
        'application/reactflow'
      ) as WorkflowNodeType;
      if (!type || !reactFlowInstance) return;

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      addNode(type, position);
    },
    [reactFlowInstance, addNode]
  );

  const handleNodeClick = useCallback(
    (_: React.MouseEvent, node: { id: string }) => {
      setSelectedNodeId(node.id);
      onNodeSelect(node.id);
    },
    [setSelectedNodeId, onNodeSelect]
  );

  const handlePaneClick = useCallback(() => {
    setSelectedNodeId(null);
    onNodeSelect(null);
  }, [setSelectedNodeId, onNodeSelect]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (
        (event.key === 'Delete' || event.key === 'Backspace') &&
        !['INPUT', 'TEXTAREA', 'SELECT'].includes(
          (event.target as HTMLElement).tagName
        )
      ) {
        const { selectedNodeId, deleteSelectedNode } =
          useWorkflowStore.getState();
        if (selectedNodeId) {
          deleteSelectedNode();
          onNodeSelect(null);
        }
      }
    },
    [onNodeSelect]
  );

  const edgeColor = isDark ? '#5c6370' : '#94a3b8';

  return (
    <div
      className={styles.canvasWrapper}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {globalErrors.length > 0 && (
        <div className={styles.validationOverlay}>
          {globalErrors.map((err: ValidationError, i: number) => (
            <div
              key={i}
              className={`${styles.validationChip} ${
                err.severity === 'error' ? styles.chipError : styles.chipWarning
              }`}
            >
              <AlertTriangle size={14} />
              {err.message}
            </div>
          ))}
        </div>
      )}

      {nodes.length === 0 && (
        <div className={styles.dropHint}>
          <MousePointerClick size={48} />
          <p>Drag nodes from the sidebar</p>
          <p>to start building your workflow</p>
        </div>
      )}

      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <ReactFlow
        nodes={nodesWithValidation as any}
        edges={edges}
        onNodesChange={onNodesChange as any}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onInit={setReactFlowInstance as any}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onNodeClick={handleNodeClick as any}
        onPaneClick={handlePaneClick}
        nodeTypes={nodeTypes}
        deleteKeyCode={['Backspace', 'Delete']}
        fitView
        fitViewOptions={{ maxZoom: 1, padding: 0.3 }}
        minZoom={0.2}
        maxZoom={1.5}
        proOptions={{ hideAttribution: true }}
        defaultEdgeOptions={{
          animated: true,
          style: { stroke: edgeColor, strokeWidth: 1.5 },
        }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={28}
          size={1}
          color={isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.08)'}
        />
        <Controls />
        <MiniMap
          nodeStrokeWidth={0}
          nodeComponent={MiniMapNode}
          maskColor={isDark ? 'rgba(15, 17, 23, 0.75)' : 'rgba(245, 243, 239, 0.75)'}
          style={{
            background: isDark ? 'rgba(22,24,33,0.7)' : 'rgba(255,255,255,0.7)',
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
            borderRadius: 10,
          }}
        />
      </ReactFlow>
    </div>
  );
}
