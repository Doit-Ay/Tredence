import { X, Trash2, MousePointer } from 'lucide-react';
import { useWorkflowStore } from '../../hooks/useWorkflowStore';
import { StartForm } from './forms/StartForm';
import { TaskForm } from './forms/TaskForm';
import { ApprovalForm } from './forms/ApprovalForm';
import { AutomatedForm } from './forms/AutomatedForm';
import { EndForm } from './forms/EndForm';
import type {
  StartNodeData,
  TaskNodeData,
  ApprovalNodeData,
  AutomatedNodeData,
  EndNodeData,
} from '../../types/workflow';
import styles from './NodePanel.module.css';

interface NodePanelProps {
  onClose: () => void;
}

const TYPE_LABELS: Record<string, string> = {
  startNode: 'Start',
  taskNode: 'Task',
  approvalNode: 'Approval',
  automatedNode: 'Automated',
  endNode: 'End',
};

export function NodePanel({ onClose }: NodePanelProps) {
  const { nodes, selectedNodeId, deleteSelectedNode, setSelectedNodeId } =
    useWorkflowStore();

  const selectedNode = nodes.find((n) => n.id === selectedNodeId);

  if (!selectedNode) {
    return (
      <div className={styles.panel}>
        <div className={styles.emptyState}>
          <MousePointer size={32} />
          <p>Select a node on the canvas to configure it</p>
        </div>
      </div>
    );
  }

  const nodeType = selectedNode.type || 'unknown';

  const handleDelete = () => {
    deleteSelectedNode();
    setSelectedNodeId(null);
    onClose();
  };

  const renderForm = () => {
    switch (nodeType) {
      case 'startNode':
        return (
          <StartForm
            nodeId={selectedNode.id}
            data={selectedNode.data as StartNodeData}
          />
        );
      case 'taskNode':
        return (
          <TaskForm
            nodeId={selectedNode.id}
            data={selectedNode.data as TaskNodeData}
          />
        );
      case 'approvalNode':
        return (
          <ApprovalForm
            nodeId={selectedNode.id}
            data={selectedNode.data as ApprovalNodeData}
          />
        );
      case 'automatedNode':
        return (
          <AutomatedForm
            nodeId={selectedNode.id}
            data={selectedNode.data as AutomatedNodeData}
          />
        );
      case 'endNode':
        return (
          <EndForm
            nodeId={selectedNode.id}
            data={selectedNode.data as EndNodeData}
          />
        );
      default:
        return <p>Unknown node type</p>;
    }
  };

  return (
    <div className={styles.panel}>
      <div className={styles.panelHeader}>
        <div className={styles.panelHeaderLeft}>
          <span className={styles.panelTitle}>Configure</span>
          <span className={styles.panelNodeType}>
            {TYPE_LABELS[nodeType] || nodeType}
          </span>
        </div>
        <button className={styles.closeButton} onClick={onClose}>
          <X size={16} />
        </button>
      </div>

      <div className={styles.panelBody}>{renderForm()}</div>

      <div className={styles.panelFooter}>
        <button className={styles.deleteButton} onClick={handleDelete}>
          <Trash2 size={14} />
          Delete Node
        </button>
      </div>
    </div>
  );
}
