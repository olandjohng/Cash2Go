import React, { useState } from 'react'
import Header from '../../components/Header'
import Popups from '../../components/Popups'
import { Box } from '@mui/material';
import ExpensesParentForm from '../expenses/components/ExpensesParentForm';
import { FormStep } from '../expenses';
import ExpensesDetails from '../expenses/components/ExpensesDetails';
import useSwr from 'swr'
import axios from 'axios'
import ExpensesVoucher from '../expenses/components/ExpensesVoucher';
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
  voucher_details : [{ category: '', debit: '0', credit: '0'}] 
}
const fetcher = (url) => {
  return axios.get(url).then(res => res.data)
}
export default function AdjustingEntriesPage() {

  const {data : banks, } = useSwr('/api/expenses/banks', fetcher)
  const {data : expenses_title, } = useSwr('/api/account-title/expenses', fetcher)
  const {data : employee, } = useSwr('/api/employee', fetcher,)
  const {data : suppliers} = useSwr('/api/expenses/suppliers', fetcher)

  const [activeStep, setActiveStep] = useState(0);
  const [details, setDetails] = useState(initialValues)
  const [openPopup, setOpenPopup] = useState(false)

  const handleStepComplete = (data) => {
    setDetails((old) => ({...old, ...data}))
    setActiveStep((prev) => prev + 1)
  }

  const handlePrevious = (data) => {
    setDetails((old) => ({...old, ...data}))
    setActiveStep((prev) => prev - 1)
  }


  return (
    <div style={{ height: "75%", padding: 20 }}>
      <Header title='Addjusting Entries' onAddButtonClick={() => { setOpenPopup(true)}} />
      <Popups 
        title="Adjusting Entries Form"
        openPopup={openPopup}
        setOpenPopup={(open) => {
          setOpenPopup(open)
        }}
      >
        <Box width={900}>
          <ExpensesParentForm activeStep={activeStep}>
            <FormStep label='Details'>
              <ExpensesDetails data={details} banks={banks} employee={employee} suppliers={suppliers} onComplete={handleStepComplete}/>
            </FormStep>
            <FormStep label='Details'>
            <ExpensesVoucher titles={expenses_title} data={details.voucher_details} onComplete={handleStepComplete} onPrevious={handlePrevious}/>
            </FormStep>
          </ExpensesParentForm>
        </Box>
      </Popups>
    </div>
  )
}
