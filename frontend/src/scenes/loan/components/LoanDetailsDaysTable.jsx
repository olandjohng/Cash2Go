import { useTheme } from '@emotion/react';
import { DeleteOutlined } from '@mui/icons-material';
import { Box, Button, InputBase, Typography, Tooltip, styled, tooltipClasses } from '@mui/material';
import { DataGrid, GridActionsCellItem, GridToolbarContainer, useGridApiContext } from '@mui/x-data-grid';
import React, { useEffect, useState, useCallback, useRef } from 'react'
import { tokens } from '../../../theme';
import { DatePicker } from '@mui/x-date-pickers';
import dayjs from 'dayjs';
import CurrencyInput from './fields/CurrencyInput';

function EditToolbar(props) {
  const {setRows, rows} = props
  
  const handleClick = () => {
    const id = rows.length + 1
    setRows((oldRows) => [...oldRows, { 
      id, 
      dueDate: null, 
      principal: '', 
      interest: '', 
      numberDays: '', 
      bank_name: null, 
      checkNumber: '', 
      check_date: null, 
      net_proceeds: '', 
      isNew: true
    }])
  }

  return (
    <GridToolbarContainer>
      <Button color='secondary' onClick={handleClick}>
        Add PDC
      </Button>
    </GridToolbarContainer>
  )
}

const formatNumber = (params) => {
  if (!params.value && params.value !== 0) return ''
  const format = Number(params.value).toLocaleString('en', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2 
  })
  return format
}

const StyledToolTip = styled(({className, ...props}) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: theme.palette.error.main,
    color: theme.palette.error.contrastText,
  },
}));

const WrappedGridEditDateInput = React.forwardRef((props, ref) => {
  const { InputProps, inputProps, ...other } = props;
  return (
    <InputBase
      sx={{ padding: '0 15px', fontSize: 'inherit' }}
      ref={ref}
      inputProps={inputProps}
      {...other}
    />
  );
});

WrappedGridEditDateInput.displayName = 'WrappedGridEditDateInput';

const GridDatePicker = (params) => {
  const apiRef = useGridApiContext();
  const { value, id, field } = params;

  const handleChange = (newValue) => {
    apiRef.current.setEditCellValue({ id, field, value: newValue });
  };

  const handleAccept = (newValue) => {
    apiRef.current.setEditCellValue({ id, field, value: newValue });
    // Auto-close edit mode after selecting date
    setTimeout(() => {
      apiRef.current.stopCellEditMode({
        id,
        field,
        ignoreModifications: false,
      });
    }, 0);
  };

  return (
    <DatePicker
      value={value}
      sx={{ px: 1.5, width: '100%' }}
      onChange={handleChange}
      onAccept={handleAccept}
      open={true}
      slotProps={{
        textField: {
          variant: 'standard',
          fullWidth: true,
        },
      }}
      slots={{
        textField: WrappedGridEditDateInput,
      }}
    />
  );
};

// Make GridCurrency a proper React component to use hooks
const GridCurrencyEdit = React.memo((props) => {
  const {params} = props
  const refApi = useGridApiContext()
  const {value, id, field, hasFocus} = params
  const inputRef = useRef(null)
  
  const handleChange = (newValue) => {
    refApi.current.setEditCellValue({ id, field, value: newValue.floatValue })
  }

  // Auto-select text when entering edit mode
  useEffect(() => {
    if (hasFocus && inputRef.current) {
      const input = inputRef.current.querySelector('input')
      if (input) {
        setTimeout(() => {
          input.select()
        }, 0)
      }
    }
  }, [hasFocus])
  
  return (
    <Box ref={inputRef}>
      <CurrencyInput 
        sx={{px: 1.5}} 
        value={value || ''} 
        customInput={InputBase} 
        onValueChange={handleChange}
        autoFocus={hasFocus}
      />
    </Box>
  )
})

GridCurrencyEdit.displayName = 'GridCurrencyEdit'

// Wrapper function for renderEditCell
const GridCurrency = (params) => {
  return <GridCurrencyEdit params={params} />
}

const CustomFooter = (props) => {
  return (
    <Box margin={1}>
      <Box display='flex'>
        <Box display='flex' alignItems='center' width={'20%'}> 
          <Typography>Total</Typography>
        </Box>
        <Box flex={1}>
          <Box mx={1} display='flex' alignItems='center'>
            <Typography flex={1}>Check Amount</Typography>
            <Typography flex={1}>Interest</Typography>
            <Typography flex={1}>Net Proceeds</Typography>
          </Box>
          <Box mx={1} display='flex' alignItems='center'>
            <CurrencyInput 
              displayType='text' 
              value={props.principal_total} 
              renderText={(val) => <Typography flex={1}>{val}</Typography>} 
            /> 
            <CurrencyInput 
              value={props.interest_total} 
              displayType='text' 
              renderText={(val) => <Typography flex={1}>{val}</Typography>} 
            />
            <CurrencyInput 
              value={props.amortization_total} 
              displayType='text' 
              renderText={(val) => <Typography flex={1}>{val}</Typography>} 
            />
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

export default function LoanDetailsDaysTable({banks, rows, setRows, formValue}) {
  const theme = useTheme()
  const colors = tokens(theme.palette.mode)
  const [principalTotal, setPrincipalTotal] = useState(0)
  const [interestTotal, setInterestTotal] = useState(0)
  const [netProceeds, setNetProceeds] = useState(0)
  const apiRef = useRef(null)
  
  const handleDelete = (id) => {
    const filterRows = rows.filter((row) => row.id !== id).map((r, i) => ({...r, id: i + 1}))
    setRows(filterRows)
  }

  const handleProcessRowUpdate = useCallback((newRow, oldRow) => {
    let numberDays = newRow.numberDays
    if (newRow.dueDate && newRow.dueDate !== oldRow.dueDate) {
      const now = dayjs()
      numberDays = Math.abs(now.diff(dayjs(newRow.dueDate), 'day')) + 1
    }
    
    const netProceeds = (Number(newRow.principal) || 0) - (Number(newRow.interest) || 0)
    
    const updatedRow = {
      ...newRow,
      numberDays,
      net_proceeds: netProceeds,
      isNew: false
    }
    
    setRows((prevRows) => 
      prevRows.map((row) => (row.id === updatedRow.id ? updatedRow : row))
    )
    
    return updatedRow
  }, [setRows])

  const handleProcessRowUpdateError = useCallback((error) => {
    console.error('Row update error:', error)
  }, [])
  
  useEffect(() => {
    setPrincipalTotal(rows.reduce((acc, cur) => acc + (Number(cur.principal) || 0), 0))
    setInterestTotal(rows.reduce((acc, cur) => acc + (Number(cur.interest) || 0), 0))
    setNetProceeds(rows.reduce((acc, cur) => acc + (Number(cur.net_proceeds) || 0), 0))
  }, [rows])

  const editableFields = ['dueDate', 'check_date', 'principal', 'bank_name', 'checkNumber', 'interest']

  const columns = [
    { 
      field: 'dueDate', 
      headerName: 'Cleared Date', 
      editable: true, 
      width: 150,
      type: 'date',
      renderEditCell: (params) => <GridDatePicker {...params} />,
      valueFormatter: (params) => {
        if (params.value) {
          return dayjs(params.value).format('MM/DD/YYYY')
        }
        return ''
      }
    },
    { 
      field: 'check_date', 
      headerName: 'Check Date', 
      editable: true, 
      width: 150,
      type: 'date',
      renderEditCell: (params) => <GridDatePicker {...params} />,
      valueFormatter: (params) => {
        if (params.value) {
          return dayjs(params.value).format('MM/DD/YYYY')
        }
        return ''
      }
    },
    { 
      field: 'principal', 
      headerName: 'Check Amount', 
      width: 150, 
      editable: true,
      type: 'number',
      valueFormatter: (params) => formatNumber(params),
      renderEditCell: GridCurrency,
      preProcessEditCellProps: (params) => {
        const hasError = Number(params.props.value) <= 0 && params.props.value !== '' && params.props.value !== undefined
        return { ...params.props, error: hasError ? 'Invalid Amount' : null }
      }
    },
    { 
      field: 'bank_name', 
      headerName: 'Bank', 
      width: 120, 
      editable: true, 
      type: 'singleSelect', 
      valueOptions: banks.filter((b) => +b.owner === 0),
      getOptionValue: (value) => value.bank_branch,
      getOptionLabel: (value) => value.bank_branch,
    },
    { 
      field: 'checkNumber', 
      headerName: 'Check Number', 
      width: 120, 
      editable: true
    },
    { 
      field: 'numberDays', 
      headerName: 'NO. of Days', 
      width: 120, 
      editable: false,
      valueGetter: (params) => {
        if (params.row.dueDate) {
          const now = dayjs()
          return Math.abs(now.diff(dayjs(params.row.dueDate), 'day')) + 1
        }
        return ''
      }
    }, 
    { 
      field: 'interest', 
      headerName: 'Interest', 
      width: 150, 
      editable: true,
      type: 'number',
      valueFormatter: (params) => formatNumber(params),
      renderEditCell: GridCurrency,
      preProcessEditCellProps: (params) => {
        const hasError = params.props.value === undefined || (Number(params.props.value) < 0 && params.props.value !== '')
        return { ...params.props, error: hasError ? 'Invalid Amount' : null }
      }
    },
    { 
      field: 'net_proceeds', 
      headerName: 'Net Proceeds', 
      editable: false, 
      width: 150,
      valueFormatter: (params) => formatNumber(params),
      valueGetter: (params) => {
        return (Number(params.row.principal) || 0) - (Number(params.row.interest) || 0)
      }
    },
    { 
      field: 'action', 
      type: 'actions',
      getActions: ({id}) => [
        <GridActionsCellItem
          icon={<DeleteOutlined/>}
          color='inherit'
          label='delete'
          sx={{color: colors.redAccent[500]}}
          onClick={() => handleDelete(id)}
        />
      ]
    },
  ]

  // Helper function to start editing a cell
  const startEditingCell = useCallback((rowId, field) => {
    if (apiRef.current) {
      apiRef.current.startCellEditMode({ id: rowId, field })
    }
  }, [])

  // Helper function to stop editing current cell
  const stopEditingCell = useCallback((rowId, field) => {
    if (apiRef.current && rowId && field) {
      apiRef.current.stopCellEditMode({ 
        id: rowId,
        field: field,
        ignoreModifications: false 
      })
    }
  }, [])

  return (
    <DataGrid
      apiRef={apiRef}
      columns={columns}
      rows={rows}
      editMode="cell"
      processRowUpdate={handleProcessRowUpdate}
      onProcessRowUpdateError={handleProcessRowUpdateError}
      slots={{
        toolbar: EditToolbar,
        footer: CustomFooter
      }}
      slotProps={{
        toolbar: {setRows, rows},
        footer: {
          principal_total: principalTotal,
          interest_total: interestTotal,
          amortization_total: netProceeds
        }
      }}
      disableRowSelectionOnClick
      onCellClick={(params, event) => {
        // Start editing immediately on click for editable cells
        if (params.isEditable && editableFields.includes(params.field)) {
          event.defaultMuiPrevented = true
          startEditingCell(params.id, params.field)
        }
      }}
      onCellKeyDown={(params, event) => {
        const {field, id, isEditable, cellMode} = params
        
        // Only handle navigation when NOT in edit mode
        if (cellMode === 'view' && isEditable && editableFields.includes(field)) {
          const currentRowIndex = rows.findIndex(row => row.id === id)
          const currentFieldIndex = editableFields.indexOf(field)
          
          // Enter key - start editing current cell
          if (event.key === 'Enter') {
            event.preventDefault()
            event.stopPropagation()
            startEditingCell(id, field)
            return
          }
          
          // Arrow Down - move to same column, next row
          if (event.key === 'ArrowDown' && currentRowIndex < rows.length - 1) {
            event.preventDefault()
            event.stopPropagation()
            const nextRowId = rows[currentRowIndex + 1].id
            if (apiRef.current) {
              apiRef.current.setCellFocus(nextRowId, field)
            }
            return
          }
          
          // Arrow Up - move to same column, previous row
          if (event.key === 'ArrowUp' && currentRowIndex > 0) {
            event.preventDefault()
            event.stopPropagation()
            const prevRowId = rows[currentRowIndex - 1].id
            if (apiRef.current) {
              apiRef.current.setCellFocus(prevRowId, field)
            }
            return
          }
          
          // Arrow Right - move to next editable column
          if (event.key === 'ArrowRight' && currentFieldIndex < editableFields.length - 1) {
            event.preventDefault()
            event.stopPropagation()
            const nextField = editableFields[currentFieldIndex + 1]
            if (apiRef.current) {
              apiRef.current.setCellFocus(id, nextField)
            }
            return
          }
          
          // Arrow Left - move to previous editable column
          if (event.key === 'ArrowLeft' && currentFieldIndex > 0) {
            event.preventDefault()
            event.stopPropagation()
            const prevField = editableFields[currentFieldIndex - 1]
            if (apiRef.current) {
              apiRef.current.setCellFocus(id, prevField)
            }
            return
          }

          // Tab key - move to next editable cell
          if (event.key === 'Tab' && !event.shiftKey) {
            event.preventDefault()
            event.stopPropagation()
            
            if (currentFieldIndex < editableFields.length - 1) {
              const nextField = editableFields[currentFieldIndex + 1]
              if (apiRef.current) {
                apiRef.current.setCellFocus(id, nextField)
              }
            } else if (currentRowIndex < rows.length - 1) {
              const nextRowId = rows[currentRowIndex + 1].id
              if (apiRef.current) {
                apiRef.current.setCellFocus(nextRowId, editableFields[0])
              }
            }
            return
          }
          
          // Shift+Tab - move to previous editable cell
          if (event.key === 'Tab' && event.shiftKey) {
            event.preventDefault()
            event.stopPropagation()
            
            if (currentFieldIndex > 0) {
              const prevField = editableFields[currentFieldIndex - 1]
              if (apiRef.current) {
                apiRef.current.setCellFocus(id, prevField)
              }
            } else if (currentRowIndex > 0) {
              const prevRowId = rows[currentRowIndex - 1].id
              if (apiRef.current) {
                apiRef.current.setCellFocus(prevRowId, editableFields[editableFields.length - 1])
              }
            }
            return
          }
        }
        
        // When IN edit mode, handle Tab to save and move
        if (cellMode === 'edit') {
          const currentRowIndex = rows.findIndex(row => row.id === id)
          const currentFieldIndex = editableFields.indexOf(field)
          
          // Tab - save current cell and move to next
          if (event.key === 'Tab' && !event.shiftKey) {
            event.preventDefault()
            event.stopPropagation()
            stopEditingCell(id, field)
            
            setTimeout(() => {
              if (currentFieldIndex < editableFields.length - 1) {
                const nextField = editableFields[currentFieldIndex + 1]
                if (apiRef.current) {
                  apiRef.current.setCellFocus(id, nextField)
                  setTimeout(() => startEditingCell(id, nextField), 50)
                }
              } else if (currentRowIndex < rows.length - 1) {
                const nextRowId = rows[currentRowIndex + 1].id
                if (apiRef.current) {
                  apiRef.current.setCellFocus(nextRowId, editableFields[0])
                  setTimeout(() => startEditingCell(nextRowId, editableFields[0]), 50)
                }
              }
            }, 50)
            return
          }
          
          // Shift+Tab - save current cell and move to previous
          if (event.key === 'Tab' && event.shiftKey) {
            event.preventDefault()
            event.stopPropagation()
            stopEditingCell(id, field)
            
            setTimeout(() => {
              if (currentFieldIndex > 0) {
                const prevField = editableFields[currentFieldIndex - 1]
                if (apiRef.current) {
                  apiRef.current.setCellFocus(id, prevField)
                  setTimeout(() => startEditingCell(id, prevField), 50)
                }
              } else if (currentRowIndex > 0) {
                const prevRowId = rows[currentRowIndex - 1].id
                if (apiRef.current) {
                  apiRef.current.setCellFocus(prevRowId, editableFields[editableFields.length - 1])
                  setTimeout(() => startEditingCell(prevRowId, editableFields[editableFields.length - 1]), 50)
                }
              }
            }, 50)
            return
          }
          
          // Enter - save and move to next row same column
          if (event.key === 'Enter') {
            event.preventDefault()
            event.stopPropagation()
            stopEditingCell(id, field)
            
            setTimeout(() => {
              if (currentRowIndex < rows.length - 1) {
                const nextRowId = rows[currentRowIndex + 1].id
                if (apiRef.current) {
                  apiRef.current.setCellFocus(nextRowId, field)
                  setTimeout(() => startEditingCell(nextRowId, field), 50)
                }
              }
            }, 50)
            return
          }
        }
      }}
    />
  )
}