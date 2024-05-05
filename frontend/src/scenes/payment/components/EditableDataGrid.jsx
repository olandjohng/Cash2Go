import { DataGrid } from '@mui/x-data-grid';
import React from 'react'


const EditableDataGrid = ({ rowData, onRowEdit }) => {
    const handleEdit = (newRow, oldRow) => {
        return onRowEdit(newRow, oldRow);
      };

      const columns = [
        // { field: 'id', headerName: 'ID', hide: true },
        { field: 'denomination', headerName: 'Denomination', width: 150 },
        {
          field: 'count',
          headerName: 'Count',
          width: 150,
          editable: true,
          type: 'number',
        },
        {
          field: 'total',
          headerName: 'Total',
          width: 150,
          valueGetter: (value) => {
            return value.row.denomination * value.row.count
          }, 
          type: 'number',
        },
      ];

  return (
    <div style={{ height: 400, width: '100%' }}>
      <DataGrid
        rows={rowData}
        columns={columns}
        pageSize={5}
        rowsPerPageOptions={[5, 10, 20]}
        checkboxSelection={false}
        disableSelectionOnClick
        processRowUpdate={handleEdit}
        // onRowEditStop={(params, event) => {
        //   event.defaultMuiPrevented = true
        // }}
        // onRowEditStart={(params, event) => {
        //   event.defaultMuiPrevented = true
        // }}
        
        // onEditCellChangeCommitted={(params) => {
        //   const { id, field, value } = params;
        //   console.log()
        //   handleEdit(id, field, value);
        // }}
      />
    </div>
  )
}

export default EditableDataGrid