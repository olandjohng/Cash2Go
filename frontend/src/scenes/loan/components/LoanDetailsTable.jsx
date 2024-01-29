import { useTheme } from '@emotion/react';
import { DeleteOutlined } from '@mui/icons-material';
import { Button } from '@mui/material';
import { DataGrid, GridActionsCell, GridActionsCellItem, GridRowEditStopReasons, GridRowModes, GridToolbarContainer } from '@mui/x-data-grid';
import React, { useState } from 'react'
import { tokens } from '../../../theme';

function EditToolbar(props) {
  const {setRows, rows, setRowModesModel} = props
  
  const handleClick = () =>{
    const id = rows.length + 1
    setRows((oldRows) => [...oldRows, {id , dueDate: null,  principal : '', interest : '', amortization : '', bank : null, checkNumber: '', isNew : true}])
    setRowModesModel((oldModel) => ({
      ...oldModel,
      [id] : { mode: GridRowModes.Edit, fieldToFocus: 'dueDate' }
    }))
  }

  return (
    <GridToolbarContainer>
      <Button color='secondary' onClick={handleClick}>
        Add Record
      </Button>
    </GridToolbarContainer>
  )
}

const formatNumber = (params) =>{
  const format = Number(params.value).toLocaleString('en', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2 
  })
  return format
}


export default function LoanDetailsTable({banks, rows, setRows}) {
  const theme = useTheme()
  const colors =  tokens(theme.palette.mode)
  const [rowModesModel, setRowModesModel] = useState({})

  const handleDelete = (id) => {
    const filterRows = rows.filter((row) => row.id !== id).map((r,i) =>  ({...r, id : i + 1}) )
    setRows(filterRows)
  }

  const handleRowModesModelChange = (newRowModesModel) => {
    setRowModesModel(newRowModesModel);
  };

  const handleRowInputChange = (newRow) =>{
    const updatedRow = { ...newRow, isNew : false}
    setRows(rows.map((row)=> (row.id === newRow.id ? updatedRow: row)))
    return updatedRow
  }

  const handleRowEditStop = (params, event) => {
    // console.log(params.id)
    if (params.reason === GridRowEditStopReasons.rowFocusOut) {
      event.defaultMuiPrevented = true;
    }
  };

  const columns = [
    { field: 'id', headerName: 'Count', editable: false },
    { field: 'dueDate', headerName: 'Due Date', width: 150, editable: true, type : 'date' },
    { field: 'principal', headerName: 'Principal', width: 150, editable: true, 
      valueFormatter : (params) => {
        return formatNumber(params)
      } 
        
    },
    { field: 'interest', headerName: 'Interest', width: 150, editable: true, 
      valueFormatter : (params) => {
        return formatNumber(params)
      } 
    },
    { field: 'amortization', headerName: 'Amortization', width: 150, editable: true, 
      valueFormatter : (params) => {
        return formatNumber(params)
      } 
    },
    { field: 'bank', headerName: 'Bank', width: 150, editable: true, type : 'singleSelect', valueOptions : banks.map(b => b.name)},
    { field: 'checkNumber', headerName: 'Check Number', width: 120, editable: true,   },
    { field: 'action', type : 'actions',
      getActions : ({id}) => {
        return [
          <GridActionsCellItem
            icon={<DeleteOutlined/>}
            color='inherit'
            label='edit'
            sx={{color: colors.redAccent[500], cursor: 'auto'}}
            onClick={(e) => handleDelete(id)}
          />
        ]
      }
    },
  ];
  


  return (
    <DataGrid
      columns={columns}
      rows={rows}
      editMode="row"
      rowModesModel={rowModesModel}
      onRowModesModelChange={handleRowModesModelChange}
      onRowEditStop={handleRowEditStop}
      processRowUpdate={handleRowInputChange}
      slots={{
        toolbar: EditToolbar,
      }}
      slotProps={{
        toolbar: {setRows, rows, setRowModesModel},
      }}
    />
  )
}
