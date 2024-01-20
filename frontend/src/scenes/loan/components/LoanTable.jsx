import { TableHead, Table, tableRowClasses, TableContainer, TableRow, TableCell, TableBody, Paper, TextField } from '@mui/material'
import React from 'react'

export default function LoanTable({rows, setRows}) {
  
  return (
    <TableContainer component={Paper}>
    <Table stickyHeader  sx={{ minWidth: 650 }} aria-label="simple table">
      <TableHead>
        <TableRow>
          <TableCell>Due Date</TableCell>
          <TableCell>Principal</TableCell>
          <TableCell>Interest</TableCell>
          <TableCell>Amortization</TableCell>
          <TableCell>Bank</TableCell>
          <TableCell>Check Number</TableCell> 
        </TableRow>
      </TableHead>
      <TableBody>
        {rows.map((row, index) => (
          <TableRow 
            key={index}
            sx={{ 'td, th': { border: 0 }, }}
          >
            <TableCell sx={{padding : 0.5}} scope="row">
              <TextField type='date'/>
            </TableCell>
            <TableCell sx={{padding : 0.5}} scope="row">
              <TextField type='text'/>
            </TableCell>
            <TableCell sx={{padding : 0.5}}  scope="row">
              <TextField type='text'/>
            </TableCell>
            <TableCell sx={{padding : 0.5}}scope="row">
              <TextField  type='text'/>
            </TableCell>
            <TableCell sx={{padding : 0.5}}  scope="row">
              <TextField type='text'/>
            </TableCell>
            <TableCell sx={{padding : 0.5}}  scope="row">
              <TextField type='text'/>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </TableContainer>
  )
}
