import { Autocomplete, Box, Button, Grid, TextField, Tooltip, Typography } from "@mui/material"
import Header from "../../components/Header"
import { tokens } from '../../theme'
import { useTheme } from '@emotion/react'
import { useEffect, useRef, useState } from "react"
import axios from "axios"
import { EditCalendarOutlined } from "@mui/icons-material"
import { Link, useLocation } from "react-router-dom";
import { DataGrid } from "@mui/x-data-grid"

const SERVER_URL = 'http://localhost:8000/payments';

function LoanPayment() {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const loc = useLocation();
    const [isLoading, setIsLoading] = useState(false);
    const [rows, setRows] = useState([]);
    const [rowCount, setRowCount] = useState(0);
    const [openPopup, setOpenPopup] = useState(false);
    
    const [paginationModel, setPaginationModel] = useState({
      page: 0, // Initial page
      pageSize: 5,
    });

    const loadPaymentHeaderData = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(SERVER_URL, {
          params: {
            page: paginationModel.page + 1,
            pageSize: paginationModel.pageSize,
          },
        });
        setRows(response.data.data);
        setRowCount(response.data.totalCount);
      } catch (error) {
        console.error("Error loading customer data:", error);
      }finally {
        setIsLoading(false);
  
      }
    };
    
    const formatNumber = (value) => {
      const amount = value.split('.');
      const format = Number(amount[0]).toLocaleString('en', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2 
      });
      return format;
  
  }

    const columns = [
      { field: "pn_number", width: 150, headerName: "PN Number" },
      { field: "customername", width: 250, headerName: "Borrower" },
      { field: "loancategory", width: 150, headerName: "Category" },
      { field: "loanfacility", width: 150, headerName: "Facility" },
      { field: "principal_amount", width: 150, headerName: "Principal", align: "right", headerAlign: 'right', valueFormatter : (params) => {return formatNumber(params.value)} },
      { field: "total_interest", width: 150, headerName: "Interest", align: "right", headerAlign: 'right', valueFormatter : (params) => {return formatNumber(params.value)} },
      { field: "TotalPrincipalPayment", width: 150, headerName: "Principal Payment", align: "right", headerAlign: 'right', valueFormatter : (params) => {return formatNumber(params.value)} },
      { field: "TotalInterestPayment", width: 150, headerName: "Interest Payment", align: "right", headerAlign: 'right', valueFormatter : (params) => {return formatNumber(params.value)} },
      { field: "TotalPayment", width: 150, headerName: "Total Payment", align: "right", headerAlign: 'right', valueFormatter : (params) => {return formatNumber(params.value)} },
      { field: "PrincipalBalance", width: 150, headerName: "Principal Balance", align: "right", headerAlign: 'right', valueFormatter : (params) => {return formatNumber(params.value)} },
      { field: "InterestBalance", width: 150, headerName: "Interest Balance", align: "right", headerAlign: 'right', valueFormatter : (params) => {return formatNumber(params.value)} },
      { field: "Balance", width: 150, headerName: "Total Balance", align: "right", headerAlign: 'right', valueFormatter : (params) => {return formatNumber(params.value)} },
      {
        field: "actions",
        headerName: "",
        sortable: false,
        width: 150,
        renderCell: (params) => (
          <div className="flex items-center justify-between">
            <Tooltip title="Edit" placement="top" arrow>
              <Button
                component={Link}
                to={`/payments/${params.row.id}`}
                sx={{ color: colors.greenAccent[400], cursor: "auto" }}
                onClick={() => setOpenPopup(true)}
              >
                <EditCalendarOutlined sx={{ cursor: "pointer" }} />
              </Button>
            </Tooltip>
            
          </div>
        ),
      },
    ];

    useEffect(() => {
      loadPaymentHeaderData();
    }, [paginationModel]);
    // End useEffect
  
    const handlePaginationModelChange = (newPaginationModel) => {
      setPaginationModel(newPaginationModel);
    };

  return (
    <div style={ {height : '75%', padding : 20}}>
        <Header title="Loan Payment" subtitle="List of Payments and balances" />
        <DataGrid
        columns={columns}
        rows={rows}
        loading={isLoading}
        rowCount={rowCount}
        pageSizeOptions={[5, 10, 20]}
        paginationMode="server"
        paginationModel={paginationModel}
        
        onPaginationModelChange={handlePaginationModelChange}
      />
    </div>
  )
}

export default LoanPayment