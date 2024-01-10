import { Margin } from "@mui/icons-material"
import { Autocomplete, Grid, TextField } from "@mui/material"
import { useState, useEffect } from "react"


const initialLoanHeaderValues = {
    id: 0,
    pn_number: '',
    customer_id: '',
    transaction_date: new Date(),
    bank_account_id: '',
    bank_account_pdc_id: '',
    collateral_id: '',
    loan_category_id: '',
    loan_facility_id: '',
    principal_amount: 0,
    interest_rate: 0,
    total_interest: 0,
    term_month: 0,
    term_day: 0,
    date_granted: new Date(),
    status_code: '',
    check_issued_name: '',
    voucher_number: '',
    renewal_id: '',
    renewal_amount: 0,
}

const sampleCustomer = [
  {customer: 'RD Vincent Gaspar', position:'Admin'},
  {customer: 'Roland John Gaspar', position:'CEO'},
  {customer: 'Ronie Jay Gaspar', position:'Teacher'},
];

const sampleBank = [
  {bank: 'BDO', code:'BDO'},
  {bank: 'BPI', code:'BPI'},
  {bank: 'Metro Bank', code:'MB'},
];

export default function NewLoanModal() {
    const [loanHeaderValues, setLoanHeaderValues] = useState(initialLoanHeaderValues)
  return (
    <form>
      <Grid container spacing={1}>
        <Grid item xs={4}>
          <TextField
            variant="outlined"
            label="Voucher Number"
            fullWidth
            // value={loanHeaderValues.voucher_number}
            sx={{width: "95%", margin: 1}}
          />
          <Autocomplete 
            disablePortal
            id="customerName"
            options={sampleCustomer.map((option) => option.customer)}
            sx={{width: "95%", margin: 1}}
            renderInput={(params) => <TextField {...params} label="Customer" />}
          />
          <Autocomplete 
            disablePortal
            id="bank"
            options={sampleBank.map((option) => option.bank)}
            sx={{width: "95%", margin: 1}}
            renderInput={(params) => <TextField {...params} label="Bank" />}
          />
          <TextField
            variant="outlined"
            label="Check Issued Name"
            fullWidth
            // value={loanHeaderValues.voucher_number}
            sx={{width: "95%", margin: 1}}
          />
        </Grid>
        <Grid item xs={4}>
            <TextField
                variant="outlined"
                label="Voucher Number"
                fullWidth
                value={loanHeaderValues.voucher_number}
                 sx={{width: "90%", margin: 1}}
            />
            <TextField
                variant="outlined"
                label="Voucher Number"
                fullWidth
                value={loanHeaderValues.voucher_number}
                 sx={{width: "90%", margin: 1}}
            />
        </Grid>
        <Grid item xs={4}>
            <TextField
                variant="outlined"
                label="Voucher Number"
                fullWidth
                value={loanHeaderValues.voucher_number}
            />
            <TextField
                variant="outlined"
                label="Voucher Number"
                fullWidth
                value={loanHeaderValues.voucher_number}
            />
        </Grid>
      </Grid>
    </form>
  )
}
