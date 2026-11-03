import type { SomiFormValues } from './types'

// Inputs left blank, or a record's months with no quantity, have cells missing
export type EstimateRow = Partial<SomiFormValues['quantityEstimated'][number]>

export const estimatedMonths = [1, 2, 3]

export function isFilled(cell?: number) {
  return cell !== undefined && !Number.isNaN(cell)
}

// One line per month that has a quantity or cost filled in
export function formatQuantityEstimated(value: unknown) {
  return (value as EstimateRow[])
    .flatMap((row, index) => {
      const cells = []
      if (isFilled(row.quantity)) cells.push(`Quantity ${row.quantity}`)
      if (isFilled(row.manufacturingCost)) cells.push(`Cost ${row.manufacturingCost}`)
      return cells.length ? [`${estimatedMonths[index]} month(s): ${cells.join(', ')}`] : []
    })
    .join('\n')
}
