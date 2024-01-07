import { useTheme } from "@emotion/react"
import { tokens } from "../../../theme"
import { DataGrid } from "@mui/x-data-grid"
import { Box, Dialog, DialogTitle } from "@mui/material"
import Header from "../../../components/Header"
import { useEffect, useState } from "react"

export default function DetailsModal(props) {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const { selectedLoanId } = props;
    const [loanDetails, setLoanDetails] = useState([]);

    const columns = [
      {field: "loan_detail_id", headerName: "ID" },
      {field: "check_date", headerName: "Check Date", width: 150 },
      {field: "monthly_principal", headerName: "Principal", },
      {field: "monthly_interest", headerName: "Interest", width: 150 },
      {field: "monthly_amortization", headerName: "Amortization", width: 150},
      {field: "description", headerName: "Status", width: 150},
  ]

  useEffect(() => {
    const getLoanDetail = async() => {
        const req = await fetch(`http://localhost:8000/loans/${selectedLoanId}`)
        const resJson = await req.json()
        setLoanDetails(resJson)
    }
    getLoanDetail()
}, [])

  return (
   <Box>
      <DataGrid 
                rows={loanDetails}
                columns={columns}
                getRowId={(row) => row.loan_detail_id}
                autoHeight
                // autoPageSize
            />
   </Box>
  )
}
