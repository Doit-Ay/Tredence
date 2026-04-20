import { useState, useCallback, useEffect } from 'react';
import { ReactFlowProvider } from '@xyflow/react';
import { Workflow, CheckCircle, AlertCircle, Circle, Sun, Moon } from 'lucide-react';

import { Sidebar } from './components/Sidebar/Sidebar';
import { Canvas } from './components/Canvas/Canvas';
import { NodePanel } from './components/NodePanel/NodePanel';
import { SimulationPanel } from './components/SimulationPanel/SimulationPanel';
import { Toaster } from './components/Toaster/Toaster';
import { useWorkflowStore } from './hooks/useWorkflowStore';
import { useToastStore } from './hooks/useToastStore';
import { useValidation } from './hooks/useValidation';
import { useThemeStore } from './hooks/useThemeStore';

import styles from './App.module.css';

function AppContent() {
  const { nodes, edges, undo, redo, deleteSelectedNode, exportWorkflow, selectedNodeId } = useWorkflowStore();
  const { addToast } = useToastStore();
  const { validationErrors } = useValidation(nodes, edges);
  const [showPanel, setShowPanel] = useState(false);

  const handleNodeSelect = useCallback((nodeId: string | null) => {
    setShowPanel(nodeId !== null);
  }, []);

  const handlePanelClose = useCallback(() => {
    setShowPanel(false);
    useWorkflowStore.getState().setSelectedNodeId(null);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT';

      // Delete selected node
      if ((e.key === 'Delete' || e.key === 'Backspace') && !isInput && selectedNodeId) {
        e.preventDefault();
        deleteSelectedNode();
        setShowPanel(false);
        addToast('Node deleted');
      }

      // Ctrl+Z = undo
      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      }

      // Ctrl+Shift+Z = redo
      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && e.shiftKey) {
        e.preventDefault();
        redo();
      }

      // Ctrl+S = export
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        const json = exportWorkflow();
        const blob = new Blob([json], { type: 'application/json' });

        (async () => {
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
              addToast('Workflow saved', 'success');
              return;
            } catch (err) {
              if ((err as Error).name === 'AbortError') return;
            }
          }

          // Fallback
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
          addToast('Workflow saved', 'success');
        })();
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [undo, redo, deleteSelectedNode, selectedNodeId, exportWorkflow, addToast]);

  const errorCount = validationErrors.filter(e => e.severity === 'error').length;
  const warningCount = validationErrors.filter(e => e.severity === 'warning').length;

  return (
    <div className={styles.app}>
      <Sidebar />

      <div className={styles.canvasArea}>
        <header className={styles.header}>
          <div className={styles.logo}>
            <div className={styles.logoIcon}>
              <Workflow size={14} />
            </div>
            <span className={styles.logoText}>Workflow Designer</span>
            <span className={styles.logoSub}>/ Tredence HR</span>
          </div>

          <div className={styles.headerRight}>
            <button
              className={styles.themeToggle}
              onClick={useThemeStore.getState().toggleTheme}
              title={useThemeStore.getState().theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
            >
              {useThemeStore((s) => s.theme) === 'light' ? <Moon size={15} /> : <Sun size={15} />}
            </button>

            <span className={styles.nodeCount}>
              {nodes.length} nodes · {edges.length} edges
            </span>

            {nodes.length === 0 ? (
              <span className={`${styles.statusChip} ${styles.statusEmpty}`}>
                <Circle size={8} /> Empty
              </span>
            ) : errorCount > 0 ? (
              <span className={`${styles.statusChip} ${styles.statusInvalid}`}>
                <AlertCircle size={11} />
                {errorCount} error{errorCount !== 1 ? 's' : ''}
                {warningCount > 0 && `, ${warningCount} warning${warningCount !== 1 ? 's' : ''}`}
              </span>
            ) : warningCount > 0 ? (
              <span className={`${styles.statusChip} ${styles.statusInvalid}`}
                style={{ background: 'rgba(229,163,61,0.12)', color: 'var(--warning)' }}>
                <AlertCircle size={11} />
                {warningCount} warning{warningCount !== 1 ? 's' : ''}
              </span>
            ) : (
              <span className={`${styles.statusChip} ${styles.statusValid}`}>
                <CheckCircle size={11} /> Valid
              </span>
            )}
          </div>
        </header>

        <Canvas onNodeSelect={handleNodeSelect} />
        <SimulationPanel />
      </div>

      {showPanel && <NodePanel onClose={handlePanelClose} />}
      <Toaster />
    </div>
  );
}

export default function App() {
  return (
    <ReactFlowProvider>
      <AppContent />
    </ReactFlowProvider>
  );
}
