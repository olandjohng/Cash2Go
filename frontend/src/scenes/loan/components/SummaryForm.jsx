import React, { useContext } from 'react'
import { LoanFormContext, PreviewLabel, numberFormat } from './LoanForm1'
import { Box } from '@mui/system'
import { Grid } from '@mui/material'
import LoanTablePreview from './LoanTablePreview'
import LoanDeductionPreview from './LoanDeductionPreview'
import dayjs from 'dayjs'

export default function SummaryForm() {
  const {formValue, setFormValue, validationError, setValidationError} = useContext(LoanFormContext)

  return (
    <>
      <Box
        display='flex'
        justifyContent='center'
        gap={5}
        mt={5}
        mx='auto'
        width='70%'
      >
        <PreviewLabel
          label="Borrower's Name"
          value={formValue.customer_name}
        />
        <PreviewLabel
          label="Check Issued Name"
          value={formValue.check_issued_name}
        />
      </Box>
      <Box 
        display='flex'
        justifyContent='center'
        gap={5}
        mt={3}
      >
        <PreviewLabel label='Bank Name' value={formValue.bank_name}/>
        <PreviewLabel label='Check Number' value={formValue.check_number} />
        <PreviewLabel label='Check Date' value={dayjs(formValue.check_date).format('MM-DD-YYYY')}/>
      </Box>
      <Box 
        display='flex'
        justifyContent='center'
        gap={5}
        mt={3}
      >
        <PreviewLabel
          label='Loan Category'
          value={formValue.loan_category}
        />
        <PreviewLabel
          label='Loan Facility'
          value={formValue.loan_facility}
        />
        <PreviewLabel
          label='Loan Collateral'
          value={formValue.collateral}
        />
      </Box>
      <Box 
        display='flex'
        justifyContent='center'
        gap={5}
        mt={3}
      >
        <PreviewLabel
          label='Principal Amount'
          value={numberFormat.format(formValue.principal_amount)}
        />
        <PreviewLabel
          label='Interest Rate'
          value={`${Number(formValue.interest_rate).toFixed(2)}%`}
        />
        
      </Box>
      <Box mt={3}>
        <Grid container gap={1}>
          <Grid item xs={9}>
            <LoanTablePreview
              details={formValue.loan_details}
            />
          </Grid>
          <Grid item flex={1}>
            <LoanDeductionPreview details={formValue.deduction}/>
          </Grid>
        </Grid>
      </Box>
    </>
  )
}
