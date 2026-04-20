import React from 'react';
import type { StartNodeData } from '../../../types/workflow';
import { useWorkflowStore } from '../../../hooks/useWorkflowStore';
import { FormField, inputStyle } from '../../common/FormField';
import { KeyValueEditor } from '../../common/KeyValueEditor';

interface StartFormProps {
  nodeId: string;
  data: StartNodeData;
}

export function StartForm({ nodeId, data }: StartFormProps) {
  const updateNodeData = useWorkflowStore((s) => s.updateNodeData);

  const update = (partial: Partial<StartNodeData>) => {
    updateNodeData(nodeId, partial);
  };

  return (
    <div>
      <FormField label="Start Title" required>
        <input
          style={inputStyle}
          value={data.title}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            update({ title: e.target.value })
          }
          placeholder="e.g., Employee Onboarding"
        />
      </FormField>

      <KeyValueEditor
        label="Metadata (Optional)"
        pairs={data.metadata || []}
        onChange={(metadata) => update({ metadata })}
      />
    </div>
  );
}
