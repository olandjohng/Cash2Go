import React, { useState } from 'react'
import * as yup from 'yup';
import MultiStepForm1, { FormStep } from '../../../components/MultiStepForm1'
import { LoanFormContext, TextInput, loanDetailsSchema, loanRequrementSchema } from './LoanForm1'
import LoanRequirementsForm from './LoanRequirementsForm'
import { grey } from '@mui/material/colors';
import LoanDetailsForm from './LoanDetailsForm';
import DeductionDetailsForm from './DeductionDetailsForm';
import { Box } from '@mui/material';
import SummaryForm from './SummaryForm';

export default function LoanRenewForm({loanInitialValue, banks, collaterals, categories, deductions, facilities, renew = false}) {
  const [formValue, setFormValue] = useState(loanInitialValue)
  const [validationError, setValidationError] = useState(null);
  const [rows, setRows] = useState([])
  const [deductionsData, setDeductionsData] = useState([])
  const handleLoanRequirement = async () => {
    try {
      loanRequrementSchema.validateSync(formValue, 
        {abortEarly : false}
      )
    } catch (err) {
      console.dir(err)
      //TODO: display all error for all input 
      const errors = err.inner
      const error = errors.reduce((acc, cur) => {
        return {
          ...acc,
          [cur.path] : true
        }
      }, {})
      setValidationError(error)
    }
  }
  const handleLoanDetails = async () => {
    try {
      loanDetailsSchema.validateSync(formValue,
        {abortEarly : false}
      )
    } catch (err) {
      const errors = err.inner
      
      const error = errors.reduce((acc, cur) => {
        const path = cur.path
        if(!path.includes('.')){
          return {...acc , [path] : true}
        }
        return {...acc}
      }, {})
      setValidationError(error)
    }
  }
  return (
    <LoanFormContext.Provider value={{formValue, setFormValue, validationError, setValidationError}}>
      <div style={{width: 900, color: grey[600]}} >
      <MultiStepForm1 
        initialFormValues={formValue}
        onSubmit={() => {
          console.log(formValue)
        }}
      >
        <FormStep 
          stepName="Loan Requirements"
          onSubmit={handleLoanRequirement}
          values={formValue}
          schema={loanRequrementSchema}
        >
          <LoanRequirementsForm renew={renew} banks={banks} collaterals={collaterals} categories={categories} facilities={facilities}/>
        </FormStep>
        <FormStep 
          stepName="Loan Details"
          onSubmit={handleLoanDetails}
          values={formValue}
          schema={loanDetailsSchema}
        >
          <LoanDetailsForm banks={banks} rows={rows} setRows={setRows}/>
        </FormStep >
        <FormStep 
          stepName="Adjusting Entry"
          values={formValue}
          onSubmit={() => {
          }}
          schema = {yup.object()}
        > 
        <Box display='flex' gap={1.5}>
          <Box flex={1} display='flex' gap={1.5} flexDirection='column'>
            <TextInput label='Outstanding Principal'value={formValue.PrincipalBalance}/>
            <TextInput label='Delayed Charges' value={formValue.Penalty}/>
            <TextInput label='Unpaid Interest' value={formValue.InterestBalance}/>
            <TextInput label='Standing Balance' value={Number(formValue.Balance)}/>
          </Box>
          <Box flex={1}>
            <DeductionDetailsForm deductions={deductions} deductionsData={deductionsData} setDeductionsData={setDeductionsData} />
          </Box>
        </Box>
        </FormStep>
        <FormStep stepName='Summary' >
          <SummaryForm />
        </FormStep>
      </MultiStepForm1>
      </div>
    </LoanFormContext.Provider>
  )
}
