import React, { useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';

const MyDataGrid = ({ rows, columns }) => {
  const [editableRows, setEditableRows] = useState(rows);

  const handleEditCellChange = (params) => {
    const updatedRows = editableRows.map((row) =>
      row.id === params.id ? { ...row, [params.field]: params.props.value } : row
    );
    setEditableRows(updatedRows);
  };

  const handleSaveToDatabase = () => {
    // Here, you can implement the logic to save data to the database.
    // Use a fetch or axios request to send the data to your backend API.

    console.log('Save to database:', editableRows);
    // Add your database save logic here...
  };

  const columnsWithEdit = columns.map((column) => ({
    ...column,
    editable: true,
  }));

  return (
    <div style={{ height: 400, width: '100%' }}>
      <DataGrid
        rows={editableRows}
        columns={columnsWithEdit}
        pageSize={5}
        checkboxSelection
        onEditCellChange={handleEditCellChange}
      />
      <button onClick={handleSaveToDatabase}>Save to Database</button>
    </div>
  );
};

export default MyDataGrid;