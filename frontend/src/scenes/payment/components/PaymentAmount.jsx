import { Grid } from "@mui/material";
import TextfieldWrapper from "../../../components/FormUI/Textfield";
import NumberfieldWrapper from "../../../components/FormUI/Numberfield";
import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import { tokens } from "../../../theme";
import { useTheme } from "@emotion/react";

const PaymentAmount = ({ id }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [details, setDetails] = useState([]);

  useEffect(() => {
    const getDetail = async () => {
      const req = await fetch(
        `http://localhost:8000/payments/paymentDue/${id}`
      );
      const resJson = await req.json();
      setDetails(resJson);
    };
    getDetail();
  }, []);

  const calculateTotal = (index) => {
    const detail = details[index];
    const totalAmount =
      Number(detail.Principal_Due) +
      Number(detail.Interest_Due) +
      Number(detail.Penalty_Due);
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
    <main>
      {details.map((detail, index) => (
        <Grid
          container
          spacing={2}
          direction="column"
          justifyContent="center"
          alignItems="center"
          key={detail.loan_detail_id}
        >
          <Grid item xs={6} width={400}>
            <NumberfieldWrapper
              name="principalAmount"
              label="Principal Amount"
              value={detail.Principal_Due}
              onChange={(value) =>
                handleValueChange(index, "Principal_Due", value)
              }
            />
          </Grid>
          <Grid item xs={6} width={400}>
            <NumberfieldWrapper
              name="InterestAmount"
              label="Interest Amount"
              value={detail.Interest_Due}
              onChange={(value) => {
                console.log("Interest Amount changed:", value); // Add this line to log the value
                handleValueChange(index, "Interest_Due", value);
              }}
            />
          </Grid>
          <Grid item xs={6} width={400}>
            <NumberfieldWrapper
              name="PenaltyAmount"
              label="Penalty Amount"
              value={detail.Penalty_Due}
              onChange={(value) =>
                handleValueChange(index, "Penalty_Due", value)
              }
            />
          </Grid>
          <Grid item xs={6} width={400}>
            <NumberfieldWrapper
              name="Total"
              label="Total Amount"
              value={calculateTotal(index)}
              disabled
            />
          </Grid>
          <Grid item xs={6} width={600}>
            <TextfieldWrapper name="Remarks" label="Remarks" />
          </Grid>
        </Grid>
      ))}
    </main>
  );
};

export default PaymentAmount;
