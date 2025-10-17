import { useEffect, useState } from 'react'
import Header from '../../components/Header'
import { DataGrid } from '@mui/x-data-grid'
import Popups from '../../components/Popups'
import { DeleteOutlined, EditCalendarOutlined } from '@mui/icons-material'
import { Box, Button, Tooltip } from '@mui/material'
import { useTheme } from '@emotion/react'
import { tokens } from '../../theme'
import { Bounce, toast } from 'react-toastify'
import { Link, useLocation } from 'react-router-dom'
import 'react-toastify/dist/ReactToastify.css'
import SequenceForm from './components/SequenceForm'
import { useSequence } from '../../hooks/useSequence' // ← Add this import

export default function Sequence() {
  const [sequences, setSequences] = useState([])
  const theme = useTheme()
  const colors = tokens(theme.palette.mode)
  const loc = useLocation()
  const [openPopup, setOpenPopup] = useState(false)
  
  // ← Use the custom hook
  const { getAllSequences, deleteSequence, loading, error } = useSequence()

  const loadSequenceData = async () => {
    try {
      const data = await getAllSequences() // ← Use hook method
      setSequences(data)
    } catch (error) {
      console.error('Error loading sequence data:', error)
      toast.error('Failed to load sequences', {
        position: 'top-right',
        autoClose: 3000,
        theme: 'colored',
        transition: Bounce,
      })
    }
  }

  const columns = [
    { field: 'sequenceType', flex: 1, headerName: 'Sequence Type' },
    { field: 'description', flex: 1, headerName: 'Description' },
    { 
      field: 'formattedCurrentValue', 
      flex: 1, 
      headerName: 'Current Value',
      align: 'right',
      headerAlign: 'right'
    },
    { field: 'prefix', flex: 0.5, headerName: 'Prefix' },
    { field: 'suffix', flex: 0.5, headerName: 'Suffix' },
    { 
      field: 'isActive', 
      flex: 0.5, 
      headerName: 'Active',
      renderCell: (params) => (
        <span style={{ color: params.value ? colors.greenAccent[400] : colors.redAccent[500] }}>
          {params.value ? 'Yes' : 'No'}
        </span>
      )
    },
    {
      field: 'actions',
      headerName: '',
      sortable: false,
      width: 150,
      renderCell: (params) => (
        <div className='flex items-center justify-between'>
          <Tooltip title="Edit" placement="top" arrow>
            <Button
              component={Link}
              to={`/sequence/${params.row.sequenceType}`}
              sx={{ color: colors.greenAccent[400], cursor: 'auto' }}
              onClick={() => setOpenPopup(true)}
            >
              <EditCalendarOutlined sx={{ cursor: 'pointer' }} />
            </Button>
          </Tooltip>
          <Tooltip title="Delete" placement="top" arrow>
            <Button
              sx={{ color: colors.redAccent[500], cursor: 'auto' }}
              onClick={() => handleDelete(params.row.sequenceType)}
            >
              <DeleteOutlined sx={{ cursor: 'pointer' }} />
            </Button>
          </Tooltip>
        </div>
      ),
    },
  ]

  const handleSequenceAdded = () => {
    loadSequenceData()
  }

  const handleDelete = async (sequenceType) => {
    const isConfirmed = window.confirm('Are you sure you want to delete this sequence?')
    if (!isConfirmed) {
      return
    }

    try {
      await deleteSequence(sequenceType) // ← Use hook method
      loadSequenceData()
      toast.success('Sequence Successfully Deleted!', {
        position: 'top-right',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: 'colored',
        transition: Bounce,
      })
    } catch (error) {
      console.error('Error deleting sequence:', error)
      toast.error(error.message || 'Error deleting sequence, Please try again!', {
        position: 'top-right',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: 'colored',
        transition: Bounce,
      })
    }
  }

  const handleClosePopup = () => {
    setOpenPopup(false)
  }

  useEffect(() => {
    loadSequenceData()
  }, [])

  return (
    <Box padding={2} height='100%' display='flex' flexDirection='column'>
      <Header
        title={'Sequence Settings'}
        showButton={true}
        onAddButtonClick={() => setOpenPopup(true)}
        toURL={loc.pathname + '/new'}
      />
      <Box flex={1} position='relative'>
        <Box sx={{ position: 'absolute', inset: 0 }}>
          <DataGrid 
            columns={columns} 
            rows={sequences} 
            getRowId={(row) => row.sequenceType}
            loading={loading} // ← Add loading state
          />
        </Box>
      </Box>

      <Popups
        title="Sequence"
        openPopup={openPopup}
        setOpenPopup={setOpenPopup}
        toURL={'/sequence'}
      >
        <SequenceForm
          onSequenceAdded={handleSequenceAdded}
          onClosePopup={handleClosePopup}
        />
      </Popups>
    </Box>
  )
}