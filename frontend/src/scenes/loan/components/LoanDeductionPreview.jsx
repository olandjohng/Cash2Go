import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material'
import React from 'react'

export default function LoanDeductionPreview({details}) {
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell align='center' colSpan={2}>
              Deduction Details
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          { details && details.map((v) => (
            <TableRow>
              <TableCell>{v.label}</TableCell>
              <TableCell>{v.amount}</TableCell>
            </TableRow>
          ))}
          
          {/* end */}
          {/* <TableRow>
            <TableCell align='right'>Total</TableCell>
            <TableCell>1551</TableCell>
          </TableRow> */}
        </TableBody>
      </Table>
    </TableContainer>
  )
}
