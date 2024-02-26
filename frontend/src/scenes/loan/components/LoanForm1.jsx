
import * as yup from 'yup';
import {AddOutlined, RemoveCircleOutline} from "@mui/icons-material"
import MultiStepForm, { FormStep } from "../../../components/MultiStepForm";
import { Autocomplete, Grid, TextField, Button, InputAdornment, IconButton } from "@mui/material";
import LoanDetailsTable from './LoanDetailsTable';
import { useEffect, useRef, useState } from 'react';
import MultiStepForm1 from '../../../components/MultiStepForm1';

const LOAN_INITIAL_VALUES = {
    customer_id: '',
    customer_name: '',
    transaction_date: new Date().toISOString().split('T')[0],
    bank_account_id: '',
    bank_name: '',
    collateral_id: '',
    collateral: '',
    loan_category_id: '',
    loan_category: '',
    loan_facility_id: '',
    loan_facility: '',
    principal_amount: 0,
    interest_rate: 0,
    total_interest: 0,
    term_month: 0,
    date_granted: new Date().toISOString().split('T')[0],
    check_issued_name: '',
    voucher_number: '',
    renewal_id: 0,
    renewal_amount: 0,
    loan_details : [],
    deduction : []
    // details: {
    //   check_date: new Date().toISOString().split('T')[0],
    //   check_number: '',
    //   detail_bank_account_id: '',
    //   detail_bank_account_name: '',
    //   monthly_principal: 0,
    //   monthly_interest: 0,
    //   monthly_amortization: 0,
    // },
    // deduction: {
    //   loan_deduction_id: '',
    //   deduction_amount: '',
    // },
}

const loanRequrementSchema = yup.object({
  voucher_number : yup.string().required('voucher_number is required'),
  customer_name : yup.string().required(),
  bank_name : yup.string().required(),
  check_issued_name : yup.string().required(),
  collateral : yup.string().required(),
  loan_category : yup.string().required(),
  loan_facility : yup.string().required('loan facilities is required'),
})

const loanDetailsSchema = yup.object({
  principal_amount : yup.number().required().moreThan(0),
  interest_rate : yup.number().required().moreThan(0),
  loan_details : yup.array(
    yup.object({
      principal : yup.number().positive().moreThan(0),
      interest : yup.number().positive().moreThan(0),
      amortization : yup.number().positive().moreThan(0)
    })
  )
})

const deductionSchema = yup.object({
  deduction : yup.array(
    yup.object({
      amount : yup.number().positive().moreThan(0)
    })
  )
})

const banks = [{

}]
const initrows = []

function ComboBox ({inputChange, options, name , err, label, val}){
  const comboRef = useRef()
  return (
    <Autocomplete
    ref={comboRef}
    value={val}
    onInputChange={(e, v) => inputChange(comboRef.current.getAttribute('name'), v)} 
    variant="standard" 
    options={options}
    name={name} 
    label="Borrower" 
    renderInput={(params) => <TextField {...params} 
    error={err && err.path === name ? true : false } 
    label={label} />}
    />
  )
}

function LoanForm1() {
  const [formValue, setFormvValue] = useState(LOAN_INITIAL_VALUES);
  const [rows, setRows] = useState(initrows);
  const [validationError,setValidationError] = useState(null);
  const [deductions, setDeductions] = useState([]);
  const [deductionItem, setDeductionItem] = useState(null); 
  // const [selectedItem, setSelectedItem ] = useState('')


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

  const handleLoanRequirement = async () => {
    try {
      loanRequrementSchema.validateSync(formValue, 
        // {abortEarly : false}
      )
    } catch (error) {
      // console.dir(error)
      //TODO: display all error for all input 
      setValidationError(error)
    }
  }

  useEffect(() => {
    setFormvValue({...formValue, loan_details : [...rows]})
    console.log('useEffect rows')
  },[rows])

  useEffect(()=>{
    console.log('useEffect fetch')
  },[])

  const handleLoanDetails = async () => {
    try {
      const cast = loanDetailsSchema.cast({
        principal_amount : Number(formValue.principal_amount),
        interest_rate : Number(formValue.interest_rate),
        loan_details : rows.map((v) => {
          return {
            principal : Number(v.principal),
            interest : Number(v.interest),
            amortization : Number(v.amortization),
          }
        })
      })
      
      const details = loanDetailsSchema.validateSync({...formValue, ...cast},
        // {abortEarly : false}
      )
      
    } catch (error) {
      console.dir(error)
      setValidationError(error)
    }
  }

  const handleComboBox = (name, v) => {
    setValidationError(null)
    setFormvValue({...formValue , [name] : v})
  }
  
  const handleTextField = (e) => {
    setValidationError(null)
    setFormvValue({...formValue , [e.target.name] : e.target.value})
  }

  return (
    <div style={{width: 900}}>
      <MultiStepForm1
      initialFormValues={formValue}
      onSubmit={() => console.log(formValue)}
    >
      <FormStep
        stepName="Loan Requirements"
        onSubmit={handleLoanRequirement}
        values={formValue}
        schema={loanRequrementSchema}
      >
        <Grid container spacing={2} >
          <Grid item xs={4}>
            <TextField fullWidth variant="outlined"
              label="Voucher"
              value={formValue.voucher_number}
              name="voucher_number" 
              onChange={(e) => handleTextField(e)}
              error={ validationError && validationError.path === 'voucher_number' ? true : false }
            />
          </Grid>
          <Grid item xs={8}>
            <ComboBox 
              label='Borrower'
              val={formValue.customer_name}
              inputChange={handleComboBox} 
              options={options} 
              name="customer_name"
              err={validationError}
            />
            
          </Grid>
          <Grid item xs={5}>
          <ComboBox 
              label='Bank'
              inputChange={handleComboBox} 
              val={formValue.bank_name}
              options={options} 
              name="bank_name"
              err={validationError}
          />
          </Grid>
          <Grid item xs={7}>
            <TextField fullWidth variant="outlined"
              label="Issued Name"
              name="check_issued_name" 
              value={formValue.check_issued_name}
              onChange={(e) => handleTextField(e)}
              error={ validationError && validationError.path === 'check_issued_name' ? true : false }
            />
          </Grid>
          <Grid item xs={12}>
            <ComboBox 
              label='Collateral'
              inputChange={handleComboBox} 
              val={formValue.collateral}
              options={options} 
              name="collateral"
              err={validationError}
          />
          </Grid>
          <Grid item xs={12}>
            <ComboBox 
              label='Category'
              inputChange={handleComboBox} 
              val={formValue.loan_category}
              options={options} 
              name="loan_category"
              err={validationError}
            />
          </Grid>
          <Grid item xs={12}>
            <ComboBox 
              label='Facility'
              inputChange={handleComboBox} 
              val={formValue.loan_facility}
              options={options} 
              name="loan_facility"
              err={validationError}
            />
          </Grid>
        </Grid>
      </FormStep>
      <FormStep
        stepName="Loan Details"
        onSubmit={handleLoanDetails}
        schema={loanDetailsSchema}
      >
        <Grid container spacing={2} >
          <Grid item xs={9}>
            <TextField fullWidth variant="outlined"
              name="principal_amount" 
              label="Principal Amount"
              onChange={(e) => handleTextField(e)}
              error={ validationError && validationError.path === 'principal_amount' ? true : false }
            />
          </Grid>
          <Grid item xs={3}>
            <TextField fullWidth variant="outlined"
              name="interest_rate" 
              label="Interest Rate"
              onChange={(e) => handleTextField(e)}
              error={ validationError && validationError.path === 'interest_rate' ? true : false }
            />

          </Grid>
          <Grid item xs={12}>
            <LoanDetailsTable  banks={banks} rows={rows} setRows={setRows}/>
          </Grid>
        </Grid>
      </FormStep>
      <FormStep
        stepName="Deduction Details"
        schema={deductionSchema}
        onSubmit={() => {
          try {
            deductionSchema.validateSync(formValue, 
              {abortEarly : false}
            )
          } catch (err) {
            const errors = err.inner
            const error = errors.reduce((acc, cur) =>  
            {
              const data =  cur.path.split('.')
              const index = data[0].charAt(data[0].length - 2)
              return {...acc, [deductions[index].name] : true}
            }, 
            {})
            setValidationError(error)
          }
        }}
      >
        <Grid container >
          <Grid item xs={10}>
            <Autocomplete
              options={["Appraisal Fee", "Notarial Fee", "Documentary Stamp", "Service Charge"]}
              value={deductionItem}
              onInputChange={ (e,v) => {
                setDeductionItem(v)
              }}
              renderInput= { (params) => <TextField {...params} />}
            />
          </Grid>
          <Grid item xs={2}>
            <Button
              onClick={() => {
                if(deductionItem){
                  let contains  = false;
                  for (const d of deductions) {
                    if(d.label === deductionItem){ contains = true }
                    
                  }
                  if(!contains){
                    const format = deductionItem.toLowerCase().split(' ').join('_')
                    const d = [...deductions, {label : deductionItem, name : format, amount : ''}]
                    setDeductions(d)
                    setFormvValue({...formValue, deduction : d})
                  }
                }
              }}

              variant="outlined" 
              sx={{ 
                fontSize: "14px",
                fontWeight: "bold",
                width: "90%",
                marginLeft : 'auto', 
                marginRight : 'auto',
                height : '100%',
                mx : 1
                // backgroundColor: colors.blueAccent[700],
                // color: colors.grey[100],
                // padding: "10px 20px",
                // marginTop: 2, margin: 1,
                // borderColor: colors.grey    [400],
                // "&:hover": {borderColor: colors.grey[400],
                //             backgroundColor: colors.grey[700]        
                //     }
               }}
            >
              <AddOutlined sx={{ mr: "2px" }} />
            </Button>
          </Grid>
        </Grid>
        <Grid container gap={1.5} marginTop={1.5}>
          { deductions && deductions.map((d, i) =>(
            <TextField 
            label={d.label} 
            value={d.amount}
            error={validationError && Boolean(validationError[d.name])}
            type='number'
            onChange= {(e) =>{
              setValidationError(null)
              const d = deductions.map((v, index) => {
                return i === index ? {...v, amount : e.target.value} : v
              })
              setDeductions(d)

              setFormvValue({...formValue, deduction : d})
            }}
            InputProps={{
              endAdornment : 
                <InputAdornment position='end'>
                  <IconButton
                    onClick={(e) => {
                      const d = deductions.filter((v, index) => index !== i) 
                      setDeductions(d)
                      setFormvValue({...formValue, deduction : d})
                    }}
                  >
                    <RemoveCircleOutline />
                  </IconButton>
                </InputAdornment>
            }}
            />
          ))}
        </Grid>
      </FormStep>

    </MultiStepForm1>
    </div>  
  )
}

export default LoanForm1