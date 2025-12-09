import { 
  Card, 
  CardContent, 
  Grid, 
  Typography, 
  Box, 
  Divider,
  CircularProgress,
  Alert,
  Chip
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import dayjs from "dayjs";
import { tokens } from "../../../theme";
import { useTheme } from "@emotion/react";
import { 
  AccountBalance, 
  CalendarToday, 
  Person, 
  Receipt,
  Warning 
} from '@mui/icons-material';

const LoanLinePaymentDetail = ({ id, paymentDataSetter }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [details, setDetails] = useState([]);
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
          throw new Error('Failed to fetch payment details');
        }

        const resJson = await req.json();

        if (!resJson || resJson.length === 0) {
          throw new Error('No payment due found for this loan');
        }

        setDetails(resJson);
      } catch (err) {
        console.error('Error fetching payment details:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    getDetail();
  }, [id]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={300}>
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

  if (details.length === 0) {
    return (
      <Alert severity="info" sx={{ mb: 2 }}>
        No payment due information available
      </Alert>
    );
  }

  const formatCurrency = (value) => {
    return Number(value || 0).toLocaleString("en", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  return (
    <Box>
      {details.map((detail) => {
        const totalDue = 
          Number(detail.Principal_Due || 0) + 
          Number(detail.Interest_Due || 0) + 
          Number(detail.Penalty_Due || 0);

        const isPenaltyPresent = Number(detail.Penalty_Due || 0) > 0;

        return (
          <Grid container spacing={2} key={detail.loan_detail_id}>
            {/* Customer Information Card */}
            <Grid item xs={12}>
              <Card
                elevation={3}
                sx={{ 
                  background: colors.greenAccent[900],
                  border: `1px solid ${colors.greenAccent[700]}`,
                }}
              >
                <CardContent>
                  <Box display="flex" alignItems="center" mb={2}>
                    <Person sx={{ mr: 1, color: colors.greenAccent[400] }} />
                    <Typography
                      variant="h6"
                      color={colors.greenAccent[400]}
                      fontWeight="600"
                    >
                      Customer Details
                    </Typography>
                  </Box>

                  <Box mb={2}>
                    <Typography 
                      variant="h4" 
                      component="div"
                      color={colors.grey[100]}
                      fontWeight="500"
                    >
                      {detail.customer_fullname || 'N/A'}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      color="text.secondary"
                      sx={{ mt: 0.5 }}
                    >
                      Borrower Name
                    </Typography>
                  </Box>

                  <Box>
                    <Typography 
                      variant="h4" 
                      component="div"
                      color={colors.grey[100]}
                      fontWeight="500"
                    >
                      {detail.pn_number || 'N/A'}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      color="text.secondary"
                      sx={{ mt: 0.5 }}
                    >
                      PN Number
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Payment Due Details Card */}
            <Grid item xs={12}>
              <Card
                elevation={3}
                sx={{ 
                  background: colors.greenAccent[900],
                  border: `1px solid ${colors.greenAccent[700]}`,
                }}
              >
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                    <Box display="flex" alignItems="center">
                      <CalendarToday sx={{ mr: 1, color: colors.greenAccent[400] }} />
                      <Typography
                        variant="h6"
                        color={colors.greenAccent[400]}
                        fontWeight="600"
                      >
                        Payment Due Details
                      </Typography>
                    </Box>
                    {isPenaltyPresent && (
                      <Chip 
                        icon={<Warning />}
                        label="Penalty Applied" 
                        color="warning" 
                        size="small"
                      />
                    )}
                  </Box>

                  <Grid container spacing={3}>
                    {/* Left Column - Payment Amounts */}
                    <Grid item xs={12} md={6}>
                      <Box mb={3}>
                        <Typography 
                          variant="h4" 
                          component="div"
                          color={colors.grey[100]}
                          fontWeight="500"
                        >
                          {dayjs(detail.due_date).format("MMMM DD, YYYY")}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                          Due Date
                        </Typography>
                      </Box>

                      <Divider sx={{ my: 2, borderColor: colors.greenAccent[700] }} />

                      <Box mb={2}>
                        <Typography 
                          variant="h5" 
                          component="div"
                          color={colors.grey[100]}
                        >
                          ₱{formatCurrency(detail.Principal_Due)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                          Principal Due
                        </Typography>
                      </Box>

                      <Box mb={2}>
                        <Typography 
                          variant="h5" 
                          component="div"
                          color={colors.grey[100]}
                        >
                          ₱{formatCurrency(detail.Interest_Due)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                          Interest Due
                        </Typography>
                      </Box>

                      {isPenaltyPresent && (
                        <Box mb={2}>
                          <Typography 
                            variant="h5" 
                            component="div"
                            color={colors.redAccent[400]}
                          >
                            ₱{formatCurrency(detail.Penalty_Due)}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                            Penalty
                          </Typography>
                        </Box>
                      )}

                      <Divider sx={{ my: 2, borderColor: colors.greenAccent[700] }} />

                      <Box>
                        <Typography 
                          variant="h4" 
                          component="div"
                          color={colors.greenAccent[300]}
                          fontWeight="600"
                        >
                          ₱{formatCurrency(totalDue)}
                        </Typography>
                        <Typography variant="body2" color={colors.greenAccent[400]} sx={{ mt: 0.5 }}>
                          Total Amount Due
                        </Typography>
                      </Box>
                    </Grid>

                    {/* Right Column - Check Details */}
                    <Grid item xs={12} md={6}>
                      <Box 
                        p={2} 
                        sx={{ 
                          backgroundColor: colors.greenAccent[900],
                          borderRadius: 1,
                          border: `1px solid ${colors.greenAccent[700]}`,
                        }}
                      >
                        <Box display="flex" alignItems="center" mb={2}>
                          <AccountBalance sx={{ mr: 1, color: colors.greenAccent[400] }} />
                          <Typography
                            variant="h6"
                            color={colors.greenAccent[400]}
                            fontWeight="600"
                          >
                            Check Information
                          </Typography>
                        </Box>

                        <Box mb={3}>
                          <Typography 
                            variant="h5" 
                            component="div"
                            color={colors.grey[100]}
                          >
                            {detail.bank_name || 'N/A'}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                            Bank PDC
                          </Typography>
                        </Box>

                        <Box>
                          <Box display="flex" alignItems="center" mb={1}>
                            <Receipt sx={{ mr: 1, fontSize: 20, color: colors.grey[400] }} />
                            <Typography 
                              variant="h5" 
                              component="div"
                              color={colors.grey[100]}
                            >
                              {detail.check_number || 'N/A'}
                            </Typography>
                          </Box>
                          <Typography variant="body2" color="text.secondary">
                            Check Number
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        );
      })}
    </Box>
  );
};

export default LoanLinePaymentDetail;