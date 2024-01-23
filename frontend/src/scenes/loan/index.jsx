import {DataGrid} from '@mui/x-data-grid'
import { tokens } from '../../theme'
import {mockDataTeam} from '../../data/mockData'
import { useTheme } from '@emotion/react'
import { Box } from '@mui/material'
import Header from '../../components/Header'
import { useEffect, useState } from 'react'
import Popups from '../../components/Popups'
import DetailsModal from './components/DetailsModal'
import NewLoanModal from './components/NewLoanModal'

const Loan = () => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    
    const columns = [
        {field: "loan_header_id", headerName: "ID" },
        {field: "pn_number", headerName: "PN Number", width: 150 },
        {field: "customername", headerName: "Customer", width: 250},
        {field: "bank_name", headerName: "Bank", width: 250 },
        {field: "loancategory", headerName: "Category", width: 150},
        {field: "loanfacility", headerName: "Facility", width: 150},
        {field: "principal_amount", headerName: "Principal", width: 150},
        {field: "total_interest", headerName: "Interest", width: 150},
        {field: "date_granted", headerName: "Date Granted", width: 150},
        {field: "status_code", headerName: "Status", width: 150},
    ]

    const [customers, setCustomers] = useState([])
    const [facilities, setFacilities] = useState([])
    const [collaterals, setCollaterals] = useState([])
    const [banks, setBanks] = useState([])
    const [categories, setCategories] = useState([])
    
    const [loans, setLoans] = useState([]);
    const [openPopup, setOpenPopup] = useState(false);
    const [openNewLoanPopup, setOpenNewLoanPopup] = useState(false);
    const [selectedLoanId, setSelectedLoanId] = useState(null);


    const handleRowDoubleClick = (params) => {
        setSelectedLoanId(params.row.loan_header_id);
        setOpenPopup(true);
      };

    // TODO: loan category
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

            setLoans(loanData)
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
        
            <DataGrid 
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
            <NewLoanModal 
                collaterals={collaterals}
                customers={customers}
                facilities={facilities} 
                categories={categories} 
                banks={banks}/>
        </Popups>
    </div>
  )
}

export default Loan