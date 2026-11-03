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
