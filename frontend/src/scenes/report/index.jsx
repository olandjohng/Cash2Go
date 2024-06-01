import React from 'react'
import Header from '../../components/Header'
import { Box } from '@mui/material'
import { useTheme } from '@emotion/react';
import { tokens } from '../../theme';
import SearchInputForm from './component/SearchInputForm';
import { DataGrid } from '@mui/x-data-grid';


export default function Report() {

  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const column = [
    {field : 'first_name', },
    {field : 'last_name', }
  ]
  const handleCustomerSearch = (value) => {
    console.log(value)
  }
  const handlePnNumberSearch = (value) => {
    console.log(value)
  }

  return (
    <div style={{ height: "75%", padding: 20 }}>
      <Header title='Report' showButton={false} />
        <Box display='flex' justifyContent='end' gap={1.5}>
          <SearchInputForm colors={colors} submit={handleCustomerSearch} name='customer_name' placeholder="Search Customer Name"/>
          <SearchInputForm colors={colors} submit={handlePnNumberSearch} name='pn_number' placeholder="Search PN Number"/>
        </Box>
        <Box height='98%' my={1}>
          {/* <DataGrid columns={column} rows={[]} /> */}
        </Box>
    </div>
  )
}
