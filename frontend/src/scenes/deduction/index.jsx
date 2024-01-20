import { useEffect, useState } from 'react'
import Header from '../../components/Header'
import { DataGrid } from '@mui/x-data-grid'
import Popups from '../../components/Popups'
// import NewDeduction from './components/NewDeduction'

function DeductionType() {
    const [openPopup, setOpenPopup] = useState(false);
    const [deduction, setDeduction] = useState([])
  
    useEffect(() =>{ 
        const reqDeduction = async () =>{
        const req = await fetch('http://localhost:8000/loans/deduction')
        const reqJSON  = await req.json()
        setDeduction(reqJSON)
    }

    reqDeduction()
  }, [])

  return (
    <div style={ {height : '75%', padding : 20}}>
      <Header title={'Deduction Types'} subtitle={'List of deduction types use in processing new loans'} showButton={true} onAddButtonClick={()=> setOpenPopup(true)} />
      <DataGrid 
        columns={[
          { field: 'deductionType', flex : 1, headerName : 'Deduction Type'},
          
        ]}
        rows={deduction}
        
      />

        <Popups
            title="Loan Deduction Type"
            openPopup={openPopup}
            setOpenPopup={setOpenPopup}
        >
            {/* <NewDeduction /> */}
        </Popups>
    </div>
  )
}

export default DeductionType