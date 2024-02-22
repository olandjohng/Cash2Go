import {DataGrid} from '@mui/x-data-grid'
import { tokens } from '../../theme'
import {mockDataTeam} from '../../data/mockData'
import { useTheme } from '@emotion/react'
import { Box, IconButton, InputBase, TextField } from '@mui/material'
import Header from '../../components/Header'
import { useEffect, useReducer, useState } from 'react'
import Popups from '../../components/Popups'
import DetailsModal from './components/DetailsModal'
import NewLoanModal from './components/NewLoanModal'
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import LoanForm from './components/LoanForm'
import LoanForm1 from './components/LoanForm1'

function reducer(state, action){
    switch(action.type){
        case 'INIT' : return action.loans
        case 'ADD' : return [
            ...state , action.loans
        ]
    }
}

const formatNumber = (value) => {
    const amount = value.split('.');
    const format = Number(amount[0]).toLocaleString('en', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2 
    });
    return format;

}
const Loan = () => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    let timeOut = null;

    const columns = [
        {field: "loan_header_id", headerName: "ID" },
        {field: "pn_number", headerName: "PN Number", width: 250},
        {field: "customername", headerName: "Customer", width: 250,
        valueFormatter : (params) => {
            if(params.value) {
                const name = params.value.split(' ');
                return `${name[2]}, ${name[0]} ${name[1]}`

            }
        }
        },
        {field: "bank_name", headerName: "Bank", width: 250 },
        {field: "loancategory", headerName: "Category", width: 150},
        {field: "loanfacility", headerName: "Facility", width: 150},
        {field: "principal_amount", headerName: "Principal", width: 150, valueFormatter : (params) => {return formatNumber(params.value)}},
        {field: "total_interest", headerName: "Interest", width: 150, valueFormatter : (params) => { return formatNumber(params.value)}},
        {field: "date_granted", headerName: "Date Granted", width: 150,
        valueFormatter : (params) =>{
           const dateFormat = params.value.split('T')[0]
           return dateFormat
        }
        },
        {field: "status_code", headerName: "Status", width: 150},
    ]

    const [customers, setCustomers] = useState([])
    const [facilities, setFacilities] = useState([])
    const [collaterals, setCollaterals] = useState([])
    const [banks, setBanks] = useState([])
    const [categories, setCategories] = useState([])
    
    // const [loans, setLoans] = useState([]);
    const [openPopup, setOpenPopup] = useState(false);
    const [openNewLoanPopup, setOpenNewLoanPopup] = useState(false);
    const [selectedLoanId, setSelectedLoanId] = useState(null);
    const [loans, dispatch] = useReducer(reducer, []);

    const handleRowDoubleClick = (params) => {
        setSelectedLoanId(params.row.loan_header_id);
        setOpenPopup(true);
      };

    // TODO: loan category
    
    const handleSearch = (e) => {
        clearTimeout(timeOut);
        timeOut = setTimeout(()=>{
            fetch(`http://localhost:8000/loans?search=${e.target.value}`)
                .then((res) => res.json())
                .then((val) => dispatch({type : 'INIT', loans : val }))
        }, 1000)
    }

    useEffect(() => {
        const getData = async () => {
            const urls = [
                fetch('http://localhost:8000/loans'),
                fetch('http://localhost:8000/customers'),
                fetch('http://localhost:8000/loans/collateral'),
                fetch('http://localhost:8000/loans/facility'),
                fetch('http://localhost:8000/banks'),
                fetch('http://localhost:8000/loans/category'),
            ]
            const req = await Promise.all(urls)

            const loanData = await req[0].json()
            const customerData = await req[1].json()
            const collateralData = await req[2].json()
            const facilityData = await req[3].json()
            const banksData = await req[4].json()
            const categoryData = await req[5].json()

            dispatch({type : 'INIT', loans : loanData })
            setCustomers(customerData)
            setCollaterals(collateralData)

            setFacilities(facilityData)
            setBanks(banksData)
            setCategories(categoryData)
        }
        getData()
        
    }, [])
  
  return (
    <div style={ {height : '75%', padding : 20}}>
        <Header title="LOANS" subtitle="List of loans with details" showButton={true} onAddButtonClick={() => setOpenNewLoanPopup(true)} />
        {/* <Box sx={{ display: 'flex', alignItems: 'flex-start', mb : 2}}>
            <TextField variant="outlined" label= 'Search' onChange={handleSearch}/>
            <SearchOutlinedIcon sx={{ my: 'auto'}}/>
        </Box> */}
        <Box 
            display="flex" 
            alignItems='flex-start'
            marginBottom={2}
            backgroundColor={colors.greenAccent[800]}
            borderRadius="3px"
            >
                <InputBase sx={{ml: 2, mt: 0.5, flex: 1}} onChange={handleSearch} />
                <IconButton type="button" sx={{ p: 1 }}>
                    <SearchOutlinedIcon />
                </IconButton>
            </Box>
            <DataGrid sx={{height : '95%'}}
                rows={loans}
                columns={columns}
                getRowId={(row) => row.loan_header_id}
                // autoHeight
                onRowDoubleClick={handleRowDoubleClick}
                // autoPageSize
            />
       
        <Popups
            title="Loan Details"
            openPopup={openPopup}
            setOpenPopup={setOpenPopup}
        >
            <DetailsModal selectedLoanId={selectedLoanId} />
        </Popups>

        <Popups
            title="New Loan"
            openPopup={openNewLoanPopup}
            setOpenPopup={setOpenNewLoanPopup}
        >
            {/* <NewLoanModal 
                collaterals={collaterals}
                customers={customers}
                facilities={facilities} 
                categories={categories} 
                banks={banks}
                dispatcher={dispatch}
                popups = {setOpenNewLoanPopup}
                /> */}
                <LoanForm1 />
        </Popups>
    </div>
  )
}

export default Loan