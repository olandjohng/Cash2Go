import { PointOfSaleOutlined, SearchOutlined } from '@mui/icons-material'
import { Box, Button, IconButton, InputBase, Tooltip } from '@mui/material'
import { DataGrid } from '@mui/x-data-grid'
import { tokens } from "../../../theme";
import { useTheme } from "@emotion/react";
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom';
import axios from 'axios';

const SERVER_URL = "http://localhost:8000/payments";


const formatNumber = (value) => {
  const amount = value.split(".");
  const format = Number(amount[0]).toLocaleString("en", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return format;
};

export default function PaymentSearch({loanIdSetter, paymentRow, paymentRowSetter, paymentDataSetter }) {

  const [selectionModel, setSelectionModel] = useState([])
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [rows, setRows] = useState(paymentRow)
  const [isLoading, setIsLoading] = useState(false)
  const [searchInput, setSearchInput] = useState('')
  const [rowCount, setRowCount] = useState(0);
  
  const [paginationModel, setPaginationModel] = useState({
    page: 0, // Initial page
    pageSize: 5,
  });
  const columns = [
    { field: "pn_number", width: 200, headerName: "PN Number" },
    { field: "customername", width: 250, headerName: "Borrower" },
    { field: "loancategory", width: 150, headerName: "Category" },
    { field: "loanfacility", width: 150, headerName: "Facility" },
    {
      field: "principal_amount",
      width: 150,
      headerName: "Principal",
      align: "right",
      headerAlign: "right",
      valueFormatter: (params) => {
        return formatNumber(params.value);
      },
    },
    {
      field: "total_interest",
      width: 150,
      headerName: "Interest",
      align: "right",
      headerAlign: "right",
      valueFormatter: (params) => {
        return formatNumber(params.value);
      },
    },
    {
      field: "TotalPrincipalPayment",
      width: 150,
      headerName: "Principal Payment",
      align: "right",
      headerAlign: "right",
      valueFormatter: (params) => {
        return formatNumber(params.value);
      },
    },
    {
      field: "TotalInterestPayment",
      width: 150,
      headerName: "Interest Payment",
      align: "right",
      headerAlign: "right",
      valueFormatter: (params) => {
        return formatNumber(params.value);
      },
    },
    {
      field: "TotalPayment",
      width: 150,
      headerName: "Total Payment",
      align: "right",
      headerAlign: "right",
      valueFormatter: (params) => {
        return formatNumber(params.value);
      },
    },
    {
      field: "PrincipalBalance",
      width: 150,
      headerName: "Principal Balance",
      align: "right",
      headerAlign: "right",
      valueFormatter: (params) => {
        return formatNumber(params.value);
      },
    },
    {
      field: "InterestBalance",
      width: 150,
      headerName: "Interest Balance",
      align: "right",
      headerAlign: "right",
      valueFormatter: (params) => {
        return formatNumber(params.value);
      },
    },
    {
      field: "Balance",
      width: 150,
      headerName: "Total Balance",
      align: "right",
      headerAlign: "right",
      valueFormatter: (params) => {
        return formatNumber(params.value);
      },
    },
  ];

  useEffect(() => {
    paymentRowSetter(rows)
  },[rows])
  
  const handleSearch = async () => {
    setIsLoading(true)
    try {
      const response = await axios.get(SERVER_URL, {
        params: {
          page: paginationModel.page + 1,
          pageSize: paginationModel.pageSize,
          search : searchInput
        },
      });

      setRows(response.data.data);
      setRowCount(response.data.totalCount);
      
    } catch (error) {
      console.error("Error loading customer data:", error);
    } finally {
      setIsLoading(false);
    }
  }


  return (
    <>
      <Box
        display="flex"
        alignItems="flex-start"
        marginBottom={1}
        backgroundColor={colors.greenAccent[800]}
        borderRadius="3px"
      >
        <InputBase
          sx={{ mx: 2, mt: 0.5, flex: 1 }}
          value={searchInput}
          placeholder="Search"
          onChange={(e) => setSearchInput(e.target.value)}
        />
        <IconButton type="button" sx={{ px: 1.5 }} onClick={handleSearch} >
          <SearchOutlined/>
        </IconButton>
      </Box>
      <DataGrid 
        columns={columns} 
        rows={rows} 
        loading={isLoading}
        rowCount={rowCount}
        sx={{ height: 370 }}
        rowSelectionModel={selectionModel}
        checkboxSelection={true} 
        onRowSelectionModelChange={(selection) => {
          let loanId;
          if (selection.length > 1) {
            const selectionSet = new Set(selectionModel);
            const result = selection.filter((s) => !selectionSet.has(s));
            setSelectionModel(result);
            loanId = result[0]
          } else {
            setSelectionModel(selection);
            loanId = selection[0]
          }
          
          loanIdSetter(loanId)
          paymentDataSetter((old) => ({...old, loan_header_id : loanId }))
        }}/>
    </>
  )
}
