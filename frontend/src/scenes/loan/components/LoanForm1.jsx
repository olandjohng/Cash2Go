
import * as yup from 'yup';
import {AddOutlined, CheckCircleOutlineRounded, DeleteOutline, RemoveCircleOutline, } from "@mui/icons-material"
import MultiStepForm, { FormStep } from "../../../components/MultiStepForm";
import { Autocomplete, Grid, TextField, Button, InputAdornment, IconButton, Box, styled, Typography, TableContainer, Paper } from "@mui/material";
import LoanDetailsTable from './LoanDetailsTable';
import { useEffect, useRef, useState } from 'react';
import MultiStepForm1 from '../../../components/MultiStepForm1';
import LoanTablePreview from './LoanTablePreview';
import LoanDeductionPreview from './LoanDeductionPreview';
import LoanVoucherPreview from './LoanVoucherPreview';
// import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';

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
    principal_amount: '',
    interest_rate: '',
    total_interest: 0,
    term_month: 0,
    date_granted: new Date().toISOString().split('T')[0],
    check_issued_name: '',
    voucher_number: '',
    renewal_id: 0,
    renewal_amount: 0,
    loan_details : [],
    deduction : [],
    voucher : [{name : '', credit : '', debit : '' }]
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
      dueDate : yup.date().required(),
      bank : yup.string().required(),
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

const voucherSchema = yup.object({
  voucher : yup.array(
    yup.object({
      name : yup.string().required()
    })
  )
})

const numberFormat = Intl.NumberFormat(undefined,  {minimumFractionDigits: 2, maximumFractionDigits: 2})

function ComboBox (props){
  const {inputChange, options, nameField , err, label} = props
  const comboRef = useRef()
  return (
    <Autocomplete
    {...props}
    fullWidth
    ref={comboRef}
    onInputChange={(e, v) => inputChange(comboRef.current.getAttribute('name'), v)} 
    variant="standard" 
    // options={options}
    name={nameField} 
    renderInput={(params) => { return <TextField {...params} error={err && Boolean(err[nameField])} label={label} />}}
    />
  )
}

function TextInput({label, name, change, value, error}){
  return (
    <TextField fullWidth variant="outlined"
    label={label}
    value={value}
    name={name} 
    onChange={(e) => change(e)}
    error={ error && Boolean(error[name])}
  />
  )
}

function LoanForm1({ customers, collaterals, facilities, banks, categories, deductions , accountTitle}) {
  const [formValue, setFormvValue] = useState(LOAN_INITIAL_VALUES);
  const [rows, setRows] = useState([]);
  const [validationError,setValidationError] = useState(null);
  const [deductionsData, setDeductionsData] = useState([]);
  const [deductionItem, setDeductionItem] = useState(null); 
  const [voucher, setVoucher ] = useState(formValue.voucher)
  const [voucherHTML, setVoucherHTML] = useState(null)

  const totalCredit = voucher.reduce((acc, cur) =>  acc + Number(cur.credit), 0)
  const totalDebit = voucher.reduce((acc, cur) =>  acc + Number(cur.debit), 0)
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
      console.log('151', error)
      setValidationError(error)
    }
  }

  useEffect(() => {
    setFormvValue({...formValue, loan_details : [...rows]})
  },[rows])

  const handleLoanDetails = async () => {
    try {
      loanDetailsSchema.validateSync(formValue,
        {abortEarly : false}
      )
    } catch (err) {
      console.dir(err)
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
      onSubmit={() => console.log(formValue.voucher)}
      >
        <FormStep
          stepName="Loan Requirements"
          onSubmit={handleLoanRequirement}
          values={formValue}
          schema={loanRequrementSchema}
        >
          <Grid container spacing={2} >
            <Grid item xs={4}>
              <TextInput
                value={formValue.voucher_number}
                label="Voucher"
                name="voucher_number"
                error={validationError}
                change={(e) => handleTextField(e)}
              />
            </Grid>
            <Grid item xs={8}>
              <ComboBox 
                label='Borrower'
                value={formValue.customer_name}
                inputChange={handleComboBox} 
                options={customers.map((v) => `${v.l_name}, ${v.f_name} ${v.m_name}`)} 
                nameField="customer_name"
                err={validationError}
              />
              
            </Grid>
            <Grid item xs={5}>
            <ComboBox 
                label='Bank'
                inputChange={handleComboBox} 
                value={formValue.bank_name}
                options={banks.map((v) => v.name)} 
                nameField="bank_name"
                err={validationError}
            />
            </Grid>
            <Grid item xs={7}>
              <TextInput
                value={formValue.check_issued_name}
                label="Issued Name"
                name="check_issued_name"
                error={validationError}
                change={(e) => handleTextField(e)}
              />
            </Grid>
            <Grid item xs={12}>
              <ComboBox 
                label='Collateral'
                inputChange={handleComboBox} 
                value={formValue.collateral}
                options={collaterals.map((v) => v.name)} 
                nameField="collateral"
                err={validationError}
            />
            </Grid>
            <Grid item xs={12}>
              <ComboBox 
                label='Category'
                inputChange={handleComboBox} 
                value={formValue.loan_category}
                options={categories.map((v) => v.name)} 
                nameField="loan_category"
                err={validationError}
              />
            </Grid>
            <Grid item xs={12}>
              <ComboBox 
                label='Facility'
                inputChange={handleComboBox} 
                nameField="loan_facility"
                value={formValue.loan_facility}
                options={facilities.map((v) => v.name)} 
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
              <TextInput 
                name="principal_amount" 
                label="Principal Amount"
                value={formValue.principal_amount}
                change={(e) => handleTextField(e)}
                error={validationError}
              />
            </Grid>
            <Grid item xs={3}>
              <TextInput 
                name="interest_rate" 
                label="Interest Rate"
                value={formValue.interest_rate}
                change={(e) => handleTextField(e)}
                error={validationError}/>
            </Grid>
            <Grid item xs={12}>
              <LoanDetailsTable banks={banks} rows={rows} setRows={setRows}/>
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
                return {...acc, [deductionsData[index].name] : true}
              }, 
              {})
              setValidationError(error)
            }
          }}
        >
          <Grid container >
            <Grid item xs={10}>
              <Autocomplete
                options={deductions.map((v) => v.deductionType)}
                value={deductionItem}
                onInputChange={ (e,v) => {
                  setDeductionItem(v)
                }}
                renderInput= { (params) => <TextField {...params}  label='Deductions'/>}
              />
            </Grid>
            <Grid item xs={2}>
              <Button
                onClick={() => {
                  if(deductionItem){
                    let contains  = false;
                    for (const d of deductionsData) {
                      if(d.label === deductionItem){ contains = true }
                    }
                    if(!contains){
                      const format = deductionItem.toLowerCase().split(' ').join('_')
                      const d = [...deductionsData, {label : deductionItem, name : format, amount : ''}]
                      setDeductionsData(d)
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
                }}
              >
                <AddOutlined sx={{ mr: "2px" }} />
              </Button>
            </Grid>
          </Grid>
          <Grid container gap={1.5} marginTop={1.5}>
            { deductionsData && deductionsData.map((d, i) =>(
              <TextField 
              label={d.label} 
              value={d.amount}
              error={validationError && Boolean(validationError[d.name])}
              type='number'
              onChange= {(e) =>{
                setValidationError(null)
                const d = deductionsData.map((v, index) => {
                  return i === index ? {...v, amount : e.target.value} : v
                })
                setDeductionsData(d)
                setFormvValue({...formValue, deduction : d})
              }}
              InputProps={{
                endAdornment : 
                  <InputAdornment position='end'>
                    <IconButton
                      onClick={(e) => {
                        const d = deductionsData.filter((v, index) => index !== i) 
                        setDeductionsData(d)
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
        <FormStep
          stepName="Summary"
          onSubmit={() => {
            
          }}
          schema={yup.object({})}
        >
          
          <Box
            display='flex'
            justifyContent='center'
            gap={5}
            mt={5}
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
              value={formValue.interest_rate}
            />
            <PreviewLabel
              label='Bank Name'
              value={formValue.bank_name}
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
        </FormStep>
        <FormStep
          stepName="Voucher Details"
          schema={voucherSchema}
          onSubmit={() => {
            console.log(formValue)
            const fullName = formValue.customer_name.split(',')
            const bankName = formValue.bank_name
            const categoryName = formValue.loan_category
            let data = {...formValue}
            
            for (const customer of customers) {
              if(fullName[0] === customer.l_name && fullName[1].includes(customer.f_name)){
                data = {...data, customer_id : customer.id}
              }
            }

            for (const bank of banks) {
              if(bank.name === bankName) data = {...data, bank_account_id : bank.id};
            }

            for (const category of categories) {
              
              if(category.name === categoryName) data = {...data , loan_category_id : category.id}
            }

            for (const facility of facilities) {
              if(facility.name === formValue.loan_facility) data = {...data, loan_facility_id : facility.id}
            }

            for (const collateral of collaterals) {
              if(collateral.name === formValue.collateral) data = {...data, collateral_id : collateral.id }
            }
            
            const mapLoanDetails = data.loan_details.map((v) => {
              for (const b of banks) {
                if(v.bank === b.name) 
                  return {...v, bank_account_id : b.id }
              }
            })

            data = {...data , loan_details : mapLoanDetails} 
            
            
            fetch('http://localhost:8000/loans', {
              method : 'POST',
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(data)
            }).then((d) => d.json()).then((res) => setVoucherHTML(res.html))


          }}
        >
          <Button variant='outlined' color='success'
            onClick={() => {
              const voucherItem = [...voucher, {name : '', credit : '', debit : '' }]
              setVoucher(voucherItem)
              setFormvValue({...formValue, voucher : voucherItem})
            }}
          >
            Add Account Title
          </Button>
          <Box
            marginTop={2}
            display='flex'
            flexDirection='column'      
            gap={1.5}
          >
            { voucher && voucher.map((v, i)=> (
              <Grid container gap={1}>
                <Grid item flex={1}>
                  <ComboBox fullWidth label='Account Title'
                    value={v.name} 
                    options={accountTitle.map((v) => `${v.account_name} - ${v.account_title}`)} 
                    inputChange={(n, value) => {
                      const newValue = voucher.map((val, index) => {
                        return i === index ? {...val,  name : value} : val
                      })
                      setVoucher(newValue)
                      setFormvValue({...formValue, voucher : newValue})
                    }} />
                </Grid>
                <Grid item>
                  <TextField 
                    type='number'  
                    label="Credit"
                    sx={{width : 150}}
                    value={v.credit}
                    onChange={(e)=>{
                      const newValue = voucher.map((val, index) => {
                        return i === index ? {...val, credit : e.target.value} : val
                      })
                      setVoucher(newValue)
                      setFormvValue({...formValue, voucher : newValue })
                    }}
                    />
                </Grid>
                <Grid item >
                  <TextField 
                    type='number'
                    label="Debit"
                    sx={{width : 150}}
                    value={v.debit}
                    onChange={(e)=>{
                      const newValue = voucher.map((val, index) => {
                        console.log(index)
                        return i === index ? {...val, debit : e.target.value} : val
                      })
                      setVoucher(newValue)
                      setFormvValue({...formValue, voucher : newValue})
                    }}
                  />
                </Grid>
                <Grid item display='flex' >
                  <Button variant='outlined' color='error'
                    // sx={{  }}
                    onClick={() => {
                      const filter = voucher.filter((v, index) => i !== index)
                      setVoucher(filter)
                      setFormvValue({...formValue, voucher : filter})
                    }}  
                  >
                    <DeleteOutline/>
                  </Button>
                </Grid>
              </Grid>
              
            ))
            }
            <Box mt={1} ml={2}>
              <Box display='flex' gap={1}>
                <Typography fontWeight='bold' textTransform='uppercase' letterSpacing='1px' > Credit Total :</Typography> 
                <Typography fontStyle='italic' fontSize='14px' letterSpacing='1px'>{numberFormat.format(Number(totalCredit))}</Typography>
              </Box>
              <Box display='flex' gap={1}>
                <Typography fontWeight='bold' textTransform='uppercase' letterSpacing='1px' > Debit Total :</Typography> 
                <Typography fontStyle='italic' fontSize='14px' letterSpacing='1px' >{numberFormat.format(Number(totalDebit))}</Typography>
              </Box>
              <Box display='flex' gap={1}>
                <Typography fontWeight='bold' textTransform='uppercase' letterSpacing='1px' > Balance :</Typography> 
                <Typography fontStyle='italic' fontSize='14px' >{Math.abs(totalCredit - totalDebit)}</Typography>
              </Box>

            </Box>
          </Box>
        </FormStep>
        <FormStep
          stepName='Print Voucher'
        >
          <Box>
            <Typography display='flex' justifyContent='center'>
              <CheckCircleOutlineRounded color="success" sx={{fontSize : 70}}/>
            </Typography>
            <Typography display='flex' justifyContent='center'  sx={{fontSize : 20}} >Save Successfully!</Typography>
            <Typography display='flex' justifyContent='center' mt={2}>
              <Button variant='outlined' color='success'sx={{fontSize : 15}}
              onClick={() => {
                const voucherWindow = window.open('sdsd','Print Voucher')
                if(voucherHTML) {
                  voucherWindow.document.write(voucherHTML)
                } 
              }}
              >Print Voucher</Button>
            </Typography>
          </Box>
        </FormStep>
      </MultiStepForm1>
    </div>  
  )
}

function PreviewLabel({label, value}){
  return(
    
  <Box>
    <StyledLabel>{value}</StyledLabel>
    <Typography style={{
      letterSpacing : '1px',
      textAlign : 'center',
      fontSize : 'smaller',
      fontStyle : 'italic'
    }}>
    {label}
    </Typography>
  </Box>
  )
}

const StyledLabel = styled('div')({
  // fontStyle : 'italic',
  fontWeight : 'bold',
  letterSpacing : '1.5px',
  // borderWidth : '1px',
  textAlign: 'center',
  // color: 'lightgray',
  // borderWidth : 1,
  // borderBottom : ['solid'],
  borderBottomWidth:  1,
})

export default LoanForm1