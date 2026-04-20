import { useState, useCallback } from 'react';
import { simulateWorkflow } from '../api';
import type { SimulationResult, SimulationStep } from '../types/api';
import type { WorkflowNode, WorkflowEdge } from '../types/workflow';

interface UseSimulationReturn {
  isSimulating: boolean;
  result: SimulationResult | null;
  activeStepIndex: number;
  runSimulation: (nodes: WorkflowNode[], edges: WorkflowEdge[]) => Promise<void>;
  reset: () => void;
}

/**
 * Hook to run workflow simulation with animated step-by-step progress.
 */
export function useSimulation(): UseSimulationReturn {
  const [isSimulating, setIsSimulating] = useState(false);
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [activeStepIndex, setActiveStepIndex] = useState(-1);

  const runSimulation = useCallback(
    async (nodes: WorkflowNode[], edges: WorkflowEdge[]) => {
      setIsSimulating(true);
      setResult(null);
      setActiveStepIndex(-1);

      // Serialize nodes/edges for the API
      const serializedNodes = nodes.map((n) => ({
        id: n.id,
        type: n.type || 'unknown',
        data: n.data as Record<string, unknown>,
      }));

      const serializedEdges = edges.map((e) => ({
        id: e.id,
        source: e.source,
        target: e.target,
      }));

      const simResult = await simulateWorkflow({
        nodes: serializedNodes,
        edges: serializedEdges,
      });

      // Animate steps one at a time
      setResult({
        ...simResult,
        steps: simResult.steps.map((s) => ({ ...s, status: 'pending' as const })),
      });

      for (let i = 0; i < simResult.steps.length; i++) {
        setActiveStepIndex(i);

        // Mark current step as running
        setResult((prev) => {
          if (!prev) return prev;
          const steps: SimulationStep[] = prev.steps.map((s, idx) =>
            idx === i ? { ...s, status: 'running' as const } : s
          );
          return { ...prev, steps };
        });

        // Wait for simulated duration (scaled down for UX)
        await new Promise((r) =>
          setTimeout(r, Math.min(simResult.steps[i].duration * 0.5, 800))
        );

        // Mark step as completed
        setResult((prev) => {
          if (!prev) return prev;
          const steps: SimulationStep[] = prev.steps.map((s, idx) =>
            idx === i ? { ...simResult.steps[i], status: 'completed' as const } : s
          );
          return { ...prev, steps };
        });
      }

      setResult(simResult);
      setIsSimulating(false);
    },
    []
  );

  const reset = useCallback(() => {
    setResult(null);
    setActiveStepIndex(-1);
    setIsSimulating(false);
  }, []);

  return { isSimulating, result, activeStepIndex, runSimulation, reset };
}
