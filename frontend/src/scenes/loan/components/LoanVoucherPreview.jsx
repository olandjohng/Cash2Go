import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material'
import React from 'react'

export default function LoanVoucherPreview() {
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell align='center' colSpan={3}>
              Voucher Details
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell></TableCell>
            <TableCell >Credit</TableCell>
            <TableCell>Debit</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            <TableCell>CURRENT ASSETS - Accounts Receivable- Customer</TableCell>
            <TableCell>-</TableCell>
            <TableCell>60000</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>NON CURRENT ASSETS - Accumulated Depreciation</TableCell>
            <TableCell>10000</TableCell>
            <TableCell>-</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>CURRENT LIABILITIES - Withholding Tax Payable-Professional Fees</TableCell>
            <TableCell>90000</TableCell>
            <TableCell>-</TableCell>
          </TableRow>
          {/* end */}
          <TableRow>
            <TableCell align='right' sx={{fontWeight : 'bold', fontStyle : 'italic', fontSize : '14px'}}> Total:  </TableCell>
            <TableCell sx={{ fontStyle : 'italic', fontSize : '14px'}}>15685</TableCell>
            <TableCell sx={{ fontStyle : 'italic', fontSize : '14px'}}>4546588</TableCell>
          </TableRow>
          <TableRow>
            {/* <TableCell colSpan={2} align='right'>Total De :</TableCell>
            <TableCell>4546588</TableCell> */}
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  )
}