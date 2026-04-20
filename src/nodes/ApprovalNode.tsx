import { Handle, Position, type NodeProps } from '@xyflow/react';
import { ShieldCheck } from 'lucide-react';
import type { ApprovalNodeData, ValidationError } from '../types/workflow';
import styles from './nodes.module.css';

interface ApprovalNodeProps extends NodeProps {
  data: ApprovalNodeData & { validationErrors?: ValidationError[] };
}

export function ApprovalNode({ data, selected }: ApprovalNodeProps) {
  const errors = data.validationErrors || [];
  const hasErrors = errors.some(e => e.severity === 'error');
  const hasWarnings = errors.some(e => e.severity === 'warning');

  return (
    <div className={`${styles.nodeBase} ${styles.approvalNode} ${selected ? styles.selected : ''}`}>
      <div className={styles.nodeTypeBar} />
      {(hasErrors || hasWarnings) && (
        <div className={`${styles.validationBadge} ${hasErrors ? styles.badgeError : styles.badgeWarning}`}>!</div>
      )}
      <Handle type="target" position={Position.Top} className={styles.handleTarget} />
      <div className={styles.nodeHeader}>
        <div className={styles.nodeIcon}><ShieldCheck size={14} /></div>
        <div className={styles.nodeTitle}>{data.title || 'Approval'}</div>
      </div>
      {data.approverRole && <div className={styles.nodeSubtitle}>{data.approverRole}</div>}
      <Handle type="source" position={Position.Bottom} className={styles.handleSource} />
    </div>
  );
}
