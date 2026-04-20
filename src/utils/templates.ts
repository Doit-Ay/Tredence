import type { WorkflowNode, WorkflowEdge } from '../types/workflow';

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
}

export const WORKFLOW_TEMPLATES: WorkflowTemplate[] = [
  {
    id: 'onboarding',
    name: 'Employee Onboarding',
    description: '5-step new hire workflow',
    icon: 'O',
    nodes: [
      {
        id: 'tpl_start',
        type: 'startNode',
        position: { x: 300, y: 0 },
        data: { label: 'Start', title: 'New Hire Onboarding', metadata: [{ key: 'department', value: 'HR' }] },
      },
      {
        id: 'tpl_task1',
        type: 'taskNode',
        position: { x: 300, y: 120 },
        data: { label: 'Task', title: 'Collect Documents', description: 'Collect ID, tax forms, and employment agreements', assignee: 'HR Coordinator', dueDate: '', customFields: [] },
      },
      {
        id: 'tpl_approval1',
        type: 'approvalNode',
        position: { x: 300, y: 240 },
        data: { label: 'Approval', title: 'Manager Approval', approverRole: 'Manager', autoApproveThreshold: 0 },
      },
      {
        id: 'tpl_auto1',
        type: 'automatedNode',
        position: { x: 300, y: 360 },
        data: { label: 'Automated', title: 'Send Welcome Email', actionId: 'send_email', actionParams: { to: 'newhire@company.com', subject: 'Welcome aboard!' } },
      },
      {
        id: 'tpl_end',
        type: 'endNode',
        position: { x: 300, y: 480 },
        data: { label: 'End', title: 'Onboarding Complete', endMessage: 'Employee onboarding completed successfully.', showSummary: true },
      },
    ],
    edges: [
      { id: 'tpl_e1', source: 'tpl_start', target: 'tpl_task1', animated: true, style: { stroke: '#555', strokeWidth: 1.5 } },
      { id: 'tpl_e2', source: 'tpl_task1', target: 'tpl_approval1', animated: true, style: { stroke: '#555', strokeWidth: 1.5 } },
      { id: 'tpl_e3', source: 'tpl_approval1', target: 'tpl_auto1', animated: true, style: { stroke: '#555', strokeWidth: 1.5 } },
      { id: 'tpl_e4', source: 'tpl_auto1', target: 'tpl_end', animated: true, style: { stroke: '#555', strokeWidth: 1.5 } },
    ],
  },
  {
    id: 'leave_approval',
    name: 'Leave Approval',
    description: '3-step leave request flow',
    icon: 'L',
    nodes: [
      {
        id: 'lv_start',
        type: 'startNode',
        position: { x: 300, y: 0 },
        data: { label: 'Start', title: 'Leave Request Submitted', metadata: [] },
      },
      {
        id: 'lv_approval',
        type: 'approvalNode',
        position: { x: 300, y: 120 },
        data: { label: 'Approval', title: 'Manager Review', approverRole: 'Manager', autoApproveThreshold: 0 },
      },
      {
        id: 'lv_auto',
        type: 'automatedNode',
        position: { x: 300, y: 240 },
        data: { label: 'Automated', title: 'Update HRIS', actionId: 'update_hris', actionParams: { employeeId: '', field: 'leaveBalance', value: '' } },
      },
      {
        id: 'lv_end',
        type: 'endNode',
        position: { x: 300, y: 360 },
        data: { label: 'End', title: 'Leave Processed', endMessage: 'Leave request has been processed.', showSummary: true },
      },
    ],
    edges: [
      { id: 'lv_e1', source: 'lv_start', target: 'lv_approval', animated: true, style: { stroke: '#555', strokeWidth: 1.5 } },
      { id: 'lv_e2', source: 'lv_approval', target: 'lv_auto', animated: true, style: { stroke: '#555', strokeWidth: 1.5 } },
      { id: 'lv_e3', source: 'lv_auto', target: 'lv_end', animated: true, style: { stroke: '#555', strokeWidth: 1.5 } },
    ],
  },
  {
    id: 'doc_verification',
    name: 'Document Verification',
    description: '4-step verification pipeline',
    icon: 'D',
    nodes: [
      {
        id: 'dv_start',
        type: 'startNode',
        position: { x: 300, y: 0 },
        data: { label: 'Start', title: 'Documents Received', metadata: [{ key: 'type', value: 'background_check' }] },
      },
      {
        id: 'dv_task',
        type: 'taskNode',
        position: { x: 300, y: 120 },
        data: { label: 'Task', title: 'Review Documents', description: 'Manually verify all submitted documents', assignee: 'Verification Team', dueDate: '', customFields: [{ key: 'priority', value: 'high' }] },
      },
      {
        id: 'dv_approval',
        type: 'approvalNode',
        position: { x: 300, y: 240 },
        data: { label: 'Approval', title: 'HRBP Sign-off', approverRole: 'HRBP', autoApproveThreshold: 0 },
      },
      {
        id: 'dv_auto',
        type: 'automatedNode',
        position: { x: 300, y: 360 },
        data: { label: 'Automated', title: 'Generate Badge', actionId: 'generate_badge', actionParams: { employeeName: '', department: '', photoUrl: '' } },
      },
      {
        id: 'dv_end',
        type: 'endNode',
        position: { x: 300, y: 480 },
        data: { label: 'End', title: 'Verification Complete', endMessage: 'All documents verified and badge generated.', showSummary: true },
      },
    ],
    edges: [
      { id: 'dv_e1', source: 'dv_start', target: 'dv_task', animated: true, style: { stroke: '#555', strokeWidth: 1.5 } },
      { id: 'dv_e2', source: 'dv_task', target: 'dv_approval', animated: true, style: { stroke: '#555', strokeWidth: 1.5 } },
      { id: 'dv_e3', source: 'dv_approval', target: 'dv_auto', animated: true, style: { stroke: '#555', strokeWidth: 1.5 } },
      { id: 'dv_e4', source: 'dv_auto', target: 'dv_end', animated: true, style: { stroke: '#555', strokeWidth: 1.5 } },
    ],
  },
];
