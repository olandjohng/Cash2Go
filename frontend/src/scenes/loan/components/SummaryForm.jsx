import React, { useContext } from 'react'
import { LoanFormContext, PreviewLabel, numberFormat } from './LoanForm1'
import { Box, Paper, Typography, Grid } from '@mui/material'
import LoanTablePreview from './LoanTablePreview'
import LoanDeductionPreview from './LoanDeductionPreview'
import dayjs from 'dayjs'
import LoanTableDaysPreview from './LoanTableDaysPreview'

export default function SummaryForm({netProceeds}) {
  const {formValue, setFormValue, validationError, setValidationError} = useContext(LoanFormContext)

  return (
    <Box sx={{ p: 3 }}>
      {/* Main Content Card */}
      <Paper 
        elevation={0}
        sx={{ 
          p: 4,
          background: '#0f2922',
          borderRadius: 3,
          mb: 3
        }}
      >
        <Typography 
          variant="h5" 
          sx={{ 
            color: 'white', 
            fontWeight: 600, 
            mb: 3,
            textAlign: 'center'
          }}
        >
          Loan Summary
        </Typography>

        {/* Borrower Information Section */}
        <Paper 
          elevation={3}
          sx={{ 
            p: 3, 
            borderRadius: 2,
            mb: 3,
            background: '#0f2922'
          }}
        >
          <Typography 
            variant="subtitle1" 
            sx={{ 
              fontWeight: 600, 
              mb: 2, 
              color: '#4cceac'
            }}
          >
            Borrower Information
          </Typography>
          <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            <PreviewLabel
              label="Borrower's Name"
              value={formValue.customer_name}
            />
            <PreviewLabel
              label="Check Issued Name"
              value={formValue.check_issued_name}
            />
            <PreviewLabel 
              label='Bank Name' 
              value={formValue.bank_name}
            />
          </Box>
        </Paper>

        {/* Check Details Section */}
        <Paper 
          elevation={3}
          sx={{ 
            p: 3, 
            borderRadius: 2,
            mb: 3,
            background: '#0f2922'
          }}
        >
          <Typography 
            variant="subtitle1" 
            sx={{ 
              fontWeight: 600, 
              mb: 2, 
              color: '#4cceac'
            }}
          >
            Check Details
          </Typography>
          <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            <PreviewLabel 
              label='Check Number' 
              value={formValue.check_number} 
            />
            <PreviewLabel 
              label='Check Date' 
              value={dayjs(formValue.check_date).format('MM-DD-YYYY')}
            />
            <PreviewLabel
              label='Loan Category'
              value={formValue.loan_category}
            />
            <PreviewLabel
              label='Loan Facility'
              value={formValue.loan_facility}
            />
          </Box>
        </Paper>

        {/* Loan Details Section */}
        <Paper 
          elevation={3}
          sx={{ 
            p: 3, 
            borderRadius: 2,
            background: '#0f2922',
            mb: 3
          }}
        >
          <Typography 
            variant="subtitle1" 
            sx={{ 
              fontWeight: 600, 
              mb: 2, 
              color: '#4cceac'
            }}
          >
            Loan Details
          </Typography>
          <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            <PreviewLabel
              label='Loan Collateral'
              value={formValue.collateral}
            />
            <PreviewLabel
              label='Principal Amount'
              value={numberFormat.format(formValue.principal_amount)}
            />
            <PreviewLabel
              label='Interest Rate'
              value={`${Number(formValue.interest_rate).toFixed(2)}%`}
            />
            {formValue.term_type === 'months' && (
              <PreviewLabel
                label='Net Proceeds'
                value={numberFormat.format(netProceeds && netProceeds() || 0)}
              />
            )}
          </Box>
        </Paper>

        {/* Deductions Section */}
        <Paper 
          elevation={3}
          sx={{ 
            p: 3, 
            borderRadius: 2,
            background: '#0f2922',
            mb: 3
          }}
        >
          <Typography 
            variant="subtitle1" 
            sx={{ 
              fontWeight: 600, 
              mb: 2, 
              color: '#4cceac'
            }}
          >
            Deductions
          </Typography>
          <LoanDeductionPreview details={formValue.deduction}/>
        </Paper>
      </Paper>

      {/* Loan Schedule Table */}
      <Paper 
        elevation={0}
        sx={{ 
          borderRadius: 3,
          overflow: 'hidden',
          background: 'linear-gradient(135deg, #4cceac 0%, #2e7c67 100%)',
          p: 0.5
        }}
      >
        <Paper 
          elevation={0}
          sx={{ 
            borderRadius: 2.5,
            overflow: 'hidden'
          }}
        >
          {formValue.term_type === 'months' ? (
            <LoanTablePreview
              details={formValue.loan_details}
            />
          ) : (
            <LoanTableDaysPreview details={formValue.loan_details} />
          )}
        </Paper>
      </Paper>
    </Box>
  )
}