import {DataGrid} from '@mui/x-data-grid'
import { tokens } from '../../theme'
import {mockDataTeam} from '../../data/mockData'
import { useTheme } from '@emotion/react'
import { Box } from '@mui/material'
import Header from '../../components/Header'

const Loan = () => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);

    const columns = [
        {field: "pn_number", headerName: "PN Number"},
        {field: "customername", headerName: "Customer", flex:1, cellClassName:"name-column--cell"},
        {field: "bank_name_pdc", headerName: "PDC Bank" },
        {field: "loancategory", headerName: "Category"},
        {field: "loanfacility", headerName: "Facility"},
        {field: "principal_amount", headerName: "Principal"},
        {field: "total_interest", headerName: "Interest"},
        {field: "date_granted", headerName: "Date Granted"},
        {field: "status_code", headerName: "Status"},
    ]

  return (
    <Box m="20px" height="100%">
        <Header title="LOANS" subtitle="List of loans with details" showButton={true} />
        <Box>
            <DataGrid 
                rows={mockDataTeam}
                columns={columns}
            />
        </Box>
        
    </Box>
  )
}

export default Loan