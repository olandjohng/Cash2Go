import { Grid } from "@mui/material";
import React from "react";
import TextfieldWrapper from "../../../components/FormUI/Textfield";
import NumberfieldWrapper from "../../../components/FormUI/Numberfield";

const PaymentAmount = () => {
  return (
    <Grid container spacing={2} direction="column" justifyContent="center" alignItems="center">
      <Grid item xs={6} width={400}>
        <NumberfieldWrapper name="principalAmount" label="Principal Amount" />
      </Grid>
      <Grid item xs={6} width={400}>
        <NumberfieldWrapper name="InterestAmount" label="Interest Amount" />
      </Grid>
      <Grid item xs={6} width={400}>
        <NumberfieldWrapper name="PenaltyAmount" label="Penalty Amount" />
      </Grid>
      <Grid item xs={6} width={400}>
        <NumberfieldWrapper name="Total" label="Total Amount" disabled />
      </Grid>
      <Grid item xs={6} width={600}>
        <TextfieldWrapper name="Remarks" label="Remarks" />
      </Grid>
    </Grid>
  );
};

export default PaymentAmount;
