import { useState, useEffect } from "react";
import {
  Box,
  Button,
  Grid,
  Card,
  CardContent,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  useTheme,
  Tooltip,
  Chip,
  Divider,
} from "@mui/material";
import {
  ExpandMore,
  FileDownloadOutlined,
  SearchOutlined,
  RefreshOutlined,
  PrintOutlined,
} from "@mui/icons-material";
import { DataGrid } from "@mui/x-data-grid";
import { tokens } from "../../../theme";
import { useReceivables } from "../../../hooks/useReceivables";
import { toast, Bounce } from "react-toastify";
import dayjs from "dayjs";
import SearchInputForm from "../../../components/FormUI/SearchInputForm";

export default function ReceivablesReport() {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const { getReceivablesReport, exportReceivables, loading } = useReceivables();

  const [reportData, setReportData] = useState(null);
  const [filteredData, setFilteredData] = useState(null);
  const [expandedCustomer, setExpandedCustomer] = useState(false);
  const [filters, setFilters] = useState({
    filterType: "asOf",
    from: "",
    to: "",
    asOf: dayjs().format("YYYY-MM-DD"),
    groupBy: "customer",
  });

  const loadReport = async () => {
    try {
      const filterParams = {};

      if (filters.filterType === "range") {
        if (!filters.from || !filters.to) {
          toast.error("Please provide both From and To dates", {
            position: "top-right",
            autoClose: 3000,
            theme: "colored",
            transition: Bounce,
          });
          return;
        }
        filterParams.from = filters.from;
        filterParams.to = filters.to;
      } else {
        if (!filters.asOf) {
          toast.error("Please provide As Of date", {
            position: "top-right",
            autoClose: 3000,
            theme: "colored",
            transition: Bounce,
          });
          return;
        }
        filterParams.asOf = filters.asOf;
      }

      const data = await getReceivablesReport(filterParams);
      setReportData(data);
      setFilteredData(data);

      toast.success("Report generated successfully!", {
        position: "top-right",
        autoClose: 2000,
        theme: "colored",
        transition: Bounce,
      });
    } catch (error) {
      console.error("Error loading report:", error);
      toast.error(error.message || "Failed to load report", {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
        transition: Bounce,
      });
    }
  };

  const handleSearch = (searchTerm) => {
    if (!reportData || !searchTerm) {
      setFilteredData(reportData);
      return;
    }

    const filtered = {
      ...reportData,
      data: reportData.data.filter(
        (customer) =>
          customer.customer_name
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          customer.phone_number?.includes(searchTerm) ||
          customer.address?.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    };

    // Recalculate summary for filtered data
    filtered.summary = {
      ...reportData.summary,
      total_customers: filtered.data.length,
      total_loans: filtered.data.reduce(
        (sum, c) => sum + Number(c.total_loans),
        0
      ),
      total_principal_receivable: filtered.data
        .reduce((sum, c) => sum + Number(c.principal_receivable), 0)
        .toFixed(2),
      total_interest_receivable: filtered.data
        .reduce((sum, c) => sum + Number(c.interest_receivable), 0)
        .toFixed(2),
      total_penalty_receivable: filtered.data
        .reduce((sum, c) => sum + Number(c.penalty_receivable), 0)
        .toFixed(2),
      total_receivable: filtered.data
        .reduce((sum, c) => sum + Number(c.total_receivable), 0)
        .toFixed(2),
    };

    setFilteredData(filtered);
  };

  const handleExport = async () => {
    try {
      const filterParams = {};

      if (filters.filterType === "range") {
        filterParams.from = filters.from;
        filterParams.to = filters.to;
      } else {
        filterParams.asOf = filters.asOf;
      }

      const data = await exportReceivables(filterParams);

      if (data.success && data.data.length > 0) {
        const headers = Object.keys(data.data[0]);
        const csvContent = [
          headers.join(","),
          ...data.data.map((row) =>
            headers.map((header) => `"${row[header] || ""}"`).join(",")
          ),
        ].join("\n");

        const blob = new Blob([csvContent], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `receivables_report_${dayjs().format("YYYY-MM-DD")}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);

        toast.success("Report exported successfully!", {
          position: "top-right",
          autoClose: 2000,
          theme: "colored",
          transition: Bounce,
        });
      }
    } catch (error) {
      console.error("Error exporting report:", error);
      toast.error(error.message || "Failed to export report", {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
        transition: Bounce,
      });
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleAccordionChange = (customerId) => (event, isExpanded) => {
    setExpandedCustomer(isExpanded ? customerId : false);
  };

  const loanColumns = [
    { field: "pn_number", headerName: "PN Number", flex: 1 },
    {
      field: "date_granted",
      headerName: "Date Granted",
      flex: 1,
      valueFormatter: (params) => dayjs(params.value).format("MM/DD/YYYY"),
    },
    {
      field: "status_code",
      headerName: "Status",
      flex: 0.8,
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          color={params.value === "Active" ? "success" : "warning"}
          sx={{ fontWeight: "bold" }}
        />
      ),
    },
    {
      field: "principal_balance",
      headerName: "Principal",
      flex: 1,
      align: "right",
      headerAlign: "right",
      valueFormatter: (params) =>
        `₱${Number(params.value).toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`,
    },
    {
      field: "interest_balance",
      headerName: "Interest",
      flex: 1,
      align: "right",
      headerAlign: "right",
      valueFormatter: (params) =>
        `₱${Number(params.value).toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`,
    },
    {
      field: "penalty_balance",
      headerName: "Penalty",
      flex: 1,
      align: "right",
      headerAlign: "right",
      valueFormatter: (params) =>
        `₱${Number(params.value).toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`,
    },
    {
      field: "total",
      headerName: "Total",
      flex: 1,
      align: "right",
      headerAlign: "right",
      valueGetter: (params) => {
        const principal = Number(params.row.principal_balance) || 0;
        const interest = Number(params.row.interest_balance) || 0;
        const penalty = Number(params.row.penalty_balance) || 0;
        return principal + interest + penalty;
      },
      valueFormatter: (params) =>
        `₱${Number(params.value).toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`,
      renderCell: (params) => (
        <Typography fontWeight="bold" color={colors.greenAccent[400]}>
          {params.formattedValue}
        </Typography>
      ),
    },
  ];

  const displayData = filteredData || reportData;

  return (
    <Box height="100%" display="flex" flexDirection="column" gap={2}>
      {/* Filter Section */}
      <Card sx={{ backgroundColor: colors.greenAccent[900] }}>
        <CardContent>
          <Box
            display="flex"
            flexDirection={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", sm: "center" }}
            gap={2}
            mb={2}
          >
            <Typography variant="h5" color={colors.grey[100]} fontWeight="bold">
              Report Filters
            </Typography>
            {displayData && (
              <Box width={{ xs: "100%", sm: "auto" }}>
                <SearchInputForm
                  submit={(searchTerm) => handleSearch(searchTerm)}
                  name="customerSearch"
                  placeholder="Search customer name, phone, or address..."
                  size="small"
                />
              </Box>
            )}
          </Box>

          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel sx={{ color: colors.grey[100] }}>
                  Filter Type
                </InputLabel>
                <Select
                  value={filters.filterType}
                  label="Filter Type"
                  onChange={(e) =>
                    setFilters({ ...filters, filterType: e.target.value })
                  }
                  sx={{
                    color: colors.grey[100],
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: colors.greenAccent[600],
                    },
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: colors.greenAccent[500],
                    },
                  }}
                >
                  <MenuItem value="asOf">As Of Date</MenuItem>
                  <MenuItem value="range">Date Range</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {filters.filterType === "range" ? (
              <>
                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    label="From Date"
                    type="date"
                    value={filters.from}
                    onChange={(e) =>
                      setFilters({ ...filters, from: e.target.value })
                    }
                    InputLabelProps={{ shrink: true }}
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
                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    label="To Date"
                    type="date"
                    value={filters.to}
                    onChange={(e) =>
                      setFilters({ ...filters, to: e.target.value })
                    }
                    InputLabelProps={{ shrink: true }}
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
              </>
            ) : (
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label="As Of Date"
                  type="date"
                  value={filters.asOf}
                  onChange={(e) =>
                    setFilters({ ...filters, asOf: e.target.value })
                  }
                  InputLabelProps={{ shrink: true }}
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

            <Grid item xs={12}>
              <Box
                display="flex"
                flexWrap="wrap"
                gap={1.5}
                mt={{ xs: 2, md: 0 }}
              >
                <Tooltip title="Generate Report" placement="top">
                  <Button
                    variant="contained"
                    startIcon={
                      loading ? (
                        <CircularProgress size={20} />
                      ) : (
                        <SearchOutlined />
                      )
                    }
                    onClick={loadReport}
                    disabled={loading}
                    fullWidth={false}
                    sx={{
                      backgroundColor: colors.greenAccent[700],
                      color: colors.grey[100],
                      minWidth: { xs: "100%", sm: "auto" },
                      "&:hover": {
                        backgroundColor: colors.greenAccent[600],
                      },
                    }}
                  >
                    Generate
                  </Button>
                </Tooltip>
                <Tooltip
                  title={
                    !displayData ? "Generate report first" : "Export to CSV"
                  }
                  placement="top"
                >
                  <span style={{ flex: "0 0 auto", minWidth: "0" }}>
                    <Button
                      variant="outlined"
                      startIcon={<FileDownloadOutlined />}
                      onClick={handleExport}
                      disabled={!displayData || loading}
                      sx={{
                        borderColor: colors.greenAccent[600],
                        color: colors.grey[100],
                        minWidth: { xs: "100%", sm: "auto" },
                        "&:hover": {
                          borderColor: colors.greenAccent[500],
                          backgroundColor: colors.greenAccent[800],
                        },
                      }}
                    >
                      Export
                    </Button>
                  </span>
                </Tooltip>
                <Tooltip
                  title={
                    !displayData ? "Generate report first" : "Print Report"
                  }
                  placement="top"
                >
                  <span style={{ flex: "0 0 auto", minWidth: "0" }}>
                    <Button
                      variant="outlined"
                      startIcon={<PrintOutlined />}
                      onClick={handlePrint}
                      disabled={!displayData || loading}
                      sx={{
                        borderColor: colors.greenAccent[600],
                        color: colors.grey[100],
                        minWidth: { xs: "100%", sm: "auto" },
                        "&:hover": {
                          borderColor: colors.greenAccent[500],
                          backgroundColor: colors.greenAccent[800],
                        },
                      }}
                    >
                      Print
                    </Button>
                  </span>
                </Tooltip>
                <Tooltip title="Refresh" placement="top">
                  <Button
                    variant="outlined"
                    startIcon={<RefreshOutlined />}
                    onClick={loadReport}
                    disabled={loading}
                    sx={{
                      borderColor: colors.greenAccent[600],
                      color: colors.grey[100],
                      minWidth: { xs: "100%", sm: "auto" },
                      "&:hover": {
                        borderColor: colors.greenAccent[500],
                        backgroundColor: colors.greenAccent[800],
                      },
                    }}
                  >
                    Refresh
                  </Button>
                </Tooltip>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      {displayData && displayData.summary && (
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={4} lg={2.4}>
            <Card sx={{ backgroundColor: colors.greenAccent[800] }}>
              <CardContent>
                <Typography variant="h6" color={colors.grey[300]}>
                  Total Customers
                </Typography>
                <Typography
                  variant="h3"
                  color={colors.greenAccent[400]}
                  fontWeight="bold"
                >
                  {displayData.summary.total_customers || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={2.4}>
            <Card sx={{ backgroundColor: colors.greenAccent[800] }}>
              <CardContent>
                <Typography variant="h6" color={colors.grey[300]}>
                  Total Loans
                </Typography>
                <Typography
                  variant="h3"
                  color={colors.greenAccent[400]}
                  fontWeight="bold"
                >
                  {displayData.summary.total_loans || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={2.4}>
            <Card sx={{ backgroundColor: colors.greenAccent[800] }}>
              <CardContent>
                <Typography variant="h6" color={colors.grey[300]}>
                  Principal Receivable
                </Typography>
                <Typography
                  variant="h4"
                  color={colors.greenAccent[400]}
                  fontWeight="bold"
                >
                  ₱
                  {Number(
                    displayData.summary.total_principal_receivable || 0
                  ).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={2.4}>
            <Card sx={{ backgroundColor: colors.greenAccent[800] }}>
              <CardContent>
                <Typography variant="h6" color={colors.grey[300]}>
                  Interest Receivable
                </Typography>
                <Typography
                  variant="h4"
                  color={colors.greenAccent[400]}
                  fontWeight="bold"
                >
                  ₱
                  {Number(
                    displayData.summary.total_interest_receivable || 0
                  ).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={2.4}>
            <Card sx={{ backgroundColor: colors.greenAccent[800] }}>
              <CardContent>
                <Typography variant="h6" color={colors.grey[300]}>
                  Total Receivable
                </Typography>
                <Typography
                  variant="h3"
                  color={colors.blueAccent[400]}
                  fontWeight="bold"
                >
                  ₱
                  {Number(
                    displayData.summary.total_receivable || 0
                  ).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Customer Details */}
      {displayData && displayData.data && displayData.data.length > 0 ? (
        <Box flex={1} overflow="auto">
          <Card sx={{ backgroundColor: colors.greenAccent[900] }}>
            <CardContent>
              <Typography
                variant="h5"
                color={colors.grey[100]}
                fontWeight="bold"
                mb={2}
              >
                Customer Details ({displayData.data.length} customers)
              </Typography>
              <Divider sx={{ mb: 2, borderColor: colors.greenAccent[700] }} />
              {displayData.data.map((customer) => (
                <Accordion
                  key={customer.customer_id}
                  expanded={expandedCustomer === customer.customer_id}
                  onChange={handleAccordionChange(customer.customer_id)}
                  sx={{
                    backgroundColor: colors.greenAccent[800],
                    mb: 1,
                    "&:before": { display: "none" },
                  }}
                >
                  <AccordionSummary
                    expandIcon={<ExpandMore sx={{ color: colors.grey[100] }} />}
                    sx={{
                      "& .MuiAccordionSummary-content": {
                        justifyContent: "space-between",
                        alignItems: "center",
                      },
                    }}
                  >
                    <Box>
                      <Typography
                        variant="h6"
                        color={colors.grey[100]}
                        fontWeight="bold"
                      >
                        {customer.customer_name}
                      </Typography>
                      <Typography variant="body2" color={colors.grey[300]}>
                        📞 {customer.phone_number} • 📍 {customer.address}
                      </Typography>
                    </Box>
                    <Box textAlign="right" mr={2}>
                      <Typography variant="body2" color={colors.grey[300]}>
                        {customer.total_loans}{" "}
                        {customer.total_loans > 1 ? "Loans" : "Loan"}
                      </Typography>
                      <Typography
                        variant="h6"
                        color={colors.greenAccent[400]}
                        fontWeight="bold"
                      >
                        ₱
                        {Number(customer.total_receivable).toLocaleString(
                          "en-US",
                          { minimumFractionDigits: 2 }
                        )}
                      </Typography>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails
                    sx={{ backgroundColor: colors.greenAccent[900], p: 2 }}
                  >
                    <Box height={350}>
                      <DataGrid
                        rows={customer.loans || []}
                        columns={loanColumns}
                        getRowId={(row) => row.loan_header_id}
                        disableSelectionOnClick
                        hideFooter
                        sx={{
                          "& .MuiDataGrid-cell": {
                            borderBottom: `1px solid ${colors.greenAccent[700]}`,
                          },
                          "& .MuiDataGrid-columnHeaders": {
                            backgroundColor: colors.greenAccent[800],
                            borderBottom: `2px solid ${colors.greenAccent[700]}`,
                            fontWeight: "bold",
                          },
                        }}
                      />
                    </Box>
                  </AccordionDetails>
                </Accordion>
              ))}
            </CardContent>
          </Card>
        </Box>
      ) : displayData && displayData.data && displayData.data.length === 0 ? (
        <Card sx={{ backgroundColor: colors.greenAccent[900] }}>
          <CardContent>
            <Typography
              variant="h6"
              color={colors.grey[300]}
              textAlign="center"
              py={4}
            >
              No receivables found for the selected period.
            </Typography>
          </CardContent>
        </Card>
      ) : !displayData ? (
        <Card sx={{ backgroundColor: colors.greenAccent[900] }}>
          <CardContent>
            <Typography
              variant="h6"
              color={colors.grey[300]}
              textAlign="center"
              py={4}
            >
              Click "Generate" to load the receivables report.
            </Typography>
          </CardContent>
        </Card>
      ) : null}
    </Box>
  );
}
