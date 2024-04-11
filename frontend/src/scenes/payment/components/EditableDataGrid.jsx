import { DataGrid } from '@mui/x-data-grid';
import React from 'react'


const EditableDataGrid = ({ rowData, onRowEdit }) => {
    const handleEdit = (id, field, value) => {
        onRowEdit(id, field, value);
      };

      const columns = [
        { field: 'id', headerName: 'ID', hide: true },
        { field: 'denomination', headerName: 'Denomination', width: 150 },
        {
          field: 'count',
          headerName: 'Count',
          width: 150,
          editable: true,
          type: 'number',
        },
      ];

  return (
    <div style={{ height: 400, width: '100%' }}>
      <DataGrid
        rows={rowData.map((row, index) => ({ id: index, ...row }))}
        columns={columns}
        pageSize={5}
        rowsPerPageOptions={[5, 10, 20]}
        checkboxSelection={false}
        disableSelectionOnClick
        onEditCellChangeCommitted={(params) => {
          const { id, field, value } = params;
          handleEdit(id, field, value);
        }}
      />
    </div>
  )
}

export default EditableDataGrid