import { Formik } from "formik";
import * as yup from 'yup';
import MultiStepForm from "../../../components/MultiStepForm";

const LOAN_INITIAL_VALUES = {
    customer_id: '',
    transaction_date: new Date().toISOString().split('T')[0],
    bank_account_id: '',
    collateral_id: '',
    loan_category_id: '',
    loan_facility_id: '',
    principal_amount: 0,
    interest_rate: 0,
    total_interest: 0,
    term_month: 0,
    term_day: 0,
    date_granted: new Date().toISOString().split('T')[0],
    check_issued_name: '',
    voucher_number: '',
    renewal_id: 0,
    renewal_amount: 0,
    details: {
      
    }
}

function LoanForm() {
  return (
    <div>LoanForm</div>
  )
}

export default LoanForm