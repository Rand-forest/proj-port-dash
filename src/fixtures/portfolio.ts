import type { PortfolioData } from '../types/portfolio'

const createdAt = '2026-01-05T09:00:00.000Z'
const updatedAt = '2026-02-20T10:30:00.000Z'
const userId = '90000000-0000-4000-8000-000000000001'

/** Fictional, sanitized records for future UI and API contract tests. */
export const portfolioFixture = {
  projects: [
    {
      id: '10000000-0000-4000-8000-000000000001', legacyId: 'p-example-001', name: 'Regional Network Renewal',
      sponsor: 'Example Sponsor', manager: 'Alex Example', techLead: 'Taylor Example', teamMembers: 'Delivery Team Alpha',
      objective: 'Renew network equipment before support ends.', scope: 'Planning, replacement, testing, and handover.',
      budgetAmount: '495000.00', actualSpendAmount: '369000.00', currencyCode: 'SGD', overallStatus: 'On Track',
      department: 'Infra & Ops', projectType: 'Key Project', sortOrder: 0, createdAt, updatedAt,
    },
    {
      id: '10000000-0000-4000-8000-000000000002', legacyId: 'p-example-002', name: 'Quarterly Access Review',
      sponsor: 'Example Sponsor', manager: 'Jordan Example', techLead: 'Casey Example', teamMembers: 'Security Operations',
      objective: 'Complete the routine access review.', scope: 'Review active accounts and document outcomes.',
      budgetAmount: '0.00', actualSpendAmount: '0.00', currencyCode: 'USD', overallStatus: 'At Risk',
      department: 'Cyber Security', projectType: 'BAU Project', sortOrder: 1, createdAt, updatedAt,
    },
    {
      id: '10000000-0000-4000-8000-000000000003', legacyId: null, name: 'Workspace Device Pilot',
      sponsor: 'Example Sponsor', manager: 'Morgan Example', techLead: 'Riley Example', teamMembers: 'Pilot Group',
      objective: 'Evaluate a standard device configuration.', scope: 'Small internal pilot only.', budgetAmount: '12000.00',
      actualSpendAmount: '1500.00', currencyCode: 'EUR', overallStatus: 'Not Started', department: 'Digital Workspace',
      projectType: 'Unassigned', sortOrder: 2, createdAt, updatedAt,
    },
    {
      id: '10000000-0000-4000-8000-000000000004', legacyId: null, name: 'Finance Workflow Refresh',
      sponsor: 'Example Sponsor', manager: 'Jamie Example', techLead: 'Avery Example', teamMembers: 'Business Systems Team',
      objective: 'Refresh a completed internal workflow.', scope: 'Configuration and user acceptance testing.', budgetAmount: '30000.00',
      actualSpendAmount: '29800.00', currencyCode: 'SGD', overallStatus: 'Completed', department: 'Corp Systems',
      projectType: 'BAU Project', sortOrder: 3, createdAt, updatedAt,
    },
  ],
  activities: [
    { id: '20000000-0000-4000-8000-000000000001', legacyId: 'a-example-001', projectId: '10000000-0000-4000-8000-000000000001', name: 'Cross-year design', startDate: '2025-12-15', endDate: '2026-01-09', legacyStartYear: 2025, legacyStartMonth: 11.5, legacyDuration: 0.8, status: 'Completed', isMilestone: true, category: 'Planning', level: 0, sortOrder: 0, createdAt, updatedAt },
    { id: '20000000-0000-4000-8000-000000000002', legacyId: 'a-example-002', projectId: '10000000-0000-4000-8000-000000000001', name: 'Exact end boundary', startDate: '2026-01-10', endDate: '2026-03-01', legacyStartYear: 2026, legacyStartMonth: 0.3333333333, legacyDuration: 1.6666666667, status: 'On Track', isMilestone: false, category: 'Execution', level: 1, sortOrder: 1, createdAt, updatedAt },
    { id: '20000000-0000-4000-8000-000000000003', legacyId: 'a-example-003', projectId: '10000000-0000-4000-8000-000000000002', name: 'Exact start boundary', startDate: '2026-02-01', endDate: '2026-02-28', legacyStartYear: 2026, legacyStartMonth: 1, legacyDuration: 1, status: 'At Risk', isMilestone: false, category: 'Monitoring/Testing', level: 2, sortOrder: 0, createdAt, updatedAt },
    { id: '20000000-0000-4000-8000-000000000004', legacyId: 'a-example-004', projectId: '10000000-0000-4000-8000-000000000003', name: 'Same-month pilot', startDate: '2026-04-07', endDate: '2026-04-19', legacyStartYear: 2026, legacyStartMonth: 3.2333333333, legacyDuration: 0.4, status: 'Not Started', isMilestone: false, category: 'Initiation', level: 0, sortOrder: 0, createdAt, updatedAt },
    { id: '20000000-0000-4000-8000-000000000005', legacyId: null, projectId: '10000000-0000-4000-8000-000000000004', name: 'New exact-date activity', startDate: '2026-05-01', endDate: '2026-06-15', legacyStartYear: null, legacyStartMonth: null, legacyDuration: null, status: 'Completed', isMilestone: true, category: 'Closing', level: 0, sortOrder: 0, createdAt, updatedAt },
  ],
  tasks: [
    { id: '30000000-0000-4000-8000-000000000001', legacyId: 't-example-001', projectId: '10000000-0000-4000-8000-000000000001', date: '2026-02-18', name: 'Confirm maintenance window', details: 'Confirm the fictional test window.', status: 'In Progress', createdAt, updatedAt },
    { id: '30000000-0000-4000-8000-000000000002', legacyId: null, projectId: '10000000-0000-4000-8000-000000000002', date: '2026-02-21', name: 'Review exception', details: 'Record the review outcome.', status: 'Blocked', createdAt, updatedAt },
  ],
  raidItems: [
    { id: '40000000-0000-4000-8000-000000000001', legacyId: 'r-example-001', projectId: '10000000-0000-4000-8000-000000000001', type: 'Risk', description: 'Test equipment may arrive late.', owner: 'Delivery Team', status: 'Open', startDate: '2026-01-15', endDate: '2026-03-01', createdAt, updatedAt },
    { id: '40000000-0000-4000-8000-000000000002', legacyId: null, projectId: '10000000-0000-4000-8000-000000000001', type: 'Assumption', description: 'The test window remains available.', owner: 'Operations Team', status: 'Mitigated', startDate: '2026-01-10', endDate: null, createdAt, updatedAt },
    { id: '40000000-0000-4000-8000-000000000003', legacyId: null, projectId: '10000000-0000-4000-8000-000000000002', type: 'Issue', description: 'One sample approval is overdue.', owner: 'Review Team', status: 'Open', startDate: '2026-02-10', endDate: null, createdAt, updatedAt },
    { id: '40000000-0000-4000-8000-000000000004', legacyId: null, projectId: '10000000-0000-4000-8000-000000000003', type: 'Dependency', description: 'Pilot depends on lab availability.', owner: 'Pilot Team', status: 'Closed', startDate: null, endDate: null, createdAt, updatedAt },
  ],
  activityComments: [
    { id: '50000000-0000-4000-8000-000000000001', activityId: '20000000-0000-4000-8000-000000000002', authorUserId: userId, authorEmailSnapshot: 'alex@example.invalid', commentText: 'The sample deployment is ready for review.', createdAt: updatedAt, updatedAt },
  ],
  raidComments: [
    { id: '60000000-0000-4000-8000-000000000001', raidItemId: '40000000-0000-4000-8000-000000000001', authorUserId: userId, authorEmailSnapshot: 'alex@example.invalid', commentText: 'The fictional delivery date is being monitored.', createdAt: updatedAt, updatedAt },
  ],
  auditLogs: [
    { id: '70000000-0000-4000-8000-000000000001', occurredAt: updatedAt, actorUserId: userId, actorEmailSnapshot: 'alex@example.invalid', action: 'UPDATE', entityType: 'activity', entityId: '20000000-0000-4000-8000-000000000002', entityLabel: 'Deployment wave', details: 'Updated schedule fields.' },
  ],
} as const satisfies PortfolioData
