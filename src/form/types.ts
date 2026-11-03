export type SomiFormValues = {
  // Sales
  date: string
  customer: string
  customerNumber: string
  itemName: string
  monthlyConsumption: number
  soldAtStorefront: boolean
  soldWithKits: boolean
  understandsObsoleteResponsibility: boolean
  signedSomiAgreement: boolean
  reorderPointsEstablished: boolean
  reorderPointQuantity: number
  reorderMonitor: string
  businessJustification: string
  // Manufacturing
  process: string
  outsidePurchase: boolean
  // Estimating
  estimateFile: FileList
  estimator: string
  estimatingSystem: string
  quantityEstimated: { quantity: number; manufacturingCost: number }[]
  totalDirectManufacturingCost: string
  skidsRequired: number
  // Manufacturing 2
  approvedMonths: string
  // Sales 2
  salesApprovesTsp: boolean
  // Accounting
  psiNumber: string
  // Web Support
  veracoreNumber: string
  // Added to the comments column when the form is submitted, rather than kept as values
  approveComment: string
  denyComment: string
}
