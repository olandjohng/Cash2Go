import { useEffect, useState } from 'react'
import Header from '../../components/Header'
import { DataGrid } from '@mui/x-data-grid'
import Popups from '../../components/Popups'
import NewDeduction from './components/NewDeduction'
import { DeleteOutlined, EditCalendarOutlined } from '@mui/icons-material'
import { Button } from '@mui/material'
import { useTheme } from '@emotion/react'
import { tokens } from '../../theme'

function DeductionType() {

  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

    const [openPopup, setOpenPopup] = useState(false);
    const [deduction, setDeduction] = useState([])
  
    const loadDeductionData = async () => {
      try {
        const req = await fetch('http://localhost:8000/loans/deduction');
        const reqJSON = await req.json();
        setDeduction(reqJSON);
      } catch (error) {
        console.error('Error loading deduction data:', error);
      }
    };

    const columns = [
      { field: 'deductionType', flex: 1, headerName: 'Deduction Type' },
      {
        field: 'actions',
        headerName: 'Actions',
        sortable: false,
        width: 150,
        renderCell: (params) => (
          <div className='flex items-center justify-between'>
            <Button
              sx={{color: colors.greenAccent[400], cursor: 'auto'}}
              // onClick={() => handleEdit(params.row.id)} // Replace 'id' with your unique identifier field
            >
              <EditCalendarOutlined sx={{cursor: 'pointer'}} />
            </Button>
            <Button
              sx={{color: colors.redAccent[500], cursor: 'auto'}}
              // onClick={() => handleDelete(params.row.id)} // Replace 'id' with your unique identifier field
            >
              <DeleteOutlined sx={{cursor: 'pointer'}} />
            </Button>
          </div>
        ),
      },
    ];

    const handleDeductionAdded = () => {
      // Refresh deduction data after a new deduction is added
      loadDeductionData();
    };

    const handleClosePopup = () => {
      setOpenPopup(false);
    };
    
    useEffect(() => {
      loadDeductionData();
    }, []);

  return (
    <div style={ {height : '75%', padding : 20}}>
      <Header title={'Deduction Types'} subtitle={'List of deduction types use in processing new loans'} showButton={true} onAddButtonClick={()=> setOpenPopup(true)} />
      <DataGrid 
        columns={columns}
        rows={deduction}
        
      />

        <Popups
            title="Deduction"
            openPopup={openPopup}
            setOpenPopup={setOpenPopup}
        >
            <NewDeduction 
              onDeductionAdded={handleDeductionAdded} 
              onClosePopup={handleClosePopup}
            />
        </Popups>
    </div>
  )
}

export default DeductionType