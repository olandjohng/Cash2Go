import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material'
import React from 'react'

const numberFormat = Intl.NumberFormat(undefined,  {minimumFractionDigits: 2, maximumFractionDigits: 2})


export default function LoanTablePreview({details}) {
 
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell align="center" colSpan={6}>
              Loan Details
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Due Date</TableCell>
            <TableCell>Pricipal Amount</TableCell>
            <TableCell>Interest</TableCell>
            <TableCell>Amortization</TableCell>
            <TableCell>Bank</TableCell>
            <TableCell>Check Num.</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          { details &&
            details.map((v, id) => (
              <TableRow key={id}>
                <TableCell>{v.dueDate.toISOString().split('T')[0]}</TableCell>
                <TableCell>{numberFormat.format(Number(v.principal))}</TableCell>
                <TableCell>{numberFormat.format(Number(v.interest))}</TableCell>
                <TableCell>{numberFormat.format(Number(v.amortization))}</TableCell>
                <TableCell>{v.bank}</TableCell>
                <TableCell>{v.checkNumber}</TableCell>
              </TableRow>
            ))
          }
          {/* <TableRow>
            <TableCell rowSpan={2} />
            <TableCell align='right' colSpan={4}>Total Interest:</TableCell>
            <TableCell align="left" >100000</TableCell>
          </TableRow> */}
        </TableBody>
      </Table>
    </TableContainer>
  )
}
