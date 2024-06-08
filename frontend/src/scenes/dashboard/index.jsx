import { Box, Grid, styled, TextField, MenuItem, Typography } from "@mui/material"
import { DataGrid } from '@mui/x-data-grid'
import Header from "../../components/Header"
import { useTheme } from "@emotion/react";
import { tokens } from "../../theme";
import Card from "./component/Card";
import { useEffect, useState } from "react";
import { toastErr, formatNumber } from '../../utils'
// import { MenuItem } from "react-pro-sidebar";
import LinearProgress from '@mui/material/LinearProgress';


const StlyedDataGrid = styled(DataGrid)({
  '& .status--4' : {
    backgroundColor : '#78350f',
    '&:hover': {
      backgroundColor : '#92400e'
    }
  },
  '& .status--1' : {
    backgroundColor : '#14532d',
    '&:hover': {
      backgroundColor : '#15803d'
    }
  }
})
const options = [
  {value : 'month', label : 'month'},
  {value : 'year', label : 'year'},
]
const Dashboard = () => {
  const columns = [
    {field : 'due_date', headerName : 'Due Date' , width : 100},
    {field : 'pn_number', headerName : 'PN Number', width : 200},
    {field : 'full_name', headerName : 'Borrower Number', width : 200},
    {field : 'monthly_principal', headerName : 'Principal', width : 150},
    {field : 'monthly_interest', headerName : 'Interset', width : 150},
    {field : 'pr_number', headerName : 'PR Number', width : 150},
  ]
  const [weeklyCollection, setWeeklyCollection] = useState([])
  const [monthlyCollection, setMonthlyCollection] = useState([])
  const [yearlyCollection, setYearlyCollection] = useState([])
  const [income, setIcome] = useState({})
  const [type, setType] = useState(options[0].value)
  const [isLoading , setIsLoading] = useState(false)

  useEffect(()=> {
    const abortController = new AbortController();
    const getData = async () => {

      const params = new URLSearchParams({type : type}).toString()
      try {
        setIsLoading(true)
        const reqData = await fetch('/api/loans/collections?' + params , 
        {
          signal : abortController.signal
        })
        
        if(!reqData.ok) {
          return toastErr('Something went Wrong!', 5)
        }

        const dataJSON = await reqData.json()

        setWeeklyCollection(dataJSON.weeklyCollection)
        setMonthlyCollection(dataJSON.monthlyCollection)
        setYearlyCollection(dataJSON.yearlyCollection)
        setIcome(dataJSON.income)
        setIsLoading(false)
      } catch (error) {
        if(error.name === 'AbortError') {

        }
      }
    }
      getData()
    return () => {
      abortController.abort()
    }
  },[type])

  if(isLoading) {
    return (
    <Box sx={{ width: '100%' }}>
      <LinearProgress color="success" />
    </Box>
    )
  }

  return (
    <div style={{ height: "75%", padding: 20}}>

      <Box display='flex' justifyContent='start' gap={2.5}>
        <Card title='Dialy Income' content={formatNumber.format(income?.daily)} />
        <Card title='Weekly Income' content={formatNumber.format(income?.weekly)} />
        <Card title='Monthly Income' content={formatNumber.format(income?.monthly)}/>
      </Box>
      <Box display='flex' gap={2} height='90%' mt={3}>
        <div style={{ flex : 1, width : '49%'}}>
          <p style={{ padding : 16 , textTransform : 'uppercase', fontSize : 'medium'}}>Weekly Collection</p>
          <StlyedDataGrid rows={weeklyCollection} columns={columns} getRowId={(r) => r.loan_detail_id } getRowClassName={(params) => `status--${params.row.payment_status_id}`}/>
        </div>
        <div style={{ flex : 1, width : '49%'}}>
          <div style={{ display : 'flex', justifyContent : 'end'}}>
            <TextField sx={{py : 1.2}}  select size="small" defaultValue={type} value={type} onChange={(e) => setType(e.target.value)}>
              {options.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </div>
          {type === 'month' ? (
            <StlyedDataGrid  columns={columns} rows={ monthlyCollection} getRowId={(r) => r.loan_detail_id } getRowClassName={(params) => `status--${params.row.payment_status_id}`}/>

          ) : (<StlyedDataGrid  columns={columns} rows={ yearlyCollection} getRowId={(r) => r.loan_detail_id } getRowClassName={(params) => `status--${params.row.payment_status_id}`}/>)}
        </div>
      </Box>
      

    </div>
  )
}

export default Dashboard