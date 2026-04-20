import React, { useEffect, useState } from 'react';
import type { AutomatedNodeData } from '../../../types/workflow';
import type { AutomationAction } from '../../../types/api';
import { useWorkflowStore } from '../../../hooks/useWorkflowStore';
import { fetchAutomations } from '../../../api';
import { FormField, inputStyle, selectStyle } from '../../common/FormField';
import { Loader } from 'lucide-react';

interface AutomatedFormProps {
  nodeId: string;
  data: AutomatedNodeData;
}

/**
 * Automated Step form.
 * Dynamically renders parameter fields based on the selected action's
 * `params` array from the GET /automations API response.
 * NOT hardcoded — all fields are driven by API data.
 */
export function AutomatedForm({ nodeId, data }: AutomatedFormProps) {
  const updateNodeData = useWorkflowStore((s) => s.updateNodeData);
  const [automations, setAutomations] = useState<AutomationAction[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch available automations from mock API
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchAutomations().then((actions) => {
      if (!cancelled) {
        setAutomations(actions);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const update = (partial: Partial<AutomatedNodeData>) => {
    updateNodeData(nodeId, partial);
  };

  // Find the currently selected action definition
  const selectedAction = automations.find((a) => a.id === data.actionId);

  const handleActionChange = (actionId: string) => {
    // When switching actions, clear the old params and initialize new ones
    const action = automations.find((a) => a.id === actionId);
    const newParams: Record<string, string> = {};
    if (action) {
      for (const param of action.params) {
        newParams[param] = data.actionParams?.[param] || '';
      }
    }
    update({ actionId, actionParams: newParams });
  };

  const handleParamChange = (param: string, value: string) => {
    update({
      actionParams: { ...data.actionParams, [param]: value },
    });
  };

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: 20,
          color: 'var(--text-muted)',
          fontSize: 13,
        }}
      >
        <Loader
          size={16}
          style={{ animation: 'spin 1s linear infinite' }}
        />
        Loading automations...
      </div>
    );
  }

  return (
    <div>
      <FormField label="Step Title" required>
        <input
          style={inputStyle}
          value={data.title}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            update({ title: e.target.value })
          }
          placeholder="e.g., Send Welcome Email"
        />
      </FormField>

      <FormField label="Select Action" required>
        <select
          style={selectStyle}
          value={data.actionId}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
            handleActionChange(e.target.value)
          }
        >
          <option value="">— Choose an action —</option>
          {automations.map((action) => (
            <option key={action.id} value={action.id}>
              {action.label}
            </option>
          ))}
        </select>
      </FormField>

      {/* Dynamic parameter fields rendered from API data */}
      {selectedAction && selectedAction.params.length > 0 && (
        <div
          style={{
            padding: 12,
            borderRadius: 8,
            background: 'rgba(139, 92, 246, 0.04)',
            border: '1px solid rgba(139, 92, 246, 0.12)',
            marginTop: 4,
          }}
        >
          <div
            style={{
              fontSize: 11,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.8px',
              color: '#8b5cf6',
              marginBottom: 10,
            }}
          >
            Action Parameters
          </div>

          {selectedAction.params.map((param) => (
            <FormField
              key={param}
              label={param.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase())}
            >
              <input
                style={inputStyle}
                value={data.actionParams?.[param] || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleParamChange(param, e.target.value)
                }
                placeholder={`Enter ${param}...`}
              />
            </FormField>
          ))}
        </div>
      )}
    </div>
  );
}
