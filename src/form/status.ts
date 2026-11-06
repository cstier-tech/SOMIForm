import type { BadgeProps } from 'oa'
import type { Stage } from './stages'

// Who made a change and when, for the text shown on a workflow step: by is the stage's label, and
// at is the date and time formatted for display
export type Signoff = { by: string; at: string }

export type WorkflowEntry = {
  // The stage that moves the record to this status
  stage: Stage
  // Saved in approval_status. Renaming one doesn't update records already saved with the old name.
  status: string
  // Shown in the steps list when present; the stages after the last step finish the record off
  // without a step of their own
  step?: {
    label: string
    // Shown inside the step once it's done
    completedText: (signoff: Signoff) => string
  }
}

// Each stage's status, in the order a record moves through them. Edit status names, step labels and
// their text here.
export const workflow = [
  {
    stage: 'sales',
    status: 'Pending Process Approval',
    step: {
      label: 'Submit request',
      completedText: ({ by, at }) => `Submitted by ${by} on ${at}`,
    },
  },
  {
    stage: 'manufacturing',
    status: 'Process Approved',
    step: {
      label: 'Manuacturing to review request',
      completedText: ({ by, at }) => `Approved by ${by} on ${at}`,
    },
  },
  {
    stage: 'estimating',
    status: 'Pending Estimate Approval',
    step: {
      label: 'Enter estimate & details',
      completedText: ({ by, at }) => `Submitted by ${by} on ${at}`,
    },
  },
  {
    stage: 'manufacturing2',
    status: 'Pending TSP Approval',
    step: {
      label: 'Manufacturing to review estimate',
      completedText: ({ by, at }) => `Approved by ${by} on ${at}`,
    },
  },
  {
    stage: 'sales2',
    status: 'Approved Pending PSI Number',
    step: {
      label: 'Sales to review TSP',
      completedText: ({ by, at }) => `Approved by ${by} on ${at}`,
    },
  },
  { stage: 'accounting', status: 'Approved Pending Veracore Number',
    step: {
      label: 'Enter PSI number',
      completedText: ({by, at}) => `Entered by ${by} on ${at}`,
    }
   },
  { stage: 'webSupport', status: 'Approved',
    step: {
      label: 'Enter Veracore number',
      completedText: ({by, at}) => `Entered by ${by} on ${at}`,
    }
   },
] as const satisfies readonly WorkflowEntry[]

// Shown on the step a record was sent back to, until it's done again
export const revertedText = (status: string, { by, at }: Signoff) =>
  `Reverted to ${status} by ${by} on ${at}`

// Statuses that stop a record partway through. Denied can be set by any approving stage, Canceled
// by Sales. text is shown on the step a denied record stopped at, or a canceled one's own item.
export const stopped = {
  denied: {
    status: 'Denied',
    text: ({ by, at }: Signoff) => `Denied by ${by} on ${at}`,
  },
  canceled: {
    status: 'Canceled',
    // A canceled record gets its own item in the steps list, after the last step done
    label: 'Request Canceled',
    text: ({ by, at }: Signoff) => `Canceled by ${by} on ${at}`,
  },
} as const

export type Status =
  | (typeof workflow)[number]['status']
  | (typeof stopped)[keyof typeof stopped]['status']

// The workflow's statuses, in order
export const progressStatuses: readonly Status[] = workflow.map((entry) => entry.status)

// The status a record moves to when each stage approves it. Sales doesn't approve: its status is
// the one a new record starts with.
export const approvedStatus = Object.fromEntries(
  workflow.map((entry) => [entry.stage, entry.status]),
) as Record<Stage, Status>

export const deniedStatus: Status = stopped.denied.status

export const canceledStatus: Status = stopped.canceled.status

// The stage whose step is next for a record at this status; undefined once every step is done, or
// when it's been denied or canceled
export function nextStage(status: string | null): Stage | undefined {
  const index = progressStatuses.indexOf(status as Status)
  return index >= 0 ? workflow[index + 1]?.stage : undefined
}

// The status a record has once every stage is done
export const finalStatus: Status = workflow[workflow.length - 1].status

export function statusVariant(status: Status): BadgeProps['variant'] {
  if (status === finalStatus) return 'success'
  if (status === deniedStatus) return 'danger'
  if (status === canceledStatus) return 'secondary'
  return 'warning'
}
