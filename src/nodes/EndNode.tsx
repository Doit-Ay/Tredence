import { Handle, Position, type NodeProps } from '@xyflow/react';
import { Square } from 'lucide-react';
import type { EndNodeData, ValidationError } from '../types/workflow';
import styles from './nodes.module.css';

interface EndNodeProps extends NodeProps {
  data: EndNodeData & { validationErrors?: ValidationError[] };
}

export function EndNode({ data, selected }: EndNodeProps) {
  const errors = data.validationErrors || [];
  const hasErrors = errors.some(e => e.severity === 'error');
  const hasWarnings = errors.some(e => e.severity === 'warning');

  return (
    <div className={`${styles.nodeBase} ${styles.endNode} ${selected ? styles.selected : ''}`}>
      <div className={styles.nodeTypeBar} />
      {(hasErrors || hasWarnings) && (
        <div className={`${styles.validationBadge} ${hasErrors ? styles.badgeError : styles.badgeWarning}`}>!</div>
      )}
      <Handle type="target" position={Position.Top} className={styles.handleTarget} />
      <div className={styles.nodeHeader}>
        <div className={styles.nodeIcon}><Square size={14} /></div>
        <div className={styles.nodeTitle}>{data.title || 'End'}</div>
      </div>
      {data.endMessage && <div className={styles.nodeSubtitle}>{data.endMessage}</div>}
    </div>
  );
}
