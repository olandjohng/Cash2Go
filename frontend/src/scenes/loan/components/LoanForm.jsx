import { Formik } from "formik";
import * as yup from 'yup';
import MultiStepForm, { FormStep } from "../../../components/MultiStepForm";
import { Grid } from "@mui/material";
import InputField from '../../../components/FormUI/Textfield'
import AutoCompleteField from '../../../components/FormUI/Autocomplete'

const LOAN_INITIAL_VALUES = {
    customer_id: '',
    customername: '',
    transaction_date: new Date().toISOString().split('T')[0],
    bank_account_id: '',
    bank_name: '',
    collateral_id: '',
    collateral: '',
    loan_category_id: '',
    loancategory: '',
    loan_facility_id: '',
    loanfacility: '',
    principal_amount: 0,
    interest_rate: 0,
    total_interest: 0,
    term_month: 0,
    date_granted: new Date().toISOString().split('T')[0],
    check_issued_name: '',
    voucher_number: '',
    renewal_id: 0,
    renewal_amount: 0,
    details: {
      check_date: new Date().toISOString().split('T')[0],
      check_number: '',
      detail_bank_account_id: '',
      detail_bank_account_name: '',
      monthly_principal: 0,
      monthly_interest: 0,
      monthly_amortization: 0,
    },
    deduction: {
      loan_deduction_id: '',
      deduction_amount: '',
    },
}

function LoanForm() {

  const options = [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
    // ... more options
  ];
  const BankOptions = [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
    // ... more options
  ];
  const collateralOptions = [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
    // ... more options
  ];
  const categoryOptions = [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
    // ... more options
  ];
  const facilityOptions = [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
    // ... more options
  ];

  return (
    <div style={{width: 900}}>
      <MultiStepForm
      initialValues={LOAN_INITIAL_VALUES}
      onSubmit={(values) => {
        alert(JSON.stringify(values, null, 2))
      }}
    >
      <FormStep
        stepName="Loan Requirements"
        onSubmit={() => console.log('Step One')}
      >
        <Grid container spacing={2} >
          <Grid item xs={4}>
            <InputField variant="standard" name="voucher_number" label="Voucher" />
          </Grid>
          <Grid item xs={8}>
            <AutoCompleteField variant="standard" options={options} name="customername" label="Borrower" />
          </Grid>
          <Grid item xs={5}>
            <AutoCompleteField variant="standard" options={BankOptions} name="bank_name" label="Bank" />
          </Grid>
          <Grid item xs={7}>
            <InputField variant="standard" name="check_issued_name" label="Issued Name" />
          </Grid>
          <Grid item xs={12}>
            <AutoCompleteField variant="standard" options={collateralOptions} name="collateral" label="Collateral" />
          </Grid>
          <Grid item xs={12}>
            <AutoCompleteField variant="standard" options={categoryOptions} name="loancategory" label="Category" />
          </Grid>
          <Grid item xs={12}>
            <AutoCompleteField variant="standard" options={facilityOptions} name="loanfacility" label="Facility" />
          </Grid>
        </Grid>
      </FormStep>
      <FormStep
        stepName="Loan Details"
        onSubmit={() => console.log('Step two')}
      >
        <Grid container spacing={2} >
          <Grid item xs={4}>
            <InputField variant="standard" name="voucher_number" label="Voucher" />
          </Grid>
          <Grid item xs={8}>
            <AutoCompleteField variant="standard" options={options} name="customername" label="Borrower" />
          </Grid>
          <Grid item xs={5}>
            <AutoCompleteField variant="standard" options={BankOptions} name="bank_name" label="Bank" />
          </Grid>
          <Grid item xs={7}>
            <InputField variant="standard" name="check_issued_name" label="Issued Name" />
          </Grid>
          <Grid item xs={12}>
            <AutoCompleteField variant="standard" options={collateralOptions} name="collateral" label="Collateral" />
          </Grid>
          <Grid item xs={12}>
            <AutoCompleteField variant="standard" options={categoryOptions} name="loancategory" label="Category" />
          </Grid>
          <Grid item xs={12}>
            <AutoCompleteField variant="standard" options={facilityOptions} name="loanfacility" label="Facility" />
          </Grid>
        </Grid>
      </FormStep>
    </MultiStepForm>
    </div>
  )
}

export default LoanForm