import { useState } from 'react';
import {
  Play,
  X,
  Check,
  Loader,
  Circle,
  AlertTriangle,
  Clock,
} from 'lucide-react';
import { useWorkflowStore } from '../../hooks/useWorkflowStore';
import { useSimulation } from '../../hooks/useSimulation';
import type { SimulationStepStatus } from '../../types/api';
import styles from './SimulationPanel.module.css';

export function SimulationPanel() {
  const { nodes, edges } = useWorkflowStore();
  const { isSimulating, result, runSimulation, reset } = useSimulation();
  const [showModal, setShowModal] = useState(false);

  const handleSimulate = async () => {
    setShowModal(true);
    await runSimulation(nodes, edges);
  };

  const handleClose = () => {
    setShowModal(false);
    reset();
  };

  const getStepIcon = (status: SimulationStepStatus) => {
    switch (status) {
      case 'pending':
        return <Circle size={14} />;
      case 'running':
        return (
          <Loader
            size={14}
            style={{ animation: 'spin 1s linear infinite' }}
          />
        );
      case 'completed':
        return <Check size={14} />;
      case 'failed':
        return <X size={14} />;
      default:
        return <Circle size={14} />;
    }
  };

  const getDotClass = (status: SimulationStepStatus) => {
    switch (status) {
      case 'pending':
        return styles.dotPending;
      case 'running':
        return styles.dotRunning;
      case 'completed':
        return styles.dotCompleted;
      case 'failed':
        return styles.dotFailed;
      default:
        return styles.dotPending;
    }
  };

  return (
    <>
      {/* Floating simulate button */}
      <div className={styles.simulationBar}>
        <button
          className={styles.simulateButton}
          onClick={handleSimulate}
          disabled={isSimulating || nodes.length === 0}
        >
          <Play size={16} />
          {isSimulating ? 'Simulating...' : 'Simulate Workflow'}
        </button>
      </div>

      {/* Simulation result modal */}
      {showModal && (
        <div className={styles.overlay} onClick={handleClose}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <span className={styles.modalTitle}>
                Workflow Simulation
              </span>
              <button className={styles.modalClose} onClick={handleClose}>
                <X size={16} />
              </button>
            </div>

            <div className={styles.modalBody}>
              {result ? (
                <>
                  {/* Timeline */}
                  <div className={styles.timeline}>
                    {result.steps.map((step, i) => (
                      <div key={i} className={styles.timelineStep}>
                        <div
                          className={`${styles.stepDot} ${getDotClass(step.status)}`}
                        >
                          {getStepIcon(step.status)}
                        </div>
                        <div className={styles.stepContent}>
                          <div className={styles.stepTitle}>{step.title}</div>
                          <div className={styles.stepMessage}>
                            {step.message}
                          </div>
                          {step.status === 'completed' && (
                            <div className={styles.stepDuration}>
                              <Clock
                                size={10}
                                style={{
                                  display: 'inline',
                                  marginRight: 4,
                                  verticalAlign: 'middle',
                                }}
                              />
                              {step.duration}ms
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Summary */}
                  {!isSimulating && (
                    <div className={styles.summary}>
                      <div>
                        <div className={styles.summaryLabel}>Status</div>
                        <div
                          className={`${styles.summaryValue} ${
                            result.success
                              ? styles.summarySuccess
                              : styles.summaryFail
                          }`}
                        >
                          {result.success
                            ? '✓ Simulation Passed'
                            : '✗ Simulation has warnings'}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div className={styles.summaryLabel}>Total Time</div>
                        <div className={styles.summaryValue}>
                          {result.totalDuration}ms
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Errors */}
                  {result.errors.length > 0 && (
                    <div className={styles.errorList}>
                      {result.errors.map((err, i) => (
                        <div key={i} className={styles.errorItem}>
                          <AlertTriangle size={14} />
                          {err}
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 40,
                    color: 'rgba(255,255,255,0.4)',
                    gap: 10,
                  }}
                >
                  <Loader
                    size={20}
                    style={{ animation: 'spin 1s linear infinite' }}
                  />
                  Preparing simulation...
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
