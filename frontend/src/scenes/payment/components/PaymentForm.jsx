import React, { useEffect, useState } from "react";
import { useTheme } from "@emotion/react";
import { tokens } from "../../../theme";
import MultiStepForm1, { FormStep } from "../../../components/MultiStepForm1";
import { DataGrid } from "@mui/x-data-grid";
import dayjs from "dayjs";
import { useParams } from "react-router-dom";
import {
  Button,
  Card,
  CardActions,
  CardContent,
  Grid,
  Typography,
} from "@mui/material";
import MultiStepForm from "../../../components/MultiStepForm";
import TextfieldWrapper from "../../../components/FormUI/Textfield";
import { grey } from "@mui/material/colors";
import LoanLinePaymentDetail from "./LoanLinePaymentDetail";
import PaymentSetup from "./PaymentSetup";
import PaymentAmount from "./PaymentAmount";

const formatNumber = (value) => {
  const amount = value.split(".");
  const format = Number(amount[0]).toLocaleString("en", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return format;
};

const initialValues = {
  principalAmount: "",
  interestAmount: "",
  PenaltyAmount: "",
  paymentType: "",
  bank: "",
  checkNum: "",
  remarks: "",
};

export default function PaymentForm(props) {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const { id } = useParams();

  const { selectedLoanId, onClosePopup } = props;
  const [loanDetails, setLoanDetails] = useState([]);
  

  const columns = [
    {
      field: "check_date",
      headerName: "Due Date",
      width: 150,
      valueFormatter: (params) => {
        return dayjs(params.value).format("MM-DD-YYYY");
      },
    },
    {
      field: "monthly_principal",
      headerName: "Principal",
      width: 150,
      valueFormatter: (params) => {
        return formatNumber(params.value);
      },
    },
    {
      field: "monthly_interest",
      headerName: "Interest",
      width: 150,
      valueFormatter: (params) => {
        return formatNumber(params.value);
      },
    },
    {
      field: "monthly_amortization",
      headerName: "Amortization",
      width: 150,
      valueFormatter: (params) => {
        return formatNumber(params.value);
      },
    },
    { field: "payment_type", headerName: "Type", width: 150 },
    {
      field: "principal_payment",
      headerName: "Principal Paid",
      width: 150,
      valueFormatter: (params) => {
        return formatNumber(params.value);
      },
    },
    {
      field: "interest_payment",
      headerName: "Interest Paid",
      width: 150,
      valueFormatter: (params) => {
        return formatNumber(params.value);
      },
    },
    {
      field: "penalty_amount",
      headerName: "Penalty Paid",
      width: 150,
      valueFormatter: (params) => {
        return formatNumber(params.value);
      },
    },
    {
      field: "Balance",
      headerName: "Balance",
      width: 150,
      valueFormatter: (params) => {
        return formatNumber(params.value);
      },
    },
    {
      field: "running_balance",
      headerName: "Running Balance",
      width: 150,
      valueFormatter: (params) => {
        return formatNumber(params.value);
      },
    },
    {
      field: "running_total",
      headerName: "Running Total Payment",
      width: 150,
      valueFormatter: (params) => {
        return formatNumber(params.value);
      },
    },
    { field: "description", headerName: "Status", width: 150 },
  ];

  useEffect(() => {
    const getLoanDetail = async () => {
      const req = await fetch(`http://localhost:8000/payments/read/${id}`);
      const resJson = await req.json();
      setLoanDetails(resJson);
    };
    getLoanDetail();
  }, []);

  

  return (
    <div style={{ width: 900 }}>
      <MultiStepForm initialValues={initialValues}>
        <FormStep
          stepName="Loan Details"
          onSubmit={() => console.log("Step One")}
        >
          <DataGrid
            rows={loanDetails}
            columns={columns}
            getRowId={(row) => row.loan_detail_id}
            sx={{ height: 370 }}
          />
        </FormStep>
        <FormStep
          stepName="Current Due"
          onSubmit={() => console.log("Step Two")}
        >
          <LoanLinePaymentDetail id={id} />
        </FormStep>
        <FormStep
          stepName="Payment Setup"
          onSubmit={() => console.log("Step Three")}
        >
          <PaymentSetup />
        </FormStep>
        <FormStep
          stepName="Payment"
          onSubmit={() => console.log("Step Four")}
        >
          <PaymentAmount id={id} />
        </FormStep>
      </MultiStepForm>
    </div>
  );
}
