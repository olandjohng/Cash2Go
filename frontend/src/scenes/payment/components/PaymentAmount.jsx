import { Box, Button, Grid, TextField } from "@mui/material";
import TextfieldWrapper from "../../../components/FormUI/Textfield";
import NumberfieldWrapper from "../../../components/FormUI/Numberfield";
import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import { tokens } from "../../../theme";
import { useTheme } from "@emotion/react";
import { NumericFormat } from "react-number-format";
import AccountTitles from "./AccountTitles";



const PaymentAmount = ({ id, paymentDataSetter, paymentData }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const inputStyle = {
    "& .MuiOutlinedInput-root": {
      // Class for the border around the input field
      "& .MuiOutlinedInput-notchedOutline": {
        borderColor: colors.grey[300],
      },
    },
    // Class for the label of the input field
    "& .MuiInputLabel-outlined": {
      color: colors.grey[300],
    },
  }
  
  const [pricipalAmount, setPricipalAmount] = useState(null)
  const [interestAmount, setInterestAmount] = useState(null)
  const [penaltyAmount, setPenaltyAmount] = useState(null)
  const [totalAmount, setTotalAmount] = useState(null)
  // const [details, setDetails] = useState([]);

  useEffect(() => {
    const getDetail = async () => {
      const req = await fetch(
        `/api/payments/paymentDue/${id}`
      );
      const resJson = await req.json();
      const {Principal_Due, Interest_Due, Penalty_Due, loan_detail_id } = resJson[0]
      setPricipalAmount(Number(Principal_Due))
      setInterestAmount(Number(Interest_Due))
      setPenaltyAmount(Number(Penalty_Due))
      paymentDataSetter((old) => ({
        ...old, 
        loan_detail_id : loan_detail_id, 
        principal_payment : Number(Principal_Due),
        interest_payment : Number(Interest_Due),
        penalty_amount : Number(Penalty_Due)
      }))
      // setDetails(resJson);
    };
    getDetail();
  }, []);

  useEffect(() => {
    // cal total
    const total = calculateTotal()
    setTotalAmount(total)
    paymentDataSetter((old) => ({...old, 
      principal_payment : Number(pricipalAmount),
      interest_payment : Number(interestAmount),
      penalty_amount : Number(penaltyAmount)
    }))
    // set data 
  }, [pricipalAmount, interestAmount, penaltyAmount])



  const calculateTotal = () => {
    const totalAmount = Number(pricipalAmount) + Number(interestAmount) + Number(penaltyAmount) 
    return totalAmount;
  };

  const handleValueChange = (index, fieldName, value) => {
    let numericValue;
    // Check if value is an object and extract the value from it
    if (typeof value === 'object' && value.target && typeof value.target.value !== 'undefined') {
      // If it's an object, get the value from event.target.value
      numericValue = parseFloat(String(value.target.value).replace(/,/g, ''));
    } else {
      // If it's not an object, assume it's already the value we need
      numericValue = parseFloat(String(value).replace(/,/g, ''));
    }
    // If numericValue is NaN or undefined, set it to 0
    if (isNaN(numericValue) || typeof numericValue === 'undefined') {
      numericValue = 0;
    }
    // Ensure the numericValue is a valid number
    if (!isNaN(numericValue)) {
      // Round the numericValue to 2 decimal points and convert it back to a string
      const formattedValue = numericValue.toFixed(2);
      const updatedDetails = [...details];
      updatedDetails[index][fieldName] = formattedValue;
      console.log(updatedDetails)
      setDetails(updatedDetails);
    } else {
      console.error(`Invalid value provided: ${value}`);
    }
  };
  

  return (
    <Box width='100%' display='flex' flexDirection='column' gap='10px'>
      <Box display='flex' gap={2}>
        <Box width='20%' display='flex'  flexDirection='column' gap='10px'>
          <NumericFormat value={pricipalAmount} thousandSeparator fixedDecimalScale decimalScale={2} customInput={TextField} label="Principal Amount" fullWidth 
            onValueChange={(format) => setPricipalAmount(format.value)}
            sx={inputStyle}
            InputProps= {{
              inputProps : {  
                style : { textAlign : 'right'}
              }
            }}
          />
          <NumericFormat value={interestAmount} thousandSeparator fixedDecimalScale decimalScale={2} customInput={TextField} label="Interest Amount" fullWidth 
            onValueChange={(format) => setInterestAmount(Number(format.value))}
            sx={inputStyle}
            InputProps= {{
              inputProps : {
                style : { textAlign : 'right'}
              }
            }}
          />
          <NumericFormat value={penaltyAmount} thousandSeparator fixedDecimalScale decimalScale={2} customInput={TextField} label="Penalty Amount" fullWidth 
            onValueChange={(format) => setPenaltyAmount(Number(format.value))}
            sx={inputStyle}
            InputProps= {{
              inputProps : {
                style : { textAlign : 'right'}
              }
            }}
          />
          <NumericFormat value={totalAmount} disabled thousandSeparator fixedDecimalScale decimalScale={2} customInput={TextField} label="Total Amount" fullWidth 
            sx={inputStyle}
            InputProps= {{
              inputProps : {
                style : { textAlign : 'right'}
              }
            }}
          />
          <TextField fullWidth multiline rows={3} label='Remarks' value={paymentData.remarks} onChange={(e) => paymentDataSetter((old) => ({...old, remarks : e.target.value}))}
           sx={inputStyle}
           />
        </Box>
        <Box  width='80%'>
          <AccountTitles paymentData={paymentData} paymentDataSetter={paymentDataSetter} />
        </Box>
      </Box>
    </Box>
  );
};


export default PaymentAmount;
