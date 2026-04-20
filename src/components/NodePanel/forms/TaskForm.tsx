import React from 'react';
import type { TaskNodeData } from '../../../types/workflow';
import { useWorkflowStore } from '../../../hooks/useWorkflowStore';
import { FormField, inputStyle, textareaStyle } from '../../common/FormField';
import { KeyValueEditor } from '../../common/KeyValueEditor';

interface TaskFormProps {
  nodeId: string;
  data: TaskNodeData;
}

export function TaskForm({ nodeId, data }: TaskFormProps) {
  const updateNodeData = useWorkflowStore((s) => s.updateNodeData);

  const update = (partial: Partial<TaskNodeData>) => {
    updateNodeData(nodeId, partial);
  };

  return (
    <div>
      <FormField label="Task Title" required>
        <input
          style={inputStyle}
          value={data.title}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            update({ title: e.target.value })
          }
          placeholder="e.g., Collect employee documents"
        />
      </FormField>

      <FormField label="Description">
        <textarea
          style={textareaStyle}
          value={data.description}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
            update({ description: e.target.value })
          }
          placeholder="Describe what this task involves..."
        />
      </FormField>

      <FormField label="Assignee">
        <input
          style={inputStyle}
          value={data.assignee}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            update({ assignee: e.target.value })
          }
          placeholder="e.g., HR Coordinator"
        />
      </FormField>

      <FormField label="Due Date">
        <input
          type="date"
          style={inputStyle}
          value={data.dueDate}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            update({ dueDate: e.target.value })
          }
        />
      </FormField>

      <KeyValueEditor
        label="Custom Fields (Optional)"
        pairs={data.customFields || []}
        onChange={(customFields) => update({ customFields })}
      />
    </div>
  );
}
