import React, { useRef, useState } from 'react';
import {
  Play,
  ClipboardList,
  ShieldCheck,
  Zap,
  Square,
  Download,
  Upload,
  Trash2,
  Undo2,
  Redo2,
  AlignVerticalSpaceAround,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import { useWorkflowStore } from '../../hooks/useWorkflowStore';
import { useToastStore } from '../../hooks/useToastStore';
import { WORKFLOW_TEMPLATES } from '../../utils/templates';
import { autoLayout } from '../../utils/autoLayout';
import type { WorkflowNodeType } from '../../types/workflow';
import styles from './Sidebar.module.css';

interface NodeCardConfig {
  type: WorkflowNodeType;
  label: string;
  description: string;
  icon: React.ReactNode;
  iconClass: string;
}

const NODE_CARDS: NodeCardConfig[] = [
  {
    type: 'startNode',
    label: 'Start Node',
    description: 'Workflow entry point',
    icon: <Play size={15} />,
    iconClass: styles.iconStart,
  },
  {
    type: 'taskNode',
    label: 'Task Node',
    description: 'Human task step',
    icon: <ClipboardList size={15} />,
    iconClass: styles.iconTask,
  },
  {
    type: 'approvalNode',
    label: 'Approval Node',
    description: 'Manager approval step',
    icon: <ShieldCheck size={15} />,
    iconClass: styles.iconApproval,
  },
  {
    type: 'automatedNode',
    label: 'Automated Step',
    description: 'System-triggered action',
    icon: <Zap size={15} />,
    iconClass: styles.iconAutomated,
  },
  {
    type: 'endNode',
    label: 'End Node',
    description: 'Workflow completion',
    icon: <Square size={15} />,
    iconClass: styles.iconEnd,
  },
];

export function Sidebar() {
  const {
    exportWorkflow, importWorkflow, clearCanvas, addNode, loadTemplate,
    nodes, edges, setNodes,
    undo, redo, canUndo, canRedo,
  } = useWorkflowStore();
  const { addToast } = useToastStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [collapsed, setCollapsed] = useState(false);

  const onDragStart = (event: React.DragEvent, nodeType: WorkflowNodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  const handleClickAdd = (type: WorkflowNodeType) => {
    const { nodes } = useWorkflowStore.getState();
    const x = 300 + Math.random() * 50;
    const y = 50 + nodes.length * 120;
    addNode(type, { x, y });
    addToast(`Added ${type.replace('Node', ' node').replace('automated', 'automated step')}`);
  };

  const handleExport = async () => {
    const json = exportWorkflow();
    const blob = new Blob([json], { type: 'application/json' });

    // Use native Save dialog if available (Chrome/Edge)
    if ('showSaveFilePicker' in window) {
      try {
        const handle = await (window as any).showSaveFilePicker({
          suggestedName: 'workflow.json',
          types: [{
            description: 'JSON File',
            accept: { 'application/json': ['.json'] },
          }],
        });
        const writable = await handle.createWritable();
        await writable.write(blob);
        await writable.close();
        addToast('Workflow exported', 'success');
        return;
      } catch (e) {
        if ((e as Error).name === 'AbortError') return; // user cancelled
      }
    }

    // Fallback for Safari / Firefox
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'workflow.json';
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 1000);
    addToast('Workflow exported', 'success');
  };

  const handleImport = () => fileInputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      importWorkflow(ev.target?.result as string);
      addToast('Workflow imported', 'success');
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleAutoLayout = () => {
    if (nodes.length === 0) return;
    const laid = autoLayout(nodes, edges);
    setNodes(laid);
    addToast('Layout organized');
  };

  const handleLoadTemplate = (tpl: typeof WORKFLOW_TEMPLATES[0]) => {
    loadTemplate(tpl.nodes, tpl.edges);
    addToast(`Loaded "${tpl.name}" template`);
  };

  return (
    <aside className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''}`}>
      {/* Collapse Toggle */}
      <button
        className={styles.collapseToggle}
        onClick={() => setCollapsed(!collapsed)}
        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? <PanelLeftOpen size={13} /> : <PanelLeftClose size={13} />}
      </button>

      {/* Node palette */}
      <div className={styles.sidebarTitle}>Nodes</div>
      <div className={styles.nodeCardList}>
        {NODE_CARDS.map((card) => (
          <div
            key={card.type}
            className={styles.nodeCard}
            draggable
            onDragStart={(e) => onDragStart(e, card.type)}
            onClick={() => handleClickAdd(card.type)}
            title={collapsed ? card.label : 'Drag or click to add'}
          >
            <div className={`${styles.cardIcon} ${card.iconClass}`}>{card.icon}</div>
            <div className={styles.cardInfo}>
              <div className={styles.cardName}>{card.label}</div>
              <div className={styles.cardDesc}>{card.description}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Templates */}
      <div className={styles.divider} />
      <div className={styles.sidebarTitle}>Templates</div>
      <div className={styles.templateList}>
        {WORKFLOW_TEMPLATES.map((tpl) => (
          <div
            key={tpl.id}
            className={styles.templateCard}
            onClick={() => handleLoadTemplate(tpl)}
            title={collapsed ? tpl.name : tpl.description}
          >
            <div className={styles.templateIcon}>{tpl.icon}</div>
            <div className={styles.templateInfo}>
              <div className={styles.templateName}>{tpl.name}</div>
              <div className={styles.templateDesc}>{tpl.description}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className={styles.toolbarSection}>
        <div className={styles.toolbarRow}>
          <button
            className={styles.toolbarButton}
            onClick={() => { undo(); addToast('Undo'); }}
            disabled={!canUndo}
            title="Undo (Ctrl+Z)"
          >
            <Undo2 size={14} />
          </button>
          <button
            className={styles.toolbarButton}
            onClick={() => { redo(); addToast('Redo'); }}
            disabled={!canRedo}
            title="Redo (Ctrl+Shift+Z)"
          >
            <Redo2 size={14} />
          </button>
          <button
            className={styles.toolbarButton}
            onClick={handleAutoLayout}
            title="Auto-layout"
          >
            <AlignVerticalSpaceAround size={14} />
          </button>
        </div>
        <button className={styles.toolbarButton} onClick={handleExport}>
          <Download size={14} />{!collapsed && ' Export JSON'}
        </button>
        <button className={styles.toolbarButton} onClick={handleImport}>
          <Upload size={14} />{!collapsed && ' Import JSON'}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
        <button className={`${styles.toolbarButton} ${styles.danger}`} onClick={() => { clearCanvas(); addToast('Canvas cleared'); }}>
          <Trash2 size={14} />{!collapsed && ' Clear Canvas'}
        </button>
      </div>
    </aside>
  );
}
