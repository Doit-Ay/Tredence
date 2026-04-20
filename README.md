# HR Workflow Designer

> **🔗 Live Demo:** [https://doit-ay.github.io/Tredence/](https://doit-ay.github.io/Tredence/)

A React + TypeScript prototype for visually designing HR workflows. Built for the Tredence full-stack engineering case study. Features a **Studio Glass** design system with dark/light mode, frosted-glass surfaces, and the Outfit typeface.

Users can drag workflow nodes onto a canvas, connect them with edges, configure each node through type-specific forms, and run a simulated execution to validate the workflow structure.

## Setup

```bash
npm install
npm run dev
```

Opens at `http://localhost:5173`. Requires Node 18+.

## What's implemented

**Canvas** — React Flow-based drag-and-drop canvas with five node types: Start, Task, Approval, Automated Step, and End. Nodes can be added by dragging from the sidebar or clicking. Edges connect via handle drag. Delete with Backspace/Delete key or the panel button.

**Node forms** — Selecting a node opens a config panel on the right. Each node type has its own form:

- Start: title, key-value metadata pairs
- Task: title, description, assignee, due date, custom fields (key-value)
- Approval: title, approver role dropdown, auto-approve threshold
- Automated: title, action picker (fetched from mock API), dynamic parameter fields
- End: end message, summary toggle

The Automated form is data-driven - when you pick an action like "Send Email", the form renders `to` and `subject` fields based on what the `/automations` endpoint returns. Switching to "Generate Document" swaps in `template` and `recipient` fields.

**Validation** — Runs on every node/edge change, not just at simulation time. Checks for: missing start node, missing end node, duplicate starts, orphan nodes (no connections), and graph cycles. Warning badges appear directly on affected nodes.

**Simulation** — Serializes the workflow graph, runs a BFS traversal from start to end, and shows a step-by-step execution log in a modal. Each step has a title, description, and simulated duration.

**Mock API** — Two endpoints as local async functions with fake delays:
- `GET /automations` — returns 6 actions with their parameter definitions
- `POST /simulate` — accepts serialized graph, returns execution steps

**Extras** — JSON export/import, three pre-built templates (onboarding, leave approval, document verification), minimap, zoom controls, undo/redo with 30-step history, dagre-based auto-layout, keyboard shortcuts (Ctrl+Z/Ctrl+Shift+Z/Ctrl+S/Delete), and toast notifications for action feedback.

## Project structure

```
src/
├── api/            mock endpoints (automations, simulate)
├── components/
│   ├── Canvas/     React Flow wrapper + validation overlay
│   ├── Sidebar/    node palette, templates, toolbar
│   ├── NodePanel/  config panel + per-type forms
│   ├── SimulationPanel/  simulation modal
│   └── common/     FormField, KeyValueEditor
├── hooks/
│   ├── useWorkflowStore.ts   zustand store + undo/redo
│   ├── useToastStore.ts       toast notifications
│   ├── useValidation.ts      live constraint checking
│   └── useSimulation.ts      simulation runner
├── nodes/          custom React Flow node components
├── types/          TypeScript interfaces
└── utils/          templates, auto-layout (dagre)
```

## Key decisions

**Zustand over Context** — I needed components across the tree to read/write node state without prop drilling. Context would work but causes unnecessary re-renders since every consumer re-renders on any state change. Zustand's selector pattern avoids this. It also lets me call `useWorkflowStore.getState()` from keyboard event handlers which aren't inside React's render cycle.

**CSS Modules** — Tailwind would be faster for prototyping but I wanted scoped styles without worrying about class conflicts. The nodes have specific visual treatments (colored side bars, themed icon backgrounds) that are easier to express in regular CSS than utility classes.

**Validation at edit-time** — The spec says "auto-validate basic constraints" under canvas actions, which I read as real-time feedback rather than only checking when the user hits simulate. The `useValidation` hook runs on every state change and injects errors into node data so the node components can render warning badges.

**Dynamic form params** — Instead of hardcoding fields per action type, `AutomatedForm` fetches the action list on mount and renders inputs based on each action's `params` array. This means adding a new action to the mock API automatically generates the right form fields — no component changes needed.

**In-memory mocks** — Simpler than spinning up JSON Server or MSW for a prototype. The mock functions return Promises with `setTimeout` delays to behave like real async calls. Types are shared between mock and consumer code.

## What I'd add with more time

- Conditional branching on edges
- Proper E2E tests with Playwright
- Persistent storage (localStorage or a real backend)
- Custom edge labels
- Collaborative editing via WebSocket

## Stack

React 18, TypeScript, Vite, @xyflow/react, Zustand, dagre, Lucide icons, CSS Modules
