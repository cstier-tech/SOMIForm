import { useFormContext, useWatch } from 'react-hook-form'
import { FormCheck, FormGroup } from 'oa'
import { formSellPrice } from './somiCalculations'
import type { SomiFormValues } from './types'

// Sales confirms the TSP, with the sell price worked out from the approved estimate in the label
export function ConfirmTspCheckbox() {
  const { register, control } = useFormContext<SomiFormValues>()
  const values = useWatch({ control })

  return (
    <FormGroup>
      <FormCheck
        type="checkbox"
        id="salesApprovesTsp"
        label={`Confirm ${formSellPrice(values)} TSP`}
        {...register('salesApprovesTsp')}
      />
    </FormGroup>
  )
}
