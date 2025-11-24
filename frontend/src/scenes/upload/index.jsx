import {
  Box,
  Button,
  Typography,
  Paper,
  LinearProgress,
  Alert,
} from "@mui/material";
import { CloudUpload, CheckCircle, Error } from "@mui/icons-material";
import Header from "../../components/Header";
import { useState } from "react";
import axios from "axios";
import { useTheme } from "@emotion/react";
import { tokens } from "../../theme";

export default function Upload() {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [loanFile, setLoanFile] = useState(null);
  const [paymentFile, setPaymentFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [results, setResults] = useState(null);

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (type === "loan") {
      setLoanFile(file);
    } else {
      setPaymentFile(file);
    }
    setResults(null);
  };

  const handleUpload = async (type) => {
    const file = type === "loan" ? loanFile : paymentFile;
    if (!file) return;

    setUploading(true);
    setResults(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post(`/api/upload/${type}s`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setResults({
        type,
        success: true,
        data: response.data.results,
      });

      // Clear file input
      if (type === "loan") setLoanFile(null);
      else setPaymentFile(null);
    } catch (error) {
      setResults({
        type,
        success: false,
        message: error.response?.data?.message || error.message,
      });
    } finally {
      setUploading(false);
    }
  };

  const UploadCard = ({ title, type, file, onChange, onUpload }) => (
    <Paper sx={{ p: 3, backgroundColor: colors.primary[400] }}>
      <Typography variant="h4" mb={2}>
        {title}
      </Typography>

      <input
        accept=".xlsx,.xls"
        style={{ display: "none" }}
        id={`${type}-file-input`}
        type="file"
        onChange={(e) => onChange(e, type)}
      />

      <label htmlFor={`${type}-file-input`}>
        <Button
          variant="outlined"
          component="span"
          startIcon={<CloudUpload />}
          fullWidth
          sx={{ mb: 2 }}
        >
          Select Excel File
        </Button>
      </label>

      {file && (
        <Box mb={2}>
          <Typography variant="body2" color={colors.greenAccent[400]}>
            Selected: {file.name}
          </Typography>
        </Box>
      )}

      <Button
        variant="contained"
        onClick={() => onUpload(type)}
        disabled={!file || uploading}
        fullWidth
        sx={{
          backgroundColor: colors.blueAccent[700],
          "&:hover": { backgroundColor: colors.blueAccent[800] },
        }}
      >
        {uploading ? "Uploading..." : "Upload"}
      </Button>

      {uploading && <LinearProgress sx={{ mt: 2 }} />}
    </Paper>
  );

  return (
    <Box p={2}>
      <Header
        title="UPLOAD TRANSACTIONS"
        subtitle="Upload loan and payment data from Excel"
      />

      <Box
        display="grid"
        gridTemplateColumns="repeat(auto-fit, minmax(400px, 1fr))"
        gap={3}
        mt={2}
      >
        <UploadCard
          title="Upload Loan Transactions"
          type="loan"
          file={loanFile}
          onChange={handleFileChange}
          onUpload={handleUpload}
        />

        <UploadCard
          title="Upload Payment Transactions"
          type="payment"
          file={paymentFile}
          onChange={handleFileChange}
          onUpload={handleUpload}
        />
      </Box>

      {results && (
        <Paper sx={{ p: 3, mt: 3, backgroundColor: colors.primary[400] }}>
          <Alert
            severity={results.success ? "success" : "error"}
            icon={results.success ? <CheckCircle /> : <Error />}
          >
            <Typography variant="h5" mb={1}>
              {results.success ? "Upload Complete" : "Upload Failed"}
            </Typography>

            {results.data && (
              <Box>
                <Typography>
                  ✓ Success: {results.data.success} records
                </Typography>
                <Typography>✗ Failed: {results.data.failed} records</Typography>

                {results.data.errors.length > 0 && (
                  <Box mt={2}>
                    <Typography variant="h6">Errors:</Typography>
                    {results.data.errors.slice(0, 5).map((err, idx) => (
                      <Typography key={idx} variant="body2">
                        Row {err.row}: {err.error}
                      </Typography>
                    ))}
                    {results.data.errors.length > 5 && (
                      <Typography variant="body2">
                        ... and {results.data.errors.length - 5} more errors
                      </Typography>
                    )}
                  </Box>
                )}
              </Box>
            )}

            {!results.success && results.message && (
              <Typography>{results.message}</Typography>
            )}
          </Alert>
        </Paper>
      )}

      <Paper sx={{ p: 3, mt: 3, backgroundColor: colors.primary[400] }}>
        <Typography variant="h5" mb={2}>
          Excel Format Guidelines
        </Typography>

        <Box mb={2}>
          <Typography variant="h6" color={colors.greenAccent[400]}>
            Loan Transactions Required Columns:
          </Typography>
          <Typography variant="body2">
            DATE, PN NUMBER, BORROWER'S NAME, VOUCHER, PRINCIPAL, RATE, TERM,
            DATE GRANTED, CHECK, STATUS
          </Typography>
        </Box>

        <Box>
          <Typography variant="h6" color={colors.blueAccent[400]}>
            Payment Transactions Required Columns:
          </Typography>
          <Typography variant="body2">
            DATE, PR, PN NUMBER, MODE OF PAYMENT, CHECK DETAILS, PRINCIPAL,
            INTEREST, HOLD CHARGE (PENALTY), TOTAL PAYMENT
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
}
