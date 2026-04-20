import { Handle, Position, type NodeProps } from '@xyflow/react';
import { ClipboardList } from 'lucide-react';
import type { TaskNodeData, ValidationError } from '../types/workflow';
import styles from './nodes.module.css';

interface TaskNodeProps extends NodeProps {
  data: TaskNodeData & { validationErrors?: ValidationError[] };
}

export function TaskNode({ data, selected }: TaskNodeProps) {
  const errors = data.validationErrors || [];
  const hasErrors = errors.some(e => e.severity === 'error');
  const hasWarnings = errors.some(e => e.severity === 'warning');

  return (
    <div className={`${styles.nodeBase} ${styles.taskNode} ${selected ? styles.selected : ''}`}>
      <div className={styles.nodeTypeBar} />
      {(hasErrors || hasWarnings) && (
        <div className={`${styles.validationBadge} ${hasErrors ? styles.badgeError : styles.badgeWarning}`}>!</div>
      )}
      <Handle type="target" position={Position.Top} className={styles.handleTarget} />
      <div className={styles.nodeHeader}>
        <div className={styles.nodeIcon}><ClipboardList size={14} /></div>
        <div className={styles.nodeTitle}>{data.title || 'Task'}</div>
      </div>
      {data.assignee && <div className={styles.nodeSubtitle}>{data.assignee}</div>}
      <Handle type="source" position={Position.Bottom} className={styles.handleSource} />
    </div>
  );
}
