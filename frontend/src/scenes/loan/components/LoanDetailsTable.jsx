import { Button } from '@mui/material';
import { DataGrid, GridToolbarContainer } from '@mui/x-data-grid';
import React from 'react'

function EditToolbar(props) {
  const {setRows, rows} = props
  
  const handleClick = () =>{
    const id = rows.length + 1
    setRows((oldRows) => [...oldRows, {id , dueDate: new Date(),  principal : 0, interest : 0, amortization : 0, bank : null, checkNumber: 0 }])
  }

  return (
    <GridToolbarContainer>
      <Button color='secondary' onClick={handleClick}>
        Add Record
      </Button>
    </GridToolbarContainer>
  )
}


export default function LoanDetailsTable({banks, rows, setRows}) {

  const columns = [
    { field: 'dueDate', headerName: 'Due Date', width: 150, editable: true, type : 'date' },
    { field: 'principal', headerName: 'Principal', width: 150, editable: true, },
    { field: 'interest', headerName: 'Interest', width: 150, editable: true,  },
    { field: 'amortization', headerName: 'Amortization', width: 150, editable: true,  },
    { field: 'bank', headerName: 'Bank', width: 150, editable: true, type : 'singleSelect', valueOptions : banks.map(b => b.name)},
    { field: 'checkNumber', headerName: 'Check Number', width: 150, editable: true,   },
  ];
  


  return (
    <DataGrid
      columns={columns}
      rows={rows}
      slots={{
        toolbar: EditToolbar,
      }}
      slotProps={{
        toolbar: {setRows, rows},
      }}
    />
  )
}
