import { useRef, useState } from 'react'
import {
  Box,
  Button,
  Grid,
  Card,
  CardContent,
  Typography,
  TextField,
  useTheme,
  Divider
} from '@mui/material'
import {
  DataGrid,
  GRID_NUMERIC_COL_DEF,
  useGridApiRef
} from '@mui/x-data-grid'
import { NumericFormat, numericFormatter } from 'react-number-format'
import useSWR from 'swr'
import useSWRMutation from 'swr/mutation'
import { tokens } from '../../../theme'
import { SaveOutlined, PrintOutlined } from '@mui/icons-material'
import { toast, Bounce } from 'react-toastify'
import dayjs from 'dayjs'

const fetcher = url => fetch(url).then(res => res.json())

const denomRows = [
  { denomination: 1000, quantity: 0, total: 0 },
  { denomination: 500, quantity: 0, total: 0 },
  { denomination: 200, quantity: 0, total: 0 },
  { denomination: 100, quantity: 0, total: 0 },
  { denomination: 50, quantity: 0, total: 0 },
  { denomination: 20, quantity: 0, total: 0 },
  { denomination: 10, quantity: 0, total: 0 },
  { denomination: 5, quantity: 0, total: 0 },
  { denomination: 1, quantity: 0, total: 0 },
  { denomination: 0.50, quantity: 0, total: 0 },
  { denomination: 0.10, quantity: 0, total: 0 },
]

async function saveReport(url, { arg }) {
  return await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ denoms: arg })
  })
}

export default function DailyCashReport() {
  const [denoms, setDenoms] = useState(denomRows)
  const [payable, setPayable] = useState(0)
  const [reportDate, setReportDate] = useState(dayjs().format('YYYY-MM-DD'))
  const dataGridRef = useGridApiRef()
  const theme = useTheme()
  const colors = tokens(theme.palette.mode)

  const { data, isLoading } = useSWR('/api/reports', fetcher)
  const { trigger, isMutating } = useSWRMutation('/api/reports', saveReport)

  const subCash = denoms.reduce((acc, cur) => acc + cur.total, 0)
  const changeShort = subCash - payable

  const handleUpdateRow = (newRow, oldRow) => {
    const updateRow = {
      ...newRow,
      quantity: Number(newRow.quantity),
      total: Number(newRow.quantity) * newRow.denomination
    }
    const updateDenom = denoms.map((v) => {
      if (v.denomination === updateRow.denomination) {
        return updateRow
      }
      return v
    })
    setDenoms(updateDenom)
    return newRow
  }

  const handleSave = async () => {
    try {
      const result = await trigger(denoms)
      if (result.ok) {
        toast.success('Cash report saved successfully!', {
          position: 'top-right',
          autoClose: 2000,
          theme: 'colored',
          transition: Bounce,
        })
      } else {
        throw new Error('Failed to save')
      }
    } catch (error) {
      toast.error('Error saving cash report', {
        position: 'top-right',
        autoClose: 3000,
        theme: 'colored',
        transition: Bounce,
      })
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const denom_column = [
    {
      field: 'denomination',
      headerName: 'Denomination',
      flex: 1,
      valueFormatter: ({ value }) => {
        const formatValue = numericFormatter(String(value), {
          thousandSeparator: ',',
          decimalScale: 2,
          fixedDecimalScale: true
        })
        return `₱${formatValue}`
      }
    },
    {
      field: 'quantity',
      headerName: 'Quantity (PCS)',
      ...{ ...GRID_NUMERIC_COL_DEF, editable: true, align: 'center', headerAlign: 'center', flex: 1 },
      valueGetter: ({ value }) => {
        if (!value) return 0
        return Number(value)
      }
    },
    {
      field: 'total',
      headerName: 'Amount',
      flex: 1,
      align: 'right',
      headerAlign: 'right',
      valueGetter: ({ row }) => {
        return row.denomination * Number(row.quantity)
      },
      valueFormatter: ({ value }) => {
        const formatValue = numericFormatter(String(value), {
          thousandSeparator: ',',
          decimalScale: 2,
          fixedDecimalScale: true
        })
        return `₱${formatValue}`
      }
    },
  ]

  const payment_column = [
    { field: 'payment_type', headerName: 'Type', width: 100 },
    { field: 'receipt_num', headerName: 'Receipt #', flex: 0.8 },
    { field: 'full_name', headerName: 'Customer Name', flex: 1.5 },
    {
      field: 'total',
      headerName: 'Amount',
      flex: 1,
      align: 'right',
      headerAlign: 'right',
      valueFormatter: ({ value }) =>
        `₱${numericFormatter(String(value), { thousandSeparator: ',', decimalScale: 2, fixedDecimalScale: true })}`
    },
  ]

  return (
    <Box height="100%" display="flex" flexDirection="column" gap={2}>
      {/* Header Card */}
      <Card sx={{ backgroundColor: colors.greenAccent[900] }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="h5" color={colors.grey[100]} fontWeight="bold">
                Daily Cash Report
              </Typography>
              <Typography variant="body2" color={colors.grey[300]}>
                {dayjs(reportDate).format('MMMM DD, YYYY')}
              </Typography>
            </Box>
            <Box display="flex" gap={1}>
              <TextField
                type="date"
                value={reportDate}
                onChange={(e) => setReportDate(e.target.value)}
                size="small"
                InputLabelProps={{ shrink: true }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&.Mui-focused fieldset': {
                      borderColor: colors.greenAccent[600],
                    },
                  },
                }}
              />
              <Button
                variant="outlined"
                startIcon={<PrintOutlined />}
                onClick={handlePrint}
                sx={{
                  borderColor: colors.greenAccent[600],
                  color: colors.grey[100],
                  '&:hover': {
                    borderColor: colors.greenAccent[500],
                    backgroundColor: colors.greenAccent[800],
                  },
                }}
              >
                Print
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Box flex={1} display="flex" gap={2}>
        {/* Cash Denomination Section */}
        <Card sx={{ flex: 1, backgroundColor: colors.greenAccent[900] }}>
          <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" color={colors.grey[100]} fontWeight="bold" mb={2}>
              Cash Count
            </Typography>
            <Box flex={1} position="relative">
              <Box sx={{ position: 'absolute', inset: 0 }}>
                <DataGrid
                  apiRef={dataGridRef}
                  editMode="row"
                  columns={denom_column}
                  rows={denoms}
                  getRowId={(row) => row.denomination}
                  processRowUpdate={handleUpdateRow}
                  onProcessRowUpdateError={(error) => console.log(error)}
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
            </Box>

            {/* Cash Summary */}
            <Box mt={2} p={2} sx={{ backgroundColor: colors.greenAccent[800], borderRadius: 1 }}>
              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography variant="h6" color={colors.grey[100]}>
                  CASH TOTAL
                </Typography>
                <Typography variant="h6" color={colors.greenAccent[400]} fontWeight="bold">
                  ₱{numericFormatter(String(subCash), {
                    thousandSeparator: ',',
                    decimalScale: 2,
                    fixedDecimalScale: true
                  })}
                </Typography>
              </Box>

              <Divider sx={{ my: 1, borderColor: colors.greenAccent[700] }} />

              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="body1" color={colors.grey[100]}>
                  EXPECTED PAYABLE
                </Typography>
                <NumericFormat
                  variant="standard"
                  customInput={TextField}
                  placeholder="0.00"
                  thousandSeparator=","
                  decimalScale={2}
                  fixedDecimalScale
                  size="small"
                  InputProps={{
                    sx: { 
                      color: colors.grey[100],
                      fontWeight: 'bold',
                      fontSize: '1rem'
                    }
                  }}
                  sx={{ width: '150px' }}
                  onValueChange={(value) => {
                    const amount = value.floatValue ? value.floatValue : 0
                    setPayable(amount)
                  }}
                />
              </Box>

              <Divider sx={{ my: 1, borderColor: colors.greenAccent[700] }} />

              <Box display="flex" justifyContent="space-between">
                <Typography variant="h6" color={colors.grey[100]}>
                  VARIANCE
                </Typography>
                <Typography 
                  variant="h6" 
                  color={changeShort >= 0 ? colors.greenAccent[400] : colors.redAccent[400]} 
                  fontWeight="bold"
                >
                  ₱{numericFormatter(String(Math.abs(changeShort)), {
                    thousandSeparator: ',',
                    decimalScale: 2,
                    fixedDecimalScale: true
                  })} {changeShort >= 0 ? '(Over)' : '(Short)'}
                </Typography>
              </Box>

              <Box mt={2}>
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<SaveOutlined />}
                  onClick={handleSave}
                  disabled={isMutating}
                  sx={{
                    backgroundColor: colors.greenAccent[700],
                    color: colors.grey[100],
                    fontWeight: 'bold',
                    '&:hover': {
                      backgroundColor: colors.greenAccent[600],
                    },
                  }}
                >
                  {isMutating ? 'Saving...' : 'Save Cash Count'}
                </Button>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Payment Collection Section */}
        <Card sx={{ flex: 1, backgroundColor: colors.greenAccent[900] }}>
          <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" color={colors.grey[100]} fontWeight="bold" mb={2}>
              Today's Collections
            </Typography>
            <Box flex={1} position="relative">
              <Box sx={{ position: 'absolute', inset: 0 }}>
                <DataGrid
                  loading={isLoading}
                  columns={payment_column}
                  rows={data?.details || []}
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
            </Box>

            {/* Collection Summary */}
            {data && (
              <Box mt={2} p={2} sx={{ backgroundColor: colors.greenAccent[800], borderRadius: 1 }}>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="h6" color={colors.grey[100]}>
                    TOTAL COLLECTIONS
                  </Typography>
                  <Typography variant="h6" color={colors.blueAccent[400]} fontWeight="bold">
                    ₱{numericFormatter(String(data.total), {
                      thousandSeparator: ',',
                      decimalScale: 2,
                      fixedDecimalScale: true
                    })}
                  </Typography>
                </Box>
              </Box>
            )}
          </CardContent>
        </Card>
      </Box>
    </Box>
  )
}