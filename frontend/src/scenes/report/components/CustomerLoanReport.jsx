import { useState } from 'react'
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  useTheme,
  Tooltip,
  Chip,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from '@mui/material'
import {
  ExpandMore,
  SearchOutlined,
  CloseOutlined,
  PrintOutlined,
  ReceiptLongOutlined,
} from '@mui/icons-material'
import { DataGrid } from '@mui/x-data-grid'
import { tokens } from '../../../theme'
import { useCustomerLoanReport } from '../../../hooks/useCustomerLoanReport'
import { toast, Bounce } from 'react-toastify'
import dayjs from 'dayjs'
import SearchInputForm from '../../../components/FormUI/SearchInputForm'

export default function CustomerLoanReport() {
  const theme = useTheme()
  const colors = tokens(theme.palette.mode)
  const { searchCustomerLoans, getLoanDetails, loading } = useCustomerLoanReport()

  const [searchResults, setSearchResults] = useState(null)
  const [expandedCustomer, setExpandedCustomer] = useState(false)
  const [selectedLoan, setSelectedLoan] = useState(null)
  const [loanDetailsOpen, setLoanDetailsOpen] = useState(false)

  // Handle customer search
  const handleSearch = async (searchTerm) => {
    if (!searchTerm || searchTerm.trim() === '') {
      toast.warning('Please enter a customer name to search', {
        position: 'top-right',
        autoClose: 2000,
        theme: 'colored',
        transition: Bounce,
      })
      return
    }

    try {
      const data = await searchCustomerLoans(searchTerm)
      setSearchResults(data)

      if (data.count === 0) {
        toast.info('No customers found with that name', {
          position: 'top-right',
          autoClose: 2000,
          theme: 'colored',
          transition: Bounce,
        })
      } else {
        toast.success(`Found ${data.count} customer(s)`, {
          position: 'top-right',
          autoClose: 2000,
          theme: 'colored',
          transition: Bounce,
        })
      }
    } catch (error) {
      console.error('Error searching customers:', error)
      toast.error(error.message || 'Failed to search customers', {
        position: 'top-right',
        autoClose: 3000,
        theme: 'colored',
        transition: Bounce,
      })
    }
  }

  // Handle loan click to view details
  const handleLoanClick = async (loanHeaderId) => {
    try {
      const data = await getLoanDetails(loanHeaderId)
      setSelectedLoan(data.data)
      setLoanDetailsOpen(true)
    } catch (error) {
      console.error('Error fetching loan details:', error)
      toast.error(error.message || 'Failed to fetch loan details', {
        position: 'top-right',
        autoClose: 3000,
        theme: 'colored',
        transition: Bounce,
      })
    }
  }

  const handleAccordionChange = (customerId) => (event, isExpanded) => {
    setExpandedCustomer(isExpanded ? customerId : false)
  }

  const handleCloseDialog = () => {
    setLoanDetailsOpen(false)
    setSelectedLoan(null)
  }

  const handlePrintLoanDetails = () => {
    window.print()
  }

  // Columns for customer loans list
  const loanColumns = [
    { field: 'pn_number', headerName: 'PN Number', flex: 1 },
    {
      field: 'date_granted',
      headerName: 'Date Granted',
      flex: 1,
      valueFormatter: (params) => dayjs(params.value).format('MM/DD/YYYY'),
    },
    {
      field: 'loan_category',
      headerName: 'Category',
      flex: 1,
    },
    {
      field: 'principal_amount',
      headerName: 'Principal',
      flex: 1,
      align: 'right',
      headerAlign: 'right',
      valueFormatter: (params) =>
        `₱${Number(params.value).toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`,
    },
    {
      field: 'principal_balance',
      headerName: 'Balance',
      flex: 1,
      align: 'right',
      headerAlign: 'right',
      valueFormatter: (params) =>
        `₱${Number(params.value).toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`,
    },
    {
      field: 'loan_status',
      headerName: 'Status',
      flex: 0.8,
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          color={params.value === 'COMPLETED' ? 'success' : 'warning'}
          sx={{ fontWeight: 'bold' }}
        />
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      flex: 0.8,
      sortable: false,
      renderCell: (params) => (
        <Button
          size="small"
          variant="outlined"
          startIcon={<ReceiptLongOutlined />}
          onClick={() => handleLoanClick(params.row.loan_header_id)}
          sx={{
            borderColor: colors.greenAccent[600],
            color: colors.grey[100],
            '&:hover': {
              borderColor: colors.greenAccent[500],
              backgroundColor: colors.greenAccent[800],
            },
          }}
        >
          Details
        </Button>
      ),
    },
  ]

  // Columns for loan payment schedule
  const scheduleColumns = [
    {
      field: 'due_date',
      headerName: 'Due Date',
      flex: 1,
      valueFormatter: (params) => dayjs(params.value).format('MM/DD/YYYY'),
    },
    {
      field: 'monthly_principal',
      headerName: 'Principal',
      flex: 1,
      align: 'right',
      headerAlign: 'right',
      valueFormatter: (params) =>
        `₱${Number(params.value).toLocaleString('en-US', {
          minimumFractionDigits: 2,
        })}`,
    },
    {
      field: 'monthly_interest',
      headerName: 'Interest',
      flex: 1,
      align: 'right',
      headerAlign: 'right',
      valueFormatter: (params) =>
        `₱${Number(params.value).toLocaleString('en-US', {
          minimumFractionDigits: 2,
        })}`,
    },
    {
      field: 'paid_principal',
      headerName: 'Paid Principal',
      flex: 1,
      align: 'right',
      headerAlign: 'right',
      valueFormatter: (params) =>
        `₱${Number(params.value).toLocaleString('en-US', {
          minimumFractionDigits: 2,
        })}`,
    },
    {
      field: 'paid_interest',
      headerName: 'Paid Interest',
      flex: 1,
      align: 'right',
      headerAlign: 'right',
      valueFormatter: (params) =>
        `₱${Number(params.value).toLocaleString('en-US', {
          minimumFractionDigits: 2,
        })}`,
    },
    {
      field: 'check_numbers',
      headerName: 'Check Numbers',
      flex: 1.2,
      renderCell: (params) => (
        <Typography variant="body2" color={colors.grey[100]}>
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'payment_status',
      headerName: 'Status',
      flex: 0.8,
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          color={
            params.value === 'PAID'
              ? 'success'
              : params.value === 'PARTIAL'
              ? 'warning'
              : 'error'
          }
          sx={{ fontWeight: 'bold' }}
        />
      ),
    },
  ]

  // Columns for payment history
  const paymentColumns = [
    {
      field: 'payment_date',
      headerName: 'Payment Date',
      flex: 1,
      valueFormatter: (params) => dayjs(params.value).format('MM/DD/YYYY'),
    },
    {
      field: 'payment_principal',
      headerName: 'Principal',
      flex: 1,
      align: 'right',
      headerAlign: 'right',
      valueFormatter: (params) =>
        `₱${Number(params.value).toLocaleString('en-US', {
          minimumFractionDigits: 2,
        })}`,
    },
    {
      field: 'payment_interest',
      headerName: 'Interest',
      flex: 1,
      align: 'right',
      headerAlign: 'right',
      valueFormatter: (params) =>
        `₱${Number(params.value).toLocaleString('en-US', {
          minimumFractionDigits: 2,
        })}`,
    },
    {
      field: 'payment_penalty',
      headerName: 'Penalty',
      flex: 1,
      align: 'right',
      headerAlign: 'right',
      valueFormatter: (params) =>
        `₱${Number(params.value).toLocaleString('en-US', {
          minimumFractionDigits: 2,
        })}`,
    },
    {
      field: 'payment_type',
      headerName: 'Type',
      flex: 0.8,
    },
    {
      field: 'check_no',
      headerName: 'Check #',
      flex: 1,
    },
    {
      field: 'payment_receipt',
      headerName: 'Receipt #',
      flex: 1,
    },
  ]

  return (
    <Box height="100%" display="flex" flexDirection="column" gap={2}>
      {/* Search Section */}
      <Card sx={{ backgroundColor: colors.greenAccent[900] }}>
        <CardContent>
          <Box
            display="flex"
            flexDirection={{ xs: 'column', sm: 'row' }}
            justifyContent="space-between"
            alignItems={{ xs: 'flex-start', sm: 'center' }}
            gap={2}
            mb={2}
          >
            <Typography variant="h5" color={colors.grey[100]} fontWeight="bold">
              Customer Loan Search
            </Typography>
          </Box>

          <Box width="100%">
            <SearchInputForm
              submit={(searchTerm) => handleSearch(searchTerm)}
              name="customerLoanSearch"
              placeholder="Search customer name (e.g., Juan Dela Cruz)..."
              size="medium"
            />
          </Box>

          <Typography
            variant="body2"
            color={colors.grey[300]}
            mt={1}
            fontStyle="italic"
          >
            💡 Tip: Enter the customer's first name, last name, or full name to
            search
          </Typography>
        </CardContent>
      </Card>

      {/* Search Results */}
      {loading && (
        <Card sx={{ backgroundColor: colors.greenAccent[900] }}>
          <CardContent>
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress sx={{ color: colors.greenAccent[400] }} />
            </Box>
          </CardContent>
        </Card>
      )}

      {!loading &&
        searchResults &&
        searchResults.data &&
        searchResults.data.length > 0 && (
          <Box flex={1} overflow="auto">
            <Card sx={{ backgroundColor: colors.greenAccent[900] }}>
              <CardContent>
                <Typography
                  variant="h5"
                  color={colors.grey[100]}
                  fontWeight="bold"
                  mb={2}
                >
                  Search Results ({searchResults.count} customer(s) found)
                </Typography>
                <Divider
                  sx={{ mb: 2, borderColor: colors.greenAccent[700] }}
                />
                {searchResults.data.map((customer) => (
                  <Accordion
                    key={customer.customer_id}
                    expanded={expandedCustomer === customer.customer_id}
                    onChange={handleAccordionChange(customer.customer_id)}
                    sx={{
                      backgroundColor: colors.greenAccent[800],
                      mb: 1,
                      '&:before': { display: 'none' },
                    }}
                  >
                    <AccordionSummary
                      expandIcon={
                        <ExpandMore sx={{ color: colors.grey[100] }} />
                      }
                      sx={{
                        '& .MuiAccordionSummary-content': {
                          justifyContent: 'space-between',
                          alignItems: 'center',
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
                          📞 {customer.contactno} • 📍 {customer.address}
                        </Typography>
                      </Box>
                      <Box textAlign="right" mr={2}>
                        <Typography variant="body2" color={colors.grey[300]}>
                          {customer.loans.length}{' '}
                          {customer.loans.length > 1 ? 'Loans' : 'Loan'}
                        </Typography>
                        <Chip
                          label={`${
                            customer.loans.filter(
                              (l) => l.loan_status === 'ONGOING'
                            ).length
                          } Ongoing`}
                          size="small"
                          sx={{
                            backgroundColor: colors.greenAccent[700],
                            color: colors.grey[100],
                            fontWeight: 'bold',
                          }}
                        />
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails
                      sx={{ backgroundColor: colors.greenAccent[900], p: 2 }}
                    >
                      <Box height={400}>
                        <DataGrid
                          rows={customer.loans || []}
                          columns={loanColumns}
                          getRowId={(row) => row.loan_header_id}
                          disableSelectionOnClick
                          hideFooter
                          sx={{
                            '& .MuiDataGrid-cell': {
                              borderBottom: `1px solid ${colors.greenAccent[700]}`,
                            },
                            '& .MuiDataGrid-columnHeaders': {
                              backgroundColor: colors.greenAccent[800],
                              borderBottom: `2px solid ${colors.greenAccent[700]}`,
                              fontWeight: 'bold',
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
        )}

      {!loading && searchResults && searchResults.data.length === 0 && (
        <Card sx={{ backgroundColor: colors.greenAccent[900] }}>
          <CardContent>
            <Typography
              variant="h6"
              color={colors.grey[300]}
              textAlign="center"
              py={4}
            >
              No customers found with that name. Try a different search term.
            </Typography>
          </CardContent>
        </Card>
      )}

      {!loading && !searchResults && (
        <Card sx={{ backgroundColor: colors.greenAccent[900] }}>
          <CardContent>
            <Typography
              variant="h6"
              color={colors.grey[300]}
              textAlign="center"
              py={4}
            >
              🔍 Search for a customer to view their loan history
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* Loan Details Dialog */}
      <Dialog
        open={loanDetailsOpen}
        onClose={handleCloseDialog}
        maxWidth="xl"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: colors.greenAccent[900],
            minHeight: '80vh',
          },
        }}
      >
        <DialogTitle
          sx={{
            backgroundColor: colors.greenAccent[800],
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Typography variant="h5" fontWeight="bold" color={colors.grey[100]}>
            Loan Details
          </Typography>
          <Box display="flex" gap={1}>
            <Tooltip title="Print">
              <IconButton
                onClick={handlePrintLoanDetails}
                sx={{ color: colors.grey[100] }}
              >
                <PrintOutlined />
              </IconButton>
            </Tooltip>
            <Tooltip title="Close">
              <IconButton
                onClick={handleCloseDialog}
                sx={{ color: colors.grey[100] }}
              >
                <CloseOutlined />
              </IconButton>
            </Tooltip>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          {selectedLoan && (
            <Box display="flex" flexDirection="column" gap={3}>
              {/* Loan Header Info */}
              <Card sx={{ backgroundColor: colors.greenAccent[800] }}>
                <CardContent>
                  <Typography
                    variant="h6"
                    color={colors.grey[100]}
                    fontWeight="bold"
                    mb={2}
                  >
                    Loan Information
                  </Typography>
                  <Box
                    display="grid"
                    gridTemplateColumns="repeat(auto-fit, minmax(200px, 1fr))"
                    gap={2}
                  >
                    <Box>
                      <Typography variant="body2" color={colors.grey[300]}>
                        PN Number
                      </Typography>
                      <Typography
                        variant="body1"
                        color={colors.grey[100]}
                        fontWeight="bold"
                      >
                        {selectedLoan.loan_header.pn_number}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color={colors.grey[300]}>
                        Customer Name
                      </Typography>
                      <Typography
                        variant="body1"
                        color={colors.grey[100]}
                        fontWeight="bold"
                      >
                        {selectedLoan.loan_header.customer_name}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color={colors.grey[300]}>
                        Date Granted
                      </Typography>
                      <Typography
                        variant="body1"
                        color={colors.grey[100]}
                        fontWeight="bold"
                      >
                        {dayjs(selectedLoan.loan_header.date_granted).format(
                          'MMMM DD, YYYY'
                        )}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color={colors.grey[300]}>
                        Principal Amount
                      </Typography>
                      <Typography
                        variant="body1"
                        color={colors.greenAccent[400]}
                        fontWeight="bold"
                      >
                        ₱
                        {Number(
                          selectedLoan.loan_header.principal_amount
                        ).toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                        })}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color={colors.grey[300]}>
                        Interest Rate
                      </Typography>
                      <Typography
                        variant="body1"
                        color={colors.grey[100]}
                        fontWeight="bold"
                      >
                        {selectedLoan.loan_header.interest_rate}%
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color={colors.grey[300]}>
                        Principal Balance
                      </Typography>
                      <Typography
                        variant="body1"
                        color={colors.redAccent[400]}
                        fontWeight="bold"
                      >
                        ₱
                        {Number(
                          selectedLoan.loan_header.principal_balance
                        ).toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                        })}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>

              {/* Payment Schedule */}
              <Card sx={{ backgroundColor: colors.greenAccent[800] }}>
                <CardContent>
                  <Typography
                    variant="h6"
                    color={colors.grey[100]}
                    fontWeight="bold"
                    mb={2}
                  >
                    Payment Schedule ({selectedLoan.loan_details.length}{' '}
                    payments)
                  </Typography>
                  <Box height={350}>
                    <DataGrid
                      rows={selectedLoan.loan_details}
                      columns={scheduleColumns}
                      getRowId={(row) => row.loan_detail_id}
                      disableSelectionOnClick
                      hideFooter
                      sx={{
                        '& .MuiDataGrid-cell': {
                          borderBottom: `1px solid ${colors.greenAccent[700]}`,
                        },
                        '& .MuiDataGrid-columnHeaders': {
                          backgroundColor: colors.greenAccent[900],
                          borderBottom: `2px solid ${colors.greenAccent[700]}`,
                          fontWeight: 'bold',
                        },
                      }}
                    />
                  </Box>
                </CardContent>
              </Card>

              {/* Payment History */}
              <Card sx={{ backgroundColor: colors.greenAccent[800] }}>
                <CardContent>
                  <Typography
                    variant="h6"
                    color={colors.grey[100]}
                    fontWeight="bold"
                    mb={2}
                  >
                    Payment History ({selectedLoan.payment_history.length}{' '}
                    transactions)
                  </Typography>
                  <Box height={350}>
                    <DataGrid
                      rows={selectedLoan.payment_history}
                      columns={paymentColumns}
                      getRowId={(row) => row.payment_history_id}
                      disableSelectionOnClick
                      hideFooter
                      sx={{
                        '& .MuiDataGrid-cell': {
                          borderBottom: `1px solid ${colors.greenAccent[700]}`,
                        },
                        '& .MuiDataGrid-columnHeaders': {
                          backgroundColor: colors.greenAccent[900],
                          borderBottom: `2px solid ${colors.greenAccent[700]}`,
                          fontWeight: 'bold',
                        },
                      }}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Box>
          )}
        </DialogContent>
        <DialogActions
          sx={{ backgroundColor: colors.greenAccent[800], p: 2 }}
        >
          <Button
            onClick={handleCloseDialog}
            variant="outlined"
            sx={{
              borderColor: colors.greenAccent[600],
              color: colors.grey[100],
              '&:hover': {
                borderColor: colors.greenAccent[500],
                backgroundColor: colors.greenAccent[700],
              },
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}