import { Autocomplete, Box, Grid, MenuItem, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from "@mui/material";
import SelectWrapper from "../../../components/FormUI/Select";
import EditableDataGrid from "./EditableDataGrid";
import TextfieldWrapper from "../../../components/FormUI/Textfield";
import { useEffect, useState } from "react";
import { ComboBox } from "../../loan/components/LoanForm1";
import { DatePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import { tokens } from "../../../theme";
import { useTheme } from "@emotion/react";
import { MuiFileInput } from "mui-file-input";
import { AttachFile } from "@mui/icons-material";

const fixedOptions = [
  { value: "CASH", label: "Cash" },
  { value: "CHECK", label: "Check" },
  { value: "ONLINE", label: "Online" },
];

const OptionSelect = ({options, onValueChange, ...props}) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  return(
    <TextField 
      {...props}
      select
      onChange={(e) => onValueChange(e.target.value, e)}
      sx={{
        "& .MuiOutlinedInput-root": {
          "&.Mui-focused fieldset": {
            borderColor: colors.greenAccent[600],
          },
          "&:hover fieldset": {
            borderColor: colors.greenAccent[500],
          },
        },
        "& .MuiInputLabel-root.Mui-focused": {
          color: "white",
        },
      }}
    >
      {options.map((option) => (
        <MenuItem 
          key={option.value} 
          value={option.value}
          sx={{
            backgroundColor: colors.greenAccent[800],
            "&:hover": { backgroundColor: colors.greenAccent[700] },
          }}
        >
          {option.label}
        </MenuItem>
      ))}
    </TextField>
  )
}

const TextInput = ({name, onValueChange, ...props }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const handleChange = (e) => {
    onValueChange(e.target.value, name, e)
  }
  return(
    <TextField {...props} 
    sx={{
      '& .MuiOutlinedInput-root': {
        '&.Mui-focused fieldset': {
          borderColor: colors.greenAccent[600], // Change border color when focused
        },
        '&:hover fieldset': {
          borderColor: colors.greenAccent[500], // Change border color on hover
        },
      },
      '& .MuiInputLabel-root.Mui-focused': {
        color: 'white', // Change label color when focused
      },
    }}
      onChange={handleChange}
    />
  )
}

const PaymentSetup = ({cashRow, cashRowSetter, paymentData , paymentDataSetter, selectedBank, selectedBankSetter}) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [banks, setBanks] = useState([]);
  const [showOrField, setShowOrField] = useState(false);
  const [total, setTotal] = useState(0)
  const [file, setFile] = useState(paymentData.attachment)


  const handleRowEdit = (newRow, oldRow) => {
    const updatedRow = cashRow.map((v) => {
      if(v.id == newRow.id) return newRow;
      return v
    })
    cashRowSetter(updatedRow)
    const calTotal = updatedRow.reduce((acc, cur) => acc + (cur.denomination * cur.count), 0)
    setTotal(calTotal)
    paymentDataSetter((old) => ({...old , cash_count : updatedRow}))
    return newRow
  };


  const handleTextFieldChange = (e) => {
    paymentDataSetter((old) => ({...old, [e.target.name] : e.target.value}))
  }
  const handleFileChange  = (file) => {
    paymentDataSetter((old) => ({...old, attachment : file}))
    setFile(file)
  }

  useEffect(() => {
    const getBanks = async () => {
      const req = await fetch(`/api/payments/bank`);
      const resJson = await req.json();
      setBanks(resJson);
    };
    getBanks();
    const calTotal = cashRow.reduce((acc, cur) => acc + (cur.denomination * cur.count), 0)
    setTotal(calTotal)
  }, []);

  useEffect(() => {
    // Show OR field if bank name contains "BDO"
    const shouldShowOr = paymentData.bank?.name?.toUpperCase().includes("BDO") || false;
    setShowOrField(shouldShowOr);
  }, [paymentData.bank]);

  return (
    <Grid container spacing={2}>
      {/* Left Column - Payment Type & PR Number */}
      <Grid item xs={12} md={4}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <OptionSelect 
              value={paymentData.payment_type} 
              fullWidth 
              label='Mode of Payment' 
              options={fixedOptions} 
              onValueChange={(value) => {
                // Reset related fields when payment type changes
                paymentDataSetter((old) => ({
                  ...old, 
                  payment_type: value, 
                  or_number: '', 
                  check_number: '', 
                  check_date: null,
                  bank: null,
                  cash_count: value === 'CASH' ? old.cash_count : []
                }));
                // Reset cash row if switching away from CASH
                if (value !== 'CASH') {
                  cashRowSetter(cashRow.map(v => ({ ...v, count: 0 })));
                  setTotal(0);
                }
              }} 
            />
          </Grid>
          <Grid item xs={12}>
            <TextInput 
              fullWidth 
              label='Provisional Receipt' 
              name='pr_number' 
              value={paymentData.pr_number} 
              onValueChange={(value, field) => paymentDataSetter((old) => ({...old, [field]: value}))} 
            />
          </Grid>
          <Grid item xs={12}>
            <MuiFileInput 
              value={file}
              fullWidth
              InputProps={{ startAdornment: <AttachFile /> }}
              placeholder="Upload Attachment"
              hideSizeText 
              label='Attachment' 
              getInputText={(value) => value ? value.name : ''}
              onChange={handleFileChange}
            />
          </Grid>
        </Grid>
      </Grid>

      {/* Right Column - Payment Details */}
      <Grid item xs={12} md={8}>
        {paymentData.payment_type === "CASH" && (
          <Box>
            <Typography variant="h6" gutterBottom color={colors.greenAccent[400]}>
              Cash Denomination
            </Typography>
            <EditableDataGrid
              rowData={cashRow}
              onRowEdit={handleRowEdit}
              total={total}
            />
            <Typography variant="h5" mt={2} color={colors.greenAccent[300]}>
              Total: ₱{total.toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Typography>
          </Box>
        )}

        {paymentData.payment_type === "CHECK" && (
          <Box>
            <Typography variant="h6" gutterBottom color={colors.greenAccent[400]}>
              Check Details
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={showOrField ? 4 : 6}>
                <Autocomplete 
                  options={banks}
                  getOptionLabel={(option) => option.name}
                  value={paymentData.bank || null}
                  onChange={(_, value) => {
                    paymentDataSetter((old) => ({
                      ...old, 
                      bank: value,
                      or_number: value?.name?.toUpperCase().includes("BDO") ? old.or_number : ''
                    }));
                  }}
                  renderInput={(params) => <TextField {...params} label='Bank' required />}
                  renderOption={(props, option) => 
                    <Box {...props} component='li' key={option.id}>
                      {option.name}
                    </Box>
                  }
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      "&.Mui-focused fieldset": {
                        borderColor: colors.greenAccent[600],
                      },
                      "&:hover fieldset": {
                        borderColor: colors.greenAccent[500],
                      },
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={showOrField ? 4 : 6}>
                <TextField 
                  fullWidth 
                  label='Check No.' 
                  name="check_number" 
                  onChange={handleTextFieldChange} 
                  value={paymentData.check_number}
                  required
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      "&.Mui-focused fieldset": {
                        borderColor: colors.greenAccent[600],
                      },
                      "&:hover fieldset": {
                        borderColor: colors.greenAccent[500],
                      },
                    },
                    "& .MuiInputLabel-root.Mui-focused": {
                      color: "white",
                    },
                  }}
                />
              </Grid>
              {showOrField && (
                <Grid item xs={12} sm={4}>
                  <TextField 
                    fullWidth 
                    label='OR No.' 
                    name="or_number" 
                    onChange={handleTextFieldChange} 
                    value={paymentData.or_number}
                    required
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        "&.Mui-focused fieldset": {
                          borderColor: colors.greenAccent[600],
                        },
                        "&:hover fieldset": {
                          borderColor: colors.greenAccent[500],
                        },
                      },
                      "& .MuiInputLabel-root.Mui-focused": {
                        color: "white",
                      },
                    }}
                  />
                </Grid>
              )}
              <Grid item xs={12} sm={showOrField ? 12 : 6}>
                <DatePicker 
                  value={paymentData.check_date ? dayjs(paymentData.check_date) : null}
                  onChange={(value) => paymentDataSetter((old) => ({...old, check_date: value ? dayjs(value) : null}))} 
                  label='Check Date'
                  slotProps={{ 
                    textField: { 
                      fullWidth: true,
                      required: true,
                      sx: {
                        "& .MuiOutlinedInput-root": {
                          "&.Mui-focused fieldset": {
                            borderColor: colors.greenAccent[600],
                          },
                          "&:hover fieldset": {
                            borderColor: colors.greenAccent[500],
                          },
                        },
                      }
                    } 
                  }}
                />
              </Grid>
            </Grid>
          </Box>
        )}

        {paymentData.payment_type === "ONLINE" && (
          <Box>
            <Typography variant="h6" color={colors.greenAccent[400]}>
              Online Payment
            </Typography>
            <Typography variant="body2" color={colors.grey[300]} mt={1}>
              Please attach proof of payment using the attachment field.
            </Typography>
          </Box>
        )}

        {!paymentData.payment_type && (
          <Box 
            display="flex" 
            justifyContent="center" 
            alignItems="center" 
            minHeight={200}
            sx={{ 
              border: `2px dashed ${colors.greenAccent[700]}`,
              borderRadius: 2,
              backgroundColor: colors.greenAccent[900]
            }}
          >
            <Typography variant="h6" color={colors.grey[500]}>
              Select a payment mode to continue
            </Typography>
          </Box>
        )}
      </Grid>
    </Grid>
  );
};

export default PaymentSetup;
