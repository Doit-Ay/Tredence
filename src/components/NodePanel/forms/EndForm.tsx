import React from 'react';
import type { EndNodeData } from '../../../types/workflow';
import { useWorkflowStore } from '../../../hooks/useWorkflowStore';
import { FormField, inputStyle } from '../../common/FormField';

interface EndFormProps {
  nodeId: string;
  data: EndNodeData;
}

export function EndForm({ nodeId, data }: EndFormProps) {
  const updateNodeData = useWorkflowStore((s) => s.updateNodeData);

  const update = (partial: Partial<EndNodeData>) => {
    updateNodeData(nodeId, partial);
  };

  return (
    <div>
      <FormField label="End Title">
        <input
          style={inputStyle}
          value={data.title}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            update({ title: e.target.value })
          }
          placeholder="e.g., Onboarding Complete"
        />
      </FormField>

      <FormField label="End Message">
        <input
          style={inputStyle}
          value={data.endMessage}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            update({ endMessage: e.target.value })
          }
          placeholder="Message shown when workflow completes"
        />
      </FormField>

      <FormField label="Show Summary">
        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            cursor: 'pointer',
            fontSize: 13,
            color: 'var(--text-primary)',
          }}
        >
          <div
            onClick={() => update({ showSummary: !data.showSummary })}
            style={{
              width: 40,
              height: 22,
              borderRadius: 11,
              background: data.showSummary
                ? 'linear-gradient(135deg, #0d9488, #06b6d4)'
                : 'var(--border-strong)',
              position: 'relative',
              cursor: 'pointer',
              transition: 'background 0.2s ease',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: 2,
                left: data.showSummary ? 20 : 2,
                width: 18,
                height: 18,
                borderRadius: '50%',
                background: 'white',
                transition: 'left 0.2s ease',
                boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
              }}
            />
          </div>
          {data.showSummary ? 'Enabled' : 'Disabled'}
        </label>
        <div
          style={{
            fontSize: 11,
            color: 'var(--text-muted)',
            marginTop: 6,
          }}
        >
          Show a summary of all completed steps when workflow ends.
        </div>
      </FormField>
    </div>
  );
}
