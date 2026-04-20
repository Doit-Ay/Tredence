import type { AutomationAction } from '../types/api';

/**
 * Mock automated actions available for the Automated Step nodes.
 * Each action defines its own dynamic parameter list.
 */
const MOCK_AUTOMATIONS: AutomationAction[] = [
  {
    id: 'send_email',
    label: 'Send Email',
    params: ['to', 'subject'],
  },
  {
    id: 'generate_doc',
    label: 'Generate Document',
    params: ['template', 'recipient'],
  },
  {
    id: 'send_slack',
    label: 'Send Slack Notification',
    params: ['channel', 'message'],
  },
  {
    id: 'update_hris',
    label: 'Update HRIS Record',
    params: ['employeeId', 'field', 'value'],
  },
  {
    id: 'generate_badge',
    label: 'Generate ID Badge',
    params: ['employeeName', 'department', 'photoUrl'],
  },
  {
    id: 'schedule_meeting',
    label: 'Schedule Orientation Meeting',
    params: ['organizer', 'attendees', 'date'],
  },
];

/**
 * GET /automations — returns available automated actions.
 * Simulates network latency with a 300ms delay.
 */
export async function fetchAutomations(): Promise<AutomationAction[]> {
  await new Promise((r) => setTimeout(r, 300));
  return [...MOCK_AUTOMATIONS];
}
