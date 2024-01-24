import { AddOutlined, CheckBox, Margin, RemoveCircleOutlineOutlined } from "@mui/icons-material"
import { Autocomplete, Button, Checkbox, FormControlLabel, Grid, IconButton, InputAdornment, MenuItem, TextField } from "@mui/material"
import { useState, useEffect } from "react"
import { useTheme } from "@emotion/react"
import { tokens } from "../../../theme"
import { DataGrid } from '@mui/x-data-grid';


const initialLoanHeaderValues = {
    // id: 0,
    // pn_number: '',
    // customer_id: '',
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
    // status_code: '',
    check_issued_name: '',
    voucher_number: '',
    renewal_id: 0,
    renewal_amount: 0,
}

const columns = [
  { field: 'dueDate', headerName: 'Due Date', width: 150, editable: true, type: 'date' },
  { field: 'principal', headerName: 'Principal', width: 150, editable: true },
  { field: 'interest', headerName: 'Interest', width: 150, editable: true },
  { field: 'amortization', headerName: 'Amortization', width: 150, editable: true },
  { field: 'bank', headerName: 'Bank', width: 150, editable: true, renderCell: (params) => renderBankDropdown(params) },
  { field: 'checkNumber', headerName: 'Check Number', width: 150, editable: true },
];



const renderBankDropdown = (params) => {
  const banks = ['Bank A', 'Bank B', 'Bank C']; // Replace with your list of banks
  return (
    <TextField
      select
      value={params.value}
      onChange={(e) => params.api.setValue(params.id, 'bank', e.target.value)}
      style={{ width: '100%' }}
    >
      {banks.map((bank) => (
        <MenuItem key={bank} value={bank}>
          {bank}
        </MenuItem>
      ))}
    </TextField>
  );
};


export default function NewLoanModal() {

  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
    const [loanHeaderValues, setLoanHeaderValues] = useState(initialLoanHeaderValues)

    const [principalAmount, setPrincipalAmount] = useState('');

    const [showMoratorium, setShowMoratorium] = useState(false);

    const handleMoratoriumChange = (event) => {
      setShowMoratorium(event.target.checked);
    };

    const [rowCount, setRowCount] = useState(1);
    const [rows, setRows] = useState([{ id: 1 }]);

    const handleRowCountChange = (e) => {
    const count = parseInt(e.target.value, 10);
      setRowCount(count);
      const newRows = Array.from({ length: count }, (_, index) => ({ id: index + 1 }));
      setRows(newRows);
    };

    const handlePrincipalAmountChange = (event) => {
      let sanitizedInput = event.target.value.replace(/[^\d.]/g, ''); // Remove non-numeric characters
    
      // Validate if the input is a valid numeric value
      if (/^\d*\.?\d*$/.test(sanitizedInput)) {
        const parts = sanitizedInput.split('.');
        const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        const decimalPart = parts[1] ? `.${parts[1].slice(0, 2)}` : '';
    
        sanitizedInput = `${integerPart}${decimalPart}`;
      }
    
      setPrincipalAmount(sanitizedInput);
    };
        
    // Start for the deduction
      const [deductionList, setDeductionList] = useState([]);
      const [selectedDeduction, setSelectedDeduction] = useState(null);
  
      const handleDeductionChange = (event, value) => {
        setSelectedDeduction(value);
      };
  
      const handleAddDeduction = () => {
        if (selectedDeduction && !deductionList.includes(selectedDeduction)) {
          setDeductionList([...deductionList, selectedDeduction]);
          setSelectedDeduction(null);
        }
      };

      const handleDeleteDeduction = (index) => {
        const updatedDeductions = deductionList.filter((_, i) => i !== index);
        setDeductionList(updatedDeductions);
      };
    // End for the deduction
    const handleRowInputChange = (params, event) => {
      const newRow = rows.map((row)=> {
        if(row.id === params.id){
          return params.row
        }
        return row
      })
      setRows(newRow)

    }

  return (
    <div>
      <form>
      <Grid container spacing={1} marginBottom={4}>
        
        {/* START FIRST COLUMN */}
        <Grid item xs={8} border={1} borderColor={colors.grey[500]}>
          <Grid container xs={12}>
            <Grid item xs={4}>
              {/* <TextField
                variant="outlined"
                label="Voucher Number"
                type="number"
                name="voucher_number"
                fullWidth
                // onChange={(e) => console.log(e)}
                // value={loanHeaderValues.voucher_number}
                sx={{width: "95%", margin: 1}}
              />           */}
            </Grid>
            <Grid item xs={8}>
              <Autocomplete 
                disablePortal
                id="customerName"
                options={sampleCustomer.map((option) => option.customer)}
                sx={{width: "95%", margin: 1}}
                renderInput={(params) => <TextField {...params} label="Customer" name="customer"/>}
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
        <Grid item xs={4} >
            <Grid container>
              <Grid item xs={8}>
               
                <TextField
                  variant="outlined"
                  label="Principal Amount"
                  type="number"  // Use type="text" to allow alphanumeric characters
                  fullWidth
                  // value={principalAmount}
                  // onChange={handlePrincipalAmountChange}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">₱</InputAdornment>,
                    step: "0.1",
                    lang: "en-US"
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
                  value={rowCount}
                  onChange={handleRowCountChange}
                />
              </Grid>
              <Grid item xs={12}>
                  {/* Checkbox for showing additional fields */}
                  <FormControlLabel 
                    control={<Checkbox />} 
                    label="Moratorium" 
                    checked={showMoratorium}
                    onChange={handleMoratoriumChange}
                    sx={{
                      color: colors.greenAccent[500],
                      '&.Mui-checked': {
                        color: colors.greenAccent[500],
                      },
                      margin: 1
                    }}
                  />
                  
              </Grid>
            </Grid>
            {showMoratorium && (
            <Grid container>
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
              <Grid item xs={8}>
                <TextField
                  variant="outlined"
                  label="Monthly Term"
                  type="number"
                  fullWidth
                  sx={{width: "95%", margin: 1}}
                  inputProps={{ min: 0 }}
                  
                />
              </Grid>
            </Grid>
          )}
        </Grid>
        {/* END SECOND COLUMN */}
        {/* START THIRD COLUMN */}
        {/* <Grid item xs={3}>
          
        </Grid> */}
        {/* END THIRD COLUMN */}
      </Grid>
      {/* ----------------------------- */}
      <Grid container>
        <Grid item xs={4}>
        <Grid container>
            <Grid item xs={12}>
              <Autocomplete
              id="deduction"
              options={["Appraisal Fee", "Notarial Fee", "Documentary Stamp", "Service Charge"]}
              value={selectedDeduction}
              onChange={handleDeductionChange}
              renderInput={(params) => <TextField {...params} label="Deduction" fullWidth />}
              sx={{width: "95%", margin: 1}}
              />
              <Button 
                variant="outlined" 
                size="large"
                onClick={handleAddDeduction} 
                sx={{ 
                  backgroundColor: colors.blueAccent[700],
                  color: colors.grey[100],
                  fontSize: "14px",
                  fontWeight: "bold",
                  padding: "10px 20px",
                  width: "95%", marginTop: 2, margin: 1,
                  borderColor: colors.grey    [400],
                  "&:hover": {borderColor: colors.grey[400],
                              backgroundColor: colors.grey[700]        
                      }
                 }}
              >
                <AddOutlined sx={{ mr: "2px" }} />
              </Button>
            </Grid>
            <Grid container spacing={1}>
              <Grid item xs={4}>
                {deductionList.map((deduction, index) => (
                   <TextField
                     key={index}
                     variant="outlined"
                     label={deduction}
                     fullWidth
                     sx={{ width: "95%", margin: 1, textAlign: "end" }}
                     InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <IconButton
                            edge="end"
                            onClick={() => handleDeleteDeduction(index)}
                          >
                            <RemoveCircleOutlineOutlined />
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                   />
                ))}
              </Grid>
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={8}>
          <DataGrid
            margin={1}
            rows={rows}
            columns={columns}
            pageSize={5}
            // getRowId={row => row.id}
            // processRowUpdate={(updated) => console.log(updated)}
            // onProcessRowUpdateError={(err) => console.log(err)}
            checkboxSelection
            isCellEditable={(params) => params.row.id !== undefined}
          />
        </Grid>  
        <Button onClick={() => console.log(rows)}>Submit</Button>
      </Grid>
    </form>
    </div>
  )
}
