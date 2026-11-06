export const stageLabels = {
  sales: 'Sales',
  manufacturing: 'Manufacturing',
  estimating: 'Estimating',
  manufacturing2: 'Manufacturing 2',
  sales2: 'Sales 2',
  accounting: 'Accounting',
  webSupport: 'Web Support',
}

export type Stage = keyof typeof stageLabels

export const stages = Object.keys(stageLabels) as Stage[]

// Stages that only fill in their fields instead of approving, with the label for their one button
// and its form
export const submitLabels: Partial<Record<Stage, string>> = {
  estimating: 'Submit Estimate',
  accounting: 'Enter PSI Number',
  webSupport: 'Enter Veracore Number',
}

// Used instead of submitLabels once the stage has submitted; a stage left out has nothing left to
// do then. Accounting's and Web Support's numbers are required, so once they've submitted, the
// number has been entered. Estimating's estimate is redone by sending the record back to its step instead.
export const resubmitLabels: Partial<Record<Stage, string>> = {
  accounting: 'Edit PSI Number',
  webSupport: 'Edit Veracore Number',
}
