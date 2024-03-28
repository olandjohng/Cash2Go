import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material'
import React from 'react'
import { numberFormat } from './LoanForm1'

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
              <TableCell>{numberFormat.format(v.amount)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}
