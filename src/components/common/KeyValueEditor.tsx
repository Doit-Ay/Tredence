import React from 'react';
import { Plus, X } from 'lucide-react';
import type { KeyValuePair } from '../../types/workflow';
import { inputStyle } from './FormField';

interface KeyValueEditorProps {
  label: string;
  pairs: KeyValuePair[];
  onChange: (pairs: KeyValuePair[]) => void;
}

/**
 * Reusable key-value pair editor for metadata and custom fields.
 */
export function KeyValueEditor({ label, pairs, onChange }: KeyValueEditorProps) {
  const addPair = () => {
    onChange([...pairs, { key: '', value: '' }]);
  };

  const updatePair = (index: number, field: 'key' | 'value', val: string) => {
    const updated = pairs.map((p, i) =>
      i === index ? { ...p, [field]: val } : p
    );
    onChange(updated);
  };

  const removePair = (index: number) => {
    onChange(pairs.filter((_, i) => i !== index));
  };

  return (
    <div style={{ marginBottom: 16 }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 8,
        }}
      >
        <label
          style={{
            fontSize: 11,
            fontWeight: 500,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            color: 'var(--text-muted)',
          }}
        >
          {label}
        </label>
        <button
          type="button"
          onClick={addPair}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            padding: '4px 10px',
            borderRadius: 8,
            border: '1px solid var(--accent-ring)',
            background: 'var(--accent-soft)',
            color: 'var(--accent)',
            cursor: 'pointer',
            fontSize: 11,
            fontFamily: "'Outfit', sans-serif",
            transition: 'all 0.15s ease',
          }}
        >
          <Plus size={12} /> Add
        </button>
      </div>

      {pairs.map((pair, i) => (
        <div
          key={i}
          style={{
            display: 'flex',
            gap: 6,
            marginBottom: 6,
            alignItems: 'center',
          }}
        >
          <input
            style={{ ...inputStyle, flex: 1 }}
            placeholder="Key"
            value={pair.key}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              updatePair(i, 'key', e.target.value)
            }
          />
          <input
            style={{ ...inputStyle, flex: 1 }}
            placeholder="Value"
            value={pair.value}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              updatePair(i, 'value', e.target.value)
            }
          />
          <button
            type="button"
            onClick={() => removePair(i)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 32,
              height: 32,
              borderRadius: 8,
              border: '1px solid rgba(239, 68, 68, 0.12)',
              background: 'var(--danger-soft)',
              color: 'var(--danger)',
              cursor: 'pointer',
              flexShrink: 0,
              transition: 'all 0.15s ease',
            }}
          >
            <X size={14} />
          </button>
        </div>
      ))}

      {pairs.length === 0 && (
        <div
          style={{
            fontSize: 12,
            color: 'var(--text-muted)',
            fontStyle: 'italic',
            padding: '8px 0',
            fontWeight: 300,
          }}
        >
          No fields added yet
        </div>
      )}
    </div>
  );
}
