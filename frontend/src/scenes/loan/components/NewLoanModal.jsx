import { CheckBox, Margin } from "@mui/icons-material"
import { Autocomplete, Grid, InputAdornment, TextField } from "@mui/material"
import { useState, useEffect } from "react"
import { useTheme } from "@emotion/react"
import { tokens } from "../../../theme"

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

  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
    const [loanHeaderValues, setLoanHeaderValues] = useState(initialLoanHeaderValues)

    const [principalAmount, setPrincipalAmount] = useState('');

    const [showMoratorium, setShowMoratorium] = useState(false);

    const handleMoratoriumChange = (event) => {
      setShowMoratorium(event.target.checked);
    };

    const handlePrincipalAmountChange = (event) => {
      const sanitizedInput = event.target.value.replace(/[^0-9.]/g, ''); // Remove non-numeric characters
    
      // Validate if the input is a valid numeric value
      if (/^\d*\.?\d*$/.test(sanitizedInput)) {
        // Format the number with commas
        const parts = sanitizedInput.split('.');
        const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        const decimalPart = parts[1] ? `.${parts[1]}` : '';
    
        const formattedNumber = `${integerPart}${decimalPart}`;
        setPrincipalAmount(formattedNumber);
      }
    };
    

  return (
    <form>
      <Grid container spacing={1}>
        {/* START FIRST COLUMN */}
        <Grid item xs={6} borderRight={1} borderColor={colors.grey[500]}>
          <Grid container xs={12}>
            <Grid item xs={4}>
              <TextField
                variant="outlined"
                label="Voucher Number"
                type="number"
                fullWidth
                // value={loanHeaderValues.voucher_number}
                sx={{width: "95%", margin: 1}}
              />          
            </Grid>
            <Grid item xs={8}>
              <Autocomplete 
                disablePortal
                id="customerName"
                options={sampleCustomer.map((option) => option.customer)}
                sx={{width: "95%", margin: 1}}
                renderInput={(params) => <TextField {...params} label="Customer" />}
              />
            </Grid>
          </Grid>
          <Grid container xs={12}>
            <Grid item xs={5}>
              <Autocomplete 
                disablePortal
                id="bank"
                options={sampleBank.map((option) => option.bank)}
                sx={{width: "95%", margin: 1}}
                renderInput={(params) => <TextField {...params} label="Bank" />}
              />
              
            </Grid>
            <Grid item xs={7}>
              <TextField
                variant="outlined"
                label="Check Issued Name"
                fullWidth
                value={loanHeaderValues.voucher_number}
                sx={{width: "95%", margin: 1}}
              />
            </Grid>
          </Grid>
          <Grid container xs={12}>
            <Grid item xs={12}>
              <Autocomplete 
                disablePortal
                id="collateral"
                options={sampleBank.map((option) => option.bank)}
                sx={{width: "97%", margin: 1}}
                renderInput={(params) => <TextField {...params} label="Loan Collateral" />}
              />
              <Autocomplete 
                disablePortal
                id="facility"
                options={sampleBank.map((option) => option.bank)}
                sx={{width: "97%", margin: 1}}
                renderInput={(params) => <TextField {...params} label="Loan Category" />}
              />
              <Autocomplete 
                disablePortal
                id="facility"
                options={sampleBank.map((option) => option.bank)}
                sx={{width: "97%", margin: 1}}
                renderInput={(params) => <TextField {...params} label="Loan Facility" />}
              />
            </Grid>
          </Grid>
        </Grid>
        {/* END FIRST COLUMN */}
        {/* START SECOND COLUMN */}       
        <Grid item xs={3} borderRight={1} borderColor={colors.grey[500]} padding={1}>
            <Grid container>
              <Grid item xs={8}>
                <TextField
                  variant="outlined"
                  label="Principal Amount"
                  type="text"  // Use type="text" to allow alphanumeric characters
                  fullWidth
                  value={principalAmount}
                  onChange={handlePrincipalAmountChange}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">₱</InputAdornment>,
                  }}
                  sx={{ width: '90%', margin: 1 }}
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  variant="outlined"
                  label="Rate"
                  type="number"
                  fullWidth
                  // value={loanHeaderValues.voucher_number}
                  sx={{width: "90%", margin: 1}}
                />
              </Grid>
            </Grid>
            <Grid container>
              <Grid item xs={12}>
                <TextField
                  variant="outlined"
                  label="Monthly Term"
                  type="number"
                  fullWidth
                  sx={{width: "97%", margin: 1}}
                  inputProps={{ min: 0 }}
                  
                />
              </Grid>
              <Grid item xs={12}>
                  {/* Checkbox for showing additional fields */}
                  
                  <label>
                    <input
                      type="checkbox"
                      checked={showMoratorium}
                      onChange={handleMoratoriumChange}
                      
                    />
                    Moratorium
                  </label>
              </Grid>
            </Grid>
            {showMoratorium && (
            <Grid container>
              <Grid item xs={8}>
                <TextField
                  // ... (other props)
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  // ... (other props)
                />
              </Grid>
            </Grid>
          )}
        </Grid>
        {/* END SECOND COLUMN */}
        {/* START THIRD COLUMN */}
        <Grid item xs={3}>
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
        {/* END THIRD COLUMN */}
      </Grid>
    </form>
  )
}
