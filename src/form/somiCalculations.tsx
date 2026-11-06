import type { ReactNode } from 'react'
import type { DefaultValues } from 'react-hook-form'
import { approvedIndex } from './quantityEstimated'
import type { SomiRequest } from './somiRequest'
import type { SomiFormValues } from './types'

// Per skid, per month
const storageRatePerSkid = 21
const markUp = 1.61
const monthlyInterestRate = 0.125 / 12

// empty: the amount couldn't be worked out, so value is just the dash
export type Calculation = { label: string; value: ReactNode; empty: boolean }

// NaN for anything missing. NaN carries through the arithmetic, and dividing by zero gives
// Infinity, so either way the result shows as a dash.
function toNumber(value: number | null | undefined) {
  return value ?? NaN
}

// Formats the number with the given options, then appends the suffix, if any, as superscript,
// e.g. format(0.0104, percent, '/mo.') -> 1.042%<sup>/mo.</sup>
function format(amount: number, options: Intl.NumberFormatOptions, suffix?: string): ReactNode {
  const formatted = Number.isFinite(amount) ? amount.toLocaleString('en-US', options) : '-' //empty string for no value
  return suffix ? (
    <>
      {formatted}
      <sup>{suffix}</sup>
    </>
  ) : (
    formatted
  )
}

function calculation(
  label: string,
  amount: number,
  options: Intl.NumberFormatOptions,
  suffix?: string,
): Calculation {
  return { label, value: format(amount, options, suffix), empty: !Number.isFinite(amount) }
}

const number: Intl.NumberFormatOptions = { maximumFractionDigits: 2 }
const currency: Intl.NumberFormatOptions = { style: 'currency', currency: 'USD' }
const percent: Intl.NumberFormatOptions = { style: 'percent', maximumFractionDigits: 3 }

// What the worksheet is worked out from; NaN for anything missing
type WorksheetInputs = {
  // The quantity and manufacturing cost for the months approved
  quantity: number
  totalCost: number
  consumption: number
  skids: number
}

// The SOMI cost worksheet, worked out from the record as stored
export function somiCalculations(request: SomiRequest): Calculation[] {
  const {
    monthlyQuantityOnHand,
    valueAtCost,
    monthsOfInventory,
    storageCharge,
    unitCost,
    markedUp,
    monthlyStoragePerUnit,
    monthlyCostToCarry,
    monthlyUnitCostToCarry,
    sellPrice,
  } = worksheet({
    quantity: toNumber(request.approved_qty_estimated),
    totalCost: toNumber(request.approved_manufacturing_cost),
    consumption: toNumber(request.consumption_per_mo),
    skids: toNumber(request.skids_to_inventory_item),
  })

  return [
    calculation('Est Qty on Hand /mo.', monthlyQuantityOnHand, number),
    calculation('Est Value of SOMI @ DM', valueAtCost, currency),
    calculation('Mos. of Est Inventory', monthsOfInventory, number),
    calculation('Storage Charge', storageCharge, currency),
    calculation('Unit DM Cost from Est', unitCost, currency),
    calculation(`Mark-Up at ${markUp}`, markedUp, currency),
    calculation('Unit Storage /mo.', monthlyStoragePerUnit, currency),
    calculation('Interest Rate /mo.', monthlyInterestRate, percent),
    calculation('Cost to Carry /mo.', monthlyCostToCarry, currency),
    calculation('Unit Cost to Carry /mo.', monthlyUnitCostToCarry, currency),
    calculation('Sell Price', sellPrice, currency),
  ]
}

// The sell price worked out from the form's values, formatted as currency; a dash when it can't be
export function formSellPrice(values: DefaultValues<SomiFormValues>) {
  const approved = values.quantityEstimated?.[approvedIndex(values.approvedMonths)]
  const { sellPrice } = worksheet({
    quantity: toNumber(approved?.quantity),
    totalCost: toNumber(approved?.manufacturingCost),
    consumption: toNumber(values.monthlyConsumption),
    skids: toNumber(values.skidsRequired),
  })
  return format(sellPrice, currency)
}

function worksheet({ quantity, totalCost, consumption, skids }: WorksheetInputs) {
  const monthlyQuantityOnHand = quantity - consumption
  const unitCost = totalCost / quantity
  const valueAtCost = monthlyQuantityOnHand * unitCost
  const monthsOfInventory = quantity / consumption
  const storageCharge = skids * storageRatePerSkid * monthsOfInventory
  const markedUp = unitCost * markUp
  const monthlyStoragePerUnit = storageCharge / consumption
  const monthlyCostToCarry = valueAtCost * monthlyInterestRate
  const monthlyUnitCostToCarry = monthlyCostToCarry / monthlyQuantityOnHand
  const sellPrice = markedUp + monthlyStoragePerUnit + monthlyUnitCostToCarry

  return {
    monthlyQuantityOnHand,
    valueAtCost,
    monthsOfInventory,
    storageCharge,
    unitCost,
    markedUp,
    monthlyStoragePerUnit,
    monthlyCostToCarry,
    monthlyUnitCostToCarry,
    sellPrice,
  }
}
