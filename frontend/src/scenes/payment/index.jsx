import {
  Autocomplete,
  Box,
  Button,
  Grid,
  IconButton,
  InputBase,
  TextField,
  ToggleButton,
  Tooltip,
  Typography,
} from "@mui/material";
import Header from "../../components/Header";
import { tokens } from "../../theme";
import { useTheme } from "@emotion/react";
import { useEffect, useReducer, useRef, useState } from "react";
import axios from "axios";
import {
  EditCalendarOutlined,
  PointOfSaleOutlined,
  SearchOutlined,
} from "@mui/icons-material";
import { Link, useLocation } from "react-router-dom";
import { DataGrid } from "@mui/x-data-grid";
import Popups from "../../components/Popups";
import PaymentForm from "./components/PaymentForm";
import dayjs from "dayjs";
import { DatePicker } from "@mui/x-date-pickers";

function paymentReducer(state, action) {
  switch(action.type){
    case 'INIT' :
      return action.payments
      // return []
    case 'ADD' :
      return [
        ...state, {...action.payment}
      ]
  }
}


export default function LoanPayment() {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const loc = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  // const [paymentRows, setPaymentRows] = useState([]);
  const [paymentRows, paymentRowDispatch] = useReducer(paymentReducer, []);
  const [deductionRows, setDeductionRows] = useState([]);
  const [rowCount, setRowCount] = useState(0);
  const [openPopup, setOpenPopup] = useState(false);
  const [selectedLoanId, setSelectedLoanId] = useState(null);
  const [isDeductionView, setIsDeductionView] = useState(false)
  const [searchValue, setSearchValue] = useState("");
  const [dateView, setDateView] = useState(
    {
      from : dayjs(Date()),
      to : dayjs(Date())
    }
  )
  const [paginationModel, setPaginationModel] = useState({
    page: 0, // Initial page
    pageSize: 5,
  });

  const loadPaymentHeaderData = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`/api/payments`, {
        params: {
          page: paginationModel.page + 1,
          pageSize: paginationModel.pageSize,
          date : {
            from : dateView.from.format('YYYY-MM-DD'),
            to : dateView.to.format('YYYY-MM-DD')
          }
        },
      });

      // setPaymentRows(response.data.data);
      paymentRowDispatch({type : 'INIT', payments : response.data.data})
      
      
    } catch (error) {
      console.error("Error loading customer data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadDeductionPayment = async () => {
    try {
      const deductions = await axios.get(`api/payments/deductions`, {
        params: {
          page: paginationModel.page + 1,
          pageSize: paginationModel.pageSize,
          search : searchValue,
          date : {
            from : dateView.from.format('YYYY-MM-DD'),
            to : dateView.to.format('YYYY-MM-DD')
          }
        },
      })
      setDeductionRows(deductions.data)
      // paymentDispatch({type : 'INIT'})
    } catch (error) {
      
    }
  }

  const formatNumber = (value) => {
    // const amount = value.split(".");
    const format = Number(value).toLocaleString("en", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return format;
  };

  const handlePaymentButtonClick = () => {
    //setSelectedLoanId(params.row.id);
     setOpenPopup(true);
  };

  const deduction_col = [
    { field: "process_date", width: 150, headerName: "Process Date", 
      valueFormatter : (params) => {
        return dayjs(params.value).format('MM-DD-YYYY')
      }
    },
    { field: "pn_number", width: 200, headerName: "PN Number" },
    { field: "full_name", width: 150, headerName: "Borrower Name"},
    { field: "service_charge", width: 150, headerName: "Service Charge",
      valueFormatter : (params) => 
        params.value ? formatNumber(params.value) : ''
    },
    { field: "appraisal_fee", width: 150, headerName: "Appraisal Fee",
      valueFormatter : (params) => params.value ? formatNumber(params.value) : ''
    },
    { field: "notarial_fee", width: 150, headerName: "Notarial Fee",
      valueFormatter : (params) => params.value ? formatNumber(params.value) : ''
    },
    { field: "documentary_stamp", width: 150, headerName: "Doc. Stamp",
      valueFormatter : (params) => params.value ? formatNumber(params.value) : ''
    },
    { field: "doc_stamp_bir", width: 150, headerName: "Doc. Stamp (BIR)",
      valueFormatter : (params) => params.value ? formatNumber(params.value) : ''
    },
    { field: "hold_charge", width: 150, headerName: "Hold Charge",
      valueFormatter : (params) => params.value ? formatNumber(params.value) : ''
    },
  ];

  const payment_col = [
    { field: "payment_date", width: 150, headerName: "Process Date", 
      valueFormatter : (params) => {
        return dayjs(params.value).format('MM-DD-YYYY')}
    },
    { field: "payment_receipt", width: 150, headerName: "PR Number" },
    { field: "fullName", width: 200, headerName: "Borrower Name" },
    { field: "pn_number", width: 200, headerName: "PN Number" },
    { field: "payment_type", width: 200, headerName: "Mode of Payment" },
    { field: "bank", width: 150, headerName: "Bank" },
    { field: "check_number", width: 150, headerName: "Check Number." },
    { field: "check_date", width: 150, headerName: "Check Date.",
      valueFormatter : (params) => {
        // console.log(typeof params.value, params.value)
        if(params.value && params.value != '') 
          return dayjs(params.value).format('MM-DD-YYYY');
      }
    },
    { field: "payment_principal", width: 150, headerName: "Principal",
      valueFormatter : (params) => formatNumber(params.value)
    },
    { field: "payment_interest", width: 150, headerName: "Interest",
      valueFormatter : (params) => formatNumber(params.value)
    },
    { field: "payment_penalty", width: 150, headerName: "Penalty",
      valueFormatter : (params) => formatNumber(params.value)
    },
    { field: "payment_amount", width: 150, headerName: "Total Payment",
      // valueFormatter : (params) => formatNumber(params.value)
      valueGetter: (params) => {
        const total = Number(params.row.payment_principal) + Number(params.row.payment_interest) + Number(params.row.payment_penalty)
        return formatNumber(total)
      },
    },
    { field: "remarks", width: 200, headerName: "Remarks" },
  ]

  const handleSearch = async () => {
    
    try {
      const response = await axios.get(`/api/payments`, {
        params: {
          page: 1, // Reset page to 1 when searching
          pageSize: paginationModel.pageSize,
          search: searchValue.trim(),
          date : {
            from : dateView.from.format('YYYY-MM-DD'),
            to : dateView.to.format('YYYY-MM-DD')
          }
        },
      });
      // setPaymentRows(response.data.data);
      paymentRowDispatch({type : 'INIT', payments : response.data.data})

      
      // setRowCount(response.data.totalCount);
    } catch (error) {
      console.error("Error loading customer data:", error);
    }
  };

  useEffect(() => {
    // if (searchValue.trim() === "") {
      // loadPaymentHeaderData();
      // } else {
      //   handleSearch();
      // }
      if(!isDeductionView)
        loadPaymentHeaderData();
      else
        loadDeductionPayment();

  }, [ paginationModel, dateView, isDeductionView]);
  // End useEffect

  const handlePaginationModelChange = (newPaginationModel) => {
    setPaginationModel(newPaginationModel);
  };

  return (
    <div style={{ height: "75%", padding: 20 }}>
      <Header title="LOAN PAYMENTS" onAddButtonClick={() => setOpenPopup(true)} />
      <Box
        display="flex"
        alignItems="flex-start"
        marginBottom={1}
        backgroundColor={colors.greenAccent[800]}
        borderRadius="3px"
      >
        <InputBase
          sx={{ ml: 2, mt: 0.5, flex: 1 }}
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
        />
        <IconButton type="button" sx={{ p: 1 }} onClick={handleSearch}>
          <SearchOutlined />
        </IconButton>
      </Box>
      {/*TODO Filter date UI */}
      {/* Toggle button UI */}
      <Box display='flex' justifyContent='space-between' >
        <ToggleButton 
          size="small"
          sx={{ paddingX : 2, marginBottom : 1}}
          selected={isDeductionView}
          onChange={() => {
            setIsDeductionView((old) => !old)
          }}
        >
          {isDeductionView ? (<span>View Payment</span>) : (<span>View Deduction</span>) }
        </ToggleButton>
        <Box display='flex' gap={2.5}>
          <Box display='flex' gap={1}>
            {/* <Typography margin='auto'>From:</Typography> */}
            <DatePicker label='from' value={dateView.from} slotProps={{textField : {size : 'small'}}} 
              onChange={(val) => 
                setDateView((old) => ({...old, from : val}))
              } 
            />
          </Box>
          <Box display='flex' gap={1}>
            {/* <Typography margin='auto' >To:</Typography> */}
            <DatePicker label='to' value={dateView.to} slotProps={{textField : {size : 'small'}}}
              onChange={(val) => 
                setDateView((old) => ({...old, to : val}))
              } 
            />
          </Box>

        </Box>
      </Box>

      {/* <DataGrid
        sx={{ height: "93%" }}
        columns={columns}
        rows={rows}
        loading={isLoading}
        rowCount={rowCount}
        pageSizeOptions={[5, 10, 20]}
        paginationMode="server"
        paginationModel={paginationModel}
        onPaginationModelChange={handlePaginationModelChange}
      /> */}
      { isDeductionView ? 
        (
          // Deduction DataGrid
          <DataGrid 
            sx={{ height: "90%" }}
            columns={deduction_col}
            rows={deductionRows}
          />
          // <div>test</div>
        )
      : 
        (
          // Payment DataGrid
          <DataGrid 
            sx={{ height: "90%" }}
            columns={payment_col}
            rows={paymentRows}
            />
        )
      }

      <Popups
        title="Loan Payment Details"
        openPopup={openPopup}
        setOpenPopup={setOpenPopup}
        toURL={`/payments`}
      >
          <PaymentForm popup={setOpenPopup} paymentDispacher={paymentRowDispatch}/>
      </Popups>
    </div>
  );
}