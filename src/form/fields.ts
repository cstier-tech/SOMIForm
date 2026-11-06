import type { ComponentType } from 'react'
import type { DefaultValues, Path, RegisterOptions } from 'react-hook-form'
import { ApprovedMonthsTable } from './ApprovedMonthsTable'
import { ConfirmTspCheckbox } from './ConfirmTspCheckbox'
import { formatQuantityEstimated } from './quantityEstimated'
import { QuantityEstimatedTable } from './QuantityEstimatedTable'
import type { Stage } from './stages'
import type { SomiFormValues } from './types'

export type FieldDef = {
  name: Path<SomiFormValues>
  label: string
  // A shorter label for the record view
  shortLabel?: string
  // The input to render; defaults to a text input
  kind?: 'number' | 'date' | 'textarea' | 'yesNo' | 'radio' | 'file'
  // Grid columns out of 12 from the md breakpoint up; defaults to 12 (full width)
  cols?: number
  options?: string[]
  rules?: RegisterOptions<SomiFormValues>
  // Renders in place of an input
  component?: ComponentType
  // For values that aren't a plain string, number, boolean or file list; returns ''
  // when nothing has been filled in
  formatValue?: (value: unknown) => string
  // Shown only when this returns true. A hidden field isn't validated, and it's saved as empty so
  // an answer given before it was hidden doesn't linger.
  showIf?: (values: DefaultValues<SomiFormValues>) => boolean
}

function reorderPointsEstablished(values: DefaultValues<SomiFormValues>) {
  return values.reorderPointsEstablished === true
}

// Every field across all stages, plus the comment field
export function allFields() {
  return [...Object.values(stageFields).flat(), decisionCommentField]
}

// The names of fields hidden for these values
export function hiddenFieldNames(values: DefaultValues<SomiFormValues>) {
  return new Set(
    allFields()
      .filter((def) => def.showIf && !def.showIf(values))
      .map((def) => def.name),
  )
}

// Each stage's fields, in the order they render
export const stageFields: Record<Stage, FieldDef[]> = {
  sales: [
    { name: 'date', label: 'Date', kind: 'date', rules: { required: 'Date is required' }, cols: 6 },
    {
      name: 'customer',
      label: 'Customer Name',
      shortLabel: 'Customer',
      rules: { required: 'Customer name is required' },
      cols: 6,
    },
    {
      name: 'customerNumber',
      label: 'Customer Number',
      shortLabel: 'Customer #',
      rules: { required: 'Customer number is required' },
      cols: 6,
    },
    {
      name: 'itemName',
      label: 'Item Name',
      shortLabel: 'Item',
      rules: { required: 'Item name is required' },
      cols: 6,
    },
    {
      name: 'monthlyConsumption',
      label: 'Customer Consumption per Month',
      shortLabel: 'Consumption /mo.',
      kind: 'number',
      rules: { required: 'Customer consumption per month is required' },
      cols: 12,
    },
    {
      name: 'soldAtStorefront',
      label: 'Item Product Sold at Storefront',
      shortLabel: 'Sold on Storefront',
      kind: 'yesNo',
    },
    {
      name: 'soldWithKits',
      label: 'Item Product Sold with Kits',
      shortLabel: 'Sold w/ Kits',
      kind: 'yesNo',
    },
    {
      name: 'understandsObsoleteResponsibility',
      label: 'Customer Accepts Responsibility for Obsolete or Slow-Moving Inventory',
      kind: 'yesNo',
    },
    {
      name: 'signedSomiAgreement',
      label: 'Customer Signed SOMI Agreement',
      shortLabel: 'SOMI Agreement Signed',
      kind: 'yesNo',
    },
    { name: 'reorderPointsEstablished', label: 'Are Reorder Points Established', kind: 'yesNo' },
    {
      name: 'reorderPointQuantity',
      label: 'Reorder Point Quantity',
      kind: 'number',
      rules: { required: 'Reorder point quantity is required' },
      showIf: reorderPointsEstablished,
      cols: 6,
    },
    {
      name: 'reorderMonitor',
      label: 'Who Monitors Reorders',
      rules: { required: 'Who monitors reorders is required' },
      showIf: reorderPointsEstablished,
      cols: 6,
    },
    {
      name: 'businessJustification',
      label: 'Business Justification',
      kind: 'textarea',
      rules: { required: 'Business justification is required' },
    },
  ],
  manufacturing: [
    {
      name: 'process',
      label: 'Process to Produce Product',
      shortLabel: 'Process',
      kind: 'radio',
      options: ['Litho', 'Digital', 'EB'],
    },
    { name: 'outsidePurchase', label: 'Outside Purchase', kind: 'yesNo' },
  ],
  estimating: [
    { name: 'estimateFile', label: 'Estimate', kind: 'file' },
    { name: 'estimator', label: 'Estimator' },
    {
      name: 'estimatingSystem',
      label: 'Estimating System',
      shortLabel: 'Estimated In',
      kind: 'radio',
      options: ['PSI', 'Filemaker', 'Print IQ'],
    },
    {
      name: 'quantityEstimated',
      label: 'Quantity Estimated',
      component: QuantityEstimatedTable,
      formatValue: formatQuantityEstimated,
    },
    {
      name: 'skidsRequired',
      label: 'Number of Skids Required to Inventory Item',
      shortLabel: '# of Skids Required to Inventory',
      kind: 'number',
    },
  ],
  manufacturing2: [
    {
      name: 'approvedMonths',
      label: 'Approved Months of Inventory',
      component: ApprovedMonthsTable,
    },
  ],
  sales2: [{ name: 'salesApprovesTsp', label: 'Confirm TSP', component: ConfirmTspCheckbox }],
  accounting: [
    { name: 'psiNumber', label: 'PSI Number', rules: { required: 'PSI number is required' } },
  ],
  webSupport: [
    {
      name: 'veracoreNumber',
      label: 'Veracore Number',
      rules: { required: 'Veracore number is required' },
    },
  ],
}

// Saved with the stage's decision rather than kept as a value. Denying requires it, which
// DecisionForm checks itself since approving with the same form doesn't.
export const decisionCommentField: FieldDef = {
  name: 'comment',
  label: 'Comments',
  kind: 'textarea',
}
