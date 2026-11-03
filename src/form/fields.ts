import type { ComponentType } from 'react'
import type { Path, RegisterOptions } from 'react-hook-form'
import { ApprovedMonthsTable } from './ApprovedMonthsTable'
import { formatQuantityEstimated } from './quantityEstimated'
import { QuantityEstimatedTable } from './QuantityEstimatedTable'
import type { Stage } from './stages'
import type { SomiFormValues } from './types'

export type FieldDef = {
  name: Path<SomiFormValues>
  label: string
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
}

// Each stage's fields, in the order they render
export const stageFields: Record<Stage, FieldDef[]> = {
  sales: [
    { name: 'date', label: 'Date', kind: 'date', rules: { required: 'Date is required' }, cols: 6 },
    {
      name: 'customer',
      label: 'Customer Name',
      rules: { required: 'Customer name is required' },
      cols: 6,
    },
    {
      name: 'customerNumber',
      label: 'Customer Number',
      rules: { required: 'Customer number is required' },
      cols: 6,
    },
    { name: 'itemName', label: 'Item Name', rules: { required: 'Item name is required' }, cols: 6 },
    {
      name: 'monthlyConsumption',
      label: 'Customer Consumption per Month',
      kind: 'number',
      rules: { required: 'Customer consumption per month is required' },
      cols: 12,
    },
    { name: 'soldAtStorefront', label: 'Item Product Sold at Storefront', kind: 'yesNo' },
    { name: 'soldWithKits', label: 'Item Product Sold with Kits', kind: 'yesNo' },
    {
      name: 'understandsObsoleteResponsibility',
      label: 'Customer Understands Responsible for Obsolete or Slow Moving Inventory',
      kind: 'yesNo',
    },
    { name: 'signedSomiAgreement', label: 'Customer Signed SOMI Agreement', kind: 'yesNo' },
    { name: 'reorderPointsEstablished', label: 'Are Reorder Points Established', kind: 'yesNo' },
    { name: 'reorderPointQuantity', label: 'Reorder Point Quantity', kind: 'number', cols: 6 },
    {
      name: 'reorderMonitor',
      label: 'Who Monitors Reorders',
      rules: { required: 'Who monitors reorders is required' },
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
      kind: 'radio',
      options: ['Litho', 'Digital', 'EB'],
    },
    { name: 'outsidePurchase', label: 'Outside Purchase', kind: 'yesNo' },
  ],
  estimating: [
    { name: 'estimateFile', label: 'Estimate', kind: 'file' },
    // TODO: fill in estimator names
    { name: 'estimator', label: 'Estimator', kind: 'radio', options: [] },
    {
      name: 'estimatingSystem',
      label: 'Estimating System',
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
      name: 'totalDirectManufacturingCost',
      label: 'Total Direct Manufacturing Costs from Estimate',
    },
    { name: 'skidsRequired', label: 'Number of Skids Required to Inventory Item', kind: 'number' },
  ],
  manufacturing2: [
    {
      name: 'approvedMonths',
      label: 'Approved Months of Inventory',
      component: ApprovedMonthsTable,
    },
  ],
  sales2: [{ name: 'salesApprovesTsp', label: 'Sales Approves TSP', kind: 'yesNo' }],
  accounting: [{ name: 'psiNumber', label: 'PSI Number' }],
  webSupport: [{ name: 'veracoreNumber', label: 'Veracore Number' }],
}

// These two follow the Approve or Deny choice instead of a stage. They're separate fields so a
// comment started for one choice can't be submitted under the other.
export const approveCommentField: FieldDef = {
  name: 'approveComment',
  label: 'Comments',
  kind: 'textarea',
}

export const denyCommentField: FieldDef = {
  name: 'denyComment',
  label: 'Comments',
  kind: 'textarea',
  rules: {
    required: 'Comments are required',
    // required alone would accept a comment of only spaces
    pattern: { value: /\S/, message: 'Comments are required' },
  },
}
