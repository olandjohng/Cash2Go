import { DataGrid, GridActionsCell, GridActionsCellItem } from '@mui/x-data-grid'
import React, { useState } from 'react'
import Header from '../../components/Header'
import Popups from '../../components/Popups'
import { Box, Button } from '@mui/material'
import ExpensesParentForm from './components/ExpensesParentForm'
import ExpensesDetails from './components/ExpensesDetails'
import ExpensesVoucher from './components/ExpensesVoucher'
import useSwr from 'swr'
import axios from 'axios'
import ExpensesPrintVoucher from './components/ExpensesPrintVoucher'
import { PrintOutlined } from '@mui/icons-material'
import voucherTemplateHTML from '../../assets/voucher.html?raw'
import logo from '../../assets/c2g_logo_nb.png'
import useSWRMutation from 'swr/mutation'
import * as ejs from 'ejs'
import dayjs from 'dayjs'
import { toastSucc } from '../../utils'

const initialValues = {
  voucherNumber : '',
  borrower : '',
  date: null,
  bank : '',
  check_number : '',
  check_date: '',
  prepared_by: '',
  checked_by: '',
  approved_by: '',
  voucher_details : [{ category: '', debit: 0, credit: 0}] 
}

const fetcher = (url) => {
  return axios.get(url).then(res => res.data)
}
const fetchDetails = (url, {arg}) => {
  return axios.get(url + '/' +  arg).then(res => res.data)
}

export default function ExpensesPage() {
  const [openExpesesForm, setOpenExpensesForm] = useState(false)
  const [activeStep, setActiveStep] = React.useState(0);
  const [details, setDetails] = useState(initialValues)
  const {data : banks, } = useSwr('/api/banks/cash2go', fetcher)
  const {data : expenses_title, } = useSwr('/api/account-title/expenses', fetcher)
  const {data : employee, } = useSwr('/api/employee', fetcher,)
  const {data : expenses, isLoading, mutate } = useSwr('/api/expenses/', fetcher)
  const { trigger } = useSWRMutation('/api/expenses', fetchDetails)
  const {data : suppliers} = useSwr('/api/expenses/suppliers', fetcher)

  // console.log(suppliers)
  const handleStepComplete = (data) => {
    setDetails((old) => ({...old, ...data}))
    setActiveStep((prev) => prev + 1)
  }

  const handlePrintVoucher = async (id) => {

    const response = await trigger(id)
    console.log(response)
    const input = {
      logo : logo,
      ...response,
      has_second_check: false,
      date: dayjs(response.date).format('MM-DD-YYYY'),
      check_details : `${response.bank}-${response.check_number}`
    }

    const template = ejs.render(voucherTemplateHTML, input)
    const voucherWindow = window.open("", "Print Voucher");
    voucherWindow.document.write(template);
  }

  const handlePrevious = (data) => {
    setDetails((old) => ({...old, ...data}))
    setActiveStep((prev) => prev - 1)
  }

  const column = [
    {
      field: 'actions',
      type: 'actions',
      width: 50,
      getActions: ({id}) => {
        return [
          <GridActionsCellItem 
            icon={<PrintOutlined />}
            label='Print Voucher'
            onClick={() => handlePrintVoucher(id)}
          />
        ]
      }
    },
    {
      field : 'date',
      headerName: "Date",
      width: 100
    },
    {
      field : 'voucher_number',
      headerName: "Voucher No.",
      // flex: 1
      width: 100
    },
    {
      field : 'payee',
      headerName: "Payee",
      flex: 1
      
    },
    
    {
      field : 'check_details',
      headerName: "Check Details",
      flex: 1
      // width : 
    },
    {
      field : 'prepared_by',
      headerName: "Prepared By",
      width : 120
    },
    {
      field : 'checked_by',
      headerName: "Checked By",
      width : 120
    },
    {
      field : 'approved_by',
      headerName: "Approved By",
      width : 120
    },
  ]

  const handleSuccess = () => {
    mutate()
    setOpenExpensesForm(false)
    setActiveStep(0)
    setDetails(initialValues)
    toastSucc('Save Successfuly')
  }

  return (
    <div style={{ height: "80%", padding: 20,  }}>
      <Header title='Expenses' onAddButtonClick={ () => setOpenExpensesForm(true)}/>
        {!isLoading && 
          <DataGrid sx={{ height: "100%" }} columns={column} rows={expenses} rowSelection={false}/>
        }
      <Popups
        title="Expenses Form"
        openPopup={openExpesesForm}
        setOpenPopup={(open) => {
          setOpenExpensesForm(open)
          setActiveStep(0)
          setDetails(initialValues)
        }}
      >
        <Box width={900}>
          <ExpensesParentForm activeStep={activeStep}>
            <FormStep label='Expenses Details'>
              <ExpensesDetails onComplete={handleStepComplete} suppliers={suppliers} data={details} banks={banks} employee={employee} />
            </FormStep>
            <FormStep label='Voucher'>
              <ExpensesVoucher titles={expenses_title} data={details.voucher_details} onComplete={handleStepComplete} onPrevious={handlePrevious}/>
            </FormStep>
            <FormStep label='Print And Save'>
              <ExpensesPrintVoucher data={details} onPrevious={handlePrevious} onSuccess={handleSuccess}/>
            </FormStep>
          </ExpensesParentForm>
        </Box>
      </Popups>
      
    </div>
  )
}

function FormStep({ label='', children}) {
  return children
}