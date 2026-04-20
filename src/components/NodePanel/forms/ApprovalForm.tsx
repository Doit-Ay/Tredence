import React from 'react';
import type { ApprovalNodeData } from '../../../types/workflow';
import { useWorkflowStore } from '../../../hooks/useWorkflowStore';
import { FormField, inputStyle, selectStyle } from '../../common/FormField';

interface ApprovalFormProps {
  nodeId: string;
  data: ApprovalNodeData;
}

const APPROVER_ROLES = ['Manager', 'HRBP', 'Director', 'VP', 'CEO'];

export function ApprovalForm({ nodeId, data }: ApprovalFormProps) {
  const updateNodeData = useWorkflowStore((s) => s.updateNodeData);

  const update = (partial: Partial<ApprovalNodeData>) => {
    updateNodeData(nodeId, partial);
  };

  return (
    <div>
      <FormField label="Approval Title" required>
        <input
          style={inputStyle}
          value={data.title}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            update({ title: e.target.value })
          }
          placeholder="e.g., Manager Approval"
        />
      </FormField>

      <FormField label="Approver Role" required>
        <select
          style={selectStyle}
          value={data.approverRole}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
            update({ approverRole: e.target.value })
          }
        >
          {APPROVER_ROLES.map((role) => (
            <option key={role} value={role}>
              {role}
            </option>
          ))}
        </select>
      </FormField>

      <FormField label="Auto-Approve Threshold">
        <input
          type="number"
          style={inputStyle}
          value={data.autoApproveThreshold}
          min={0}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            update({ autoApproveThreshold: parseInt(e.target.value) || 0 })
          }
          placeholder="0 = manual approval required"
        />
        <div
          style={{
            fontSize: 11,
            color: 'var(--text-muted)',
            marginTop: 4,
          }}
        >
          Set to 0 for manual approval. Higher values auto-approve below
          threshold.
        </div>
      </FormField>
    </div>
  );
}
