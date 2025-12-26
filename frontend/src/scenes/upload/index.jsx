import { Box, Button, Typography, Paper, LinearProgress, Alert, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import { CloudUpload, CheckCircle, Error } from "@mui/icons-material";
import Header from "../../components/Header";
import { useState } from "react";
import axios from "axios";
import { useTheme } from "@emotion/react";
import { tokens } from "../../theme";
import api from '../utils/api';

export default function Upload() {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [results, setResults] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setResults(null);
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setResults(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await api.post('/api/upload/bulk', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setResults(response.data.results);
      setFile(null);
    } catch (error) {
      setResults({
        error: true,
        message: error.response?.data?.message || error.message
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Box p={2}>
      <Header title="BULK UPLOAD" subtitle="Upload all loan and payment data from Excel (4 sheets)" />

      <Paper sx={{ p: 3, mt: 2, backgroundColor: colors.primary[400] }}>
        <Typography variant="h4" mb={2}>Upload Complete Transaction File</Typography>
        
        <input
          accept=".xlsx,.xls"
          style={{ display: 'none' }}
          id="bulk-file-input"
          type="file"
          onChange={handleFileChange}
        />
        
        <label htmlFor="bulk-file-input">
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
          onClick={handleUpload}
          disabled={!file || uploading}
          fullWidth
          sx={{ 
            backgroundColor: colors.blueAccent[700],
            '&:hover': { backgroundColor: colors.blueAccent[800] }
          }}
        >
          {uploading ? 'Processing All Sheets...' : 'Upload All Data'}
        </Button>

        {uploading && <LinearProgress sx={{ mt: 2 }} />}
      </Paper>

      {results && !results.error && (
        <Paper sx={{ p: 3, mt: 3, backgroundColor: colors.primary[400] }}>
          <Alert severity="success" icon={<CheckCircle />} sx={{ mb: 2 }}>
            <Typography variant="h5">Upload Complete!</Typography>
          </Alert>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Sheet</TableCell>
                  <TableCell align="right">Success</TableCell>
                  <TableCell align="right">Failed</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>Loan Headers</TableCell>
                  <TableCell align="right">{results.loan_headers.success}</TableCell>
                  <TableCell align="right">{results.loan_headers.failed}</TableCell>
                  <TableCell>
                    {results.loan_headers.failed === 0 ? '✓' : '✗'}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Loan Details</TableCell>
                  <TableCell align="right">{results.loan_details.success}</TableCell>
                  <TableCell align="right">{results.loan_details.failed}</TableCell>
                  <TableCell>
                    {results.loan_details.failed === 0 ? '✓' : '✗'}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Payments</TableCell>
                  <TableCell align="right">{results.payments.success}</TableCell>
                  <TableCell align="right">{results.payments.failed}</TableCell>
                  <TableCell>
                    {results.payments.failed === 0 ? '✓' : '✗'}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Payment History</TableCell>
                  <TableCell align="right">{results.payment_history.success}</TableCell>
                  <TableCell align="right">{results.payment_history.failed}</TableCell>
                  <TableCell>
                    {results.payment_history.failed === 0 ? '✓' : '✗'}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>

          {[...results.loan_headers.errors, ...results.loan_details.errors, 
            ...results.payments.errors, ...results.payment_history.errors].length > 0 && (
            <Box mt={3}>
              <Typography variant="h6" color="error">Errors:</Typography>
              {results.loan_headers.errors.map((err, i) => (
                <Typography key={i} variant="body2" color="error">
                  Loan Header Row {err.row}: {err.error}
                </Typography>
              ))}
              {results.loan_details.errors.map((err, i) => (
                <Typography key={i} variant="body2" color="error">
                  Loan Detail Row {err.row}: {err.error}
                </Typography>
              ))}
              {results.payments.errors.map((err, i) => (
                <Typography key={i} variant="body2" color="error">
                  Payment Row {err.row}: {err.error}
                </Typography>
              ))}
              {results.payment_history.errors.map((err, i) => (
                <Typography key={i} variant="body2" color="error">
                  Payment History Row {err.row}: {err.error}
                </Typography>
              ))}
            </Box>
          )}
        </Paper>
      )}

      {results?.error && (
        <Paper sx={{ p: 3, mt: 3, backgroundColor: colors.primary[400] }}>
          <Alert severity="error" icon={<Error />}>
            <Typography variant="h5">Upload Failed</Typography>
            <Typography>{results.message}</Typography>
          </Alert>
        </Paper>
      )}

      <Paper sx={{ p: 3, mt: 3, backgroundColor: colors.primary[400] }}>
        <Typography variant="h5" mb={2}>Excel Format Requirements</Typography>
        <Typography variant="body1" mb={1}>Your Excel file must have these 4 sheets:</Typography>
        <Box component="ul" sx={{ pl: 3 }}>
          <li><Typography variant="body2"><strong>loan_header</strong> - Main loan information</Typography></li>
          <li><Typography variant="body2"><strong>loan_detail</strong> - Payment schedule details</Typography></li>
          <li><Typography variant="body2"><strong>payment</strong> - Payment records</Typography></li>
          <li><Typography variant="body2"><strong>payment_history</strong> - Payment history records</Typography></li>
        </Box>
        <Typography variant="body2" color={colors.greenAccent[400]} mt={2}>
          ℹ️ Excel IDs will be automatically mapped to database IDs during upload
        </Typography>
      </Paper>
    </Box>
  );
}