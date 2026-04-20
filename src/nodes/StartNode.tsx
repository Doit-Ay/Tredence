import { Handle, Position, type NodeProps } from '@xyflow/react';
import { Play } from 'lucide-react';
import type { StartNodeData, ValidationError } from '../types/workflow';
import styles from './nodes.module.css';

interface StartNodeProps extends NodeProps {
  data: StartNodeData & { validationErrors?: ValidationError[] };
}

export function StartNode({ data, selected }: StartNodeProps) {
  const errors = data.validationErrors || [];
  const hasErrors = errors.some(e => e.severity === 'error');
  const hasWarnings = errors.some(e => e.severity === 'warning');

  return (
    <div className={`${styles.nodeBase} ${styles.startNode} ${selected ? styles.selected : ''}`}>
      <div className={styles.nodeTypeBar} />
      {(hasErrors || hasWarnings) && (
        <div className={`${styles.validationBadge} ${hasErrors ? styles.badgeError : styles.badgeWarning}`}>!</div>
      )}
      <div className={styles.nodeHeader}>
        <div className={styles.nodeIcon}><Play size={14} /></div>
        <div className={styles.nodeTitle}>{data.title || 'Start'}</div>
      </div>
      {data.metadata && data.metadata.length > 0 && (
        <div className={styles.nodeSubtitle}>{data.metadata.length} metadata field{data.metadata.length !== 1 ? 's' : ''}</div>
      )}
      <Handle type="source" position={Position.Bottom} className={styles.handleSource} />
    </div>
  );
}
