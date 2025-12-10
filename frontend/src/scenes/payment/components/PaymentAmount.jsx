import {
  Box,
  TextField,
  Typography,
  Paper,
  Divider,
  CircularProgress,
  Alert,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { tokens } from "../../../theme";
import { useTheme } from "@emotion/react";
import { NumericFormat } from "react-number-format";
import AccountTitles from "./AccountTitles";
import { InfoOutlined } from "@mui/icons-material";

const PaymentAmount = ({ id, paymentDataSetter, paymentData }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const inputStyle = {
    "& .MuiOutlinedInput-root": {
      "& .MuiOutlinedInput-notchedOutline": {
        borderColor: colors.grey[500],
      },
      "&:hover .MuiOutlinedInput-notchedOutline": {
        borderColor: colors.greenAccent[500],
      },
      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
        borderColor: colors.greenAccent[600],
      },
    },
    "& .MuiInputLabel-outlined": {
      color: colors.grey[300],
    },
    "& .MuiInputLabel-outlined.Mui-focused": {
      color: "white",
    },
  };

  const [principalAmount, setPrincipalAmount] = useState(0);
  const [interestAmount, setInterestAmount] = useState(0);
  const [penaltyAmount, setPenaltyAmount] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getDetail = async () => {
      if (!id) return;

      try {
        setLoading(true);
        setError(null);

        const req = await fetch(`/api/payments/paymentDue/${id}`);

        if (!req.ok) {
          throw new Error("Failed to fetch payment details");
        }

        const resJson = await req.json();

        if (!resJson || resJson.length === 0) {
          throw new Error("No payment details found");
        }

        const { Principal_Due, Interest_Due, Penalty_Due, loan_detail_id } =
          resJson[0];

        const principal = Number(Principal_Due) || 0;
        const interest = Number(Interest_Due) || 0;
        const penalty = Number(Penalty_Due) || 0;

        setPrincipalAmount(principal);
        setInterestAmount(interest);
        setPenaltyAmount(penalty);

        paymentDataSetter((old) => ({
          ...old,
          loan_detail_id: loan_detail_id,
          principal_payment: principal,
          interest_payment: interest,
          penalty_amount: penalty,
        }));
      } catch (err) {
        console.error("Error fetching payment details:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    getDetail();
  }, [id]);

  useEffect(() => {
    const total =
      Number(principalAmount) + Number(interestAmount) + Number(penaltyAmount);
    setTotalAmount(total);

    paymentDataSetter((old) => ({
      ...old,
      principal_payment: Number(principalAmount) || 0,
      interest_payment: Number(interestAmount) || 0,
      penalty_amount: Number(penaltyAmount) || 0,
    }));
  }, [principalAmount, interestAmount, penaltyAmount]);

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight={400}
      >
        <CircularProgress color="success" />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box width="100%" display="flex" flexDirection="column" gap={2}>
      <Box display="flex" gap={2} flexDirection={{ xs: "column", md: "row" }}>
        {/* Payment Amounts Section */}
        <Box width={{ xs: "100%", md: "30%" }}>
          <Paper
            elevation={2}
            sx={{
              p: 2,
              backgroundColor: colors.greenAccent[900],
              border: `1px solid ${colors.greenAccent[700]}`,
            }}
          >
            <Typography
              variant="h5"
              color={colors.greenAccent[400]}
              fontWeight="600"
              mb={2}
            >
              Payment Breakdown
            </Typography>

            <Box display="flex" flexDirection="column" gap={2}>
              <NumericFormat
                value={principalAmount}
                thousandSeparator
                fixedDecimalScale
                decimalScale={2}
                customInput={TextField}
                label="Principal Amount"
                fullWidth
                onValueChange={(values) => {
                  const { floatValue } = values;
                  setPrincipalAmount(floatValue || 0);
                }}
                sx={inputStyle}
                InputProps={{
                  inputProps: {
                    style: { textAlign: "right" },
                  },
                }}
              />

              <NumericFormat
                value={interestAmount}
                thousandSeparator
                fixedDecimalScale
                decimalScale={2}
                customInput={TextField}
                label="Interest Amount"
                fullWidth
                onValueChange={(values) => {
                  const { floatValue } = values;
                  setInterestAmount(floatValue || 0);
                }}
                sx={inputStyle}
                InputProps={{
                  inputProps: {
                    style: { textAlign: "right" },
                  },
                }}
              />

              <NumericFormat
                value={penaltyAmount}
                thousandSeparator
                fixedDecimalScale
                decimalScale={2}
                customInput={TextField}
                label="Penalty Amount"
                fullWidth
                onValueChange={(values) => {
                  const { floatValue } = values;
                  setPenaltyAmount(floatValue || 0);
                }}
                sx={inputStyle}
                InputProps={{
                  inputProps: {
                    style: { textAlign: "right" },
                  },
                }}
              />

              <Divider sx={{ my: 1, borderColor: colors.grey[700] }} />

              <NumericFormat
                value={totalAmount}
                disabled
                thousandSeparator
                fixedDecimalScale
                decimalScale={2}
                customInput={TextField}
                label="Total Amount"
                fullWidth
                sx={{
                  ...inputStyle,
                  "& .MuiInputBase-input.Mui-disabled": {
                    WebkitTextFillColor: colors.greenAccent[400],
                    fontWeight: "bold",
                  },
                }}
                InputProps={{
                  inputProps: {
                    style: { textAlign: "right" },
                  },
                }}
              />

              <TextField
                fullWidth
                multiline
                rows={3}
                label="Remarks"
                placeholder="Add payment notes or remarks here..."
                value={paymentData.remarks || ""}
                onChange={(e) =>
                  paymentDataSetter((old) => ({
                    ...old,
                    remarks: e.target.value,
                  }))
                }
                sx={inputStyle}
              />
            </Box>
          </Paper>

          {/* Summary Card */}
          <Paper
            elevation={1}
            sx={{
              p: 2,
              mt: 2,
              backgroundColor: colors.greenAccent[900],
              border: `1px solid ${colors.greenAccent[700]}`,
            }}
          >
            <Typography variant="body2" color={colors.grey[300]} mb={1}>
              Payment Summary
            </Typography>
            <Box display="flex" justifyContent="space-between" mb={0.5}>
              <Typography variant="body2" color={colors.grey[400]}>
                Principal:
              </Typography>
              <Typography variant="body2" color={colors.grey[100]}>
                ₱
                {principalAmount.toLocaleString("en", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </Typography>
            </Box>
            <Box display="flex" justifyContent="space-between" mb={0.5}>
              <Typography variant="body2" color={colors.grey[400]}>
                Interest:
              </Typography>
              <Typography variant="body2" color={colors.grey[100]}>
                ₱
                {interestAmount.toLocaleString("en", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </Typography>
            </Box>
            <Box display="flex" justifyContent="space-between" mb={1}>
              <Typography variant="body2" color={colors.grey[400]}>
                Penalty:
              </Typography>
              <Typography variant="body2" color={colors.grey[100]}>
                ₱
                {penaltyAmount.toLocaleString("en", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </Typography>
            </Box>
            <Divider sx={{ mb: 1, borderColor: colors.greenAccent[700] }} />
            <Box display="flex" justifyContent="space-between">
              <Typography
                variant="h6"
                color={colors.greenAccent[400]}
                fontWeight="600"
              >
                Total:
              </Typography>
              <Typography
                variant="h6"
                color={colors.greenAccent[300]}
                fontWeight="600"
              >
                ₱
                {totalAmount.toLocaleString("en", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </Typography>
            </Box>
          </Paper>

          {/* Overpayment Warning */}
          <Alert
            severity="warning"
            icon={<InfoOutlined />}
            sx={{
              mt: 2,
              backgroundColor: colors.primary[400],
              border: `1px solid ${colors.redAccent[500]}`,
            }}
          >
            <Typography variant="body2" fontWeight="600">
              Payment Application Order
            </Typography>
            <Typography variant="caption" display="block" mt={0.5}>
              1. Penalty charges (if any)
            </Typography>
            <Typography variant="caption" display="block">
              2. Interest amount
            </Typography>
            <Typography variant="caption" display="block">
              3. Principal amount
            </Typography>
            <Typography
              variant="caption"
              display="block"
              mt={1}
              color={colors.greenAccent[400]}
            >
              💡 Overpayments will automatically apply to next due installments
            </Typography>
          </Alert>
        </Box>

        {/* Account Titles Section */}
        <Box width={{ xs: "100%", md: "70%" }}>
          <Paper
            elevation={2}
            sx={{
              p: 2,
              backgroundColor: colors.greenAccent[900],
              border: `1px solid ${colors.greenAccent[700]}`,
              minHeight: 400,
            }}
          >
            <Typography
              variant="h5"
              color={colors.greenAccent[400]}
              fontWeight="600"
              mb={2}
            >
              Account Titles
            </Typography>
            <AccountTitles
              paymentData={paymentData}
              paymentDataSetter={paymentDataSetter}
            />
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};

export default PaymentAmount;
