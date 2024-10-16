import { Box, Grid, styled, TextField, MenuItem, Typography, Skeleton } from "@mui/material"
import { DataGrid } from '@mui/x-data-grid'
import Card from "./component/Card";
import { useEffect, useState } from "react";
import { toastErr, formatNumber } from '../../utils'
import LinearProgress from '@mui/material/LinearProgress';
import useSWR, { useSWRConfig } from 'swr'
import useSWRMutation from 'swr/mutation'

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

const fetcher = url => fetch(url).then(r => r.json())

const Dashboard = () => {
  const {data : weeklyCollectionData, isLoading : weeklyCollectionLoading} = useSWR('/api/loans/collections/week', fetcher)
  const {data : monthlyCollectionData, isLoading : monthlyCollectionLoading} = useSWR('/api/loans/collections/month', fetcher)
  const {data : yearlyCollectionData, isLoading : yearlyCollectionLoading} = useSWR('/api/loans/collections/year', fetcher)
  const {data : incomeData, isLoading : incomeLoading} = useSWR('/api/loans/collections/income', fetcher)
  const {data : birthdayData, isLoading: birthdayLoading} = useSWR('/api/customers/birthday', fetcher)
  
  const columns = [
    {field : 'due_date', headerName : 'Due Date' , width : 100},
    {field : 'pn_number', headerName : 'PN Number', width : 200},
    {field : 'full_name', headerName : 'Borrower Number', width : 200},
    {field : 'monthly_principal', headerName : 'Principal', width : 150},
    {field : 'monthly_interest', headerName : 'Interset', width : 150},
    {field : 'pr_number', headerName : 'PR Number', width : 150},
  ]

  const birthday_column = [
    {field : 'full_name', headerName : 'Name' , flex: 1, },
    {field : 'label', headerName : 'Desc', flex: 1, },
    {field : 'phone_number', headerName : 'Contact Number', flex: 1, },
    {field : 'date', headerName : 'Date', width : 150},
  ]

  const [income, setIcome] = useState({})
  const [type, setType] = useState(options[0].value)

  return (
    <Box paddingX='20px' height='100%' overflow='auto' >
      <Box display='flex' justifyContent='start' gap={2.5}>
        {incomeLoading ? (
          <>
            <Skeleton variant='rectangular' width={180} height={90}/>
            <Skeleton variant='rectangular' width={180} height={90}/>
            <Skeleton variant='rectangular' width={180} height={90}/>
          </>
        ) : (
          <>
            <Card title='Dialy Income' content={formatNumber.format(incomeData.data.daily)} />
            <Card title='Weekly Income' content={formatNumber.format(incomeData.data.weekly)} />
            <Card title='Monthly Income' content={formatNumber.format(incomeData.data.monthly)}/>
          
          </>
        )
        }
      </Box>
      <div >
        <div style={{height : '25rem'}} >
          <p style={{ padding : 16 , textTransform : 'uppercase', fontSize : 'medium'}}>Weekly Collection</p>
          {weeklyCollectionLoading ? (
            <Skeleton variant='rectangular' height='100%'/>
          ) : (
            <StlyedDataGrid loading={weeklyCollectionLoading}  rows={weeklyCollectionData.data} columns={columns} getRowId={(r) => r.loan_detail_id } getRowClassName={(params) => `status--${params.row.payment_status_id}`}/>
          )}
        </div>
        
        <div style={{height : '25rem', marginTop : 75}} >
          <div style={{ display : 'flex', justifyContent : 'space-between'}}>
            <p style={{ padding : 16 , textTransform : 'uppercase', fontSize : 'medium'}}>Monthly and Yearly Collections</p>
            <TextField sx={{py : 1.2}}  select size="small" defaultValue={type} value={type} 
              onChange={(e) => {
                setType(e.target.value)
              }}>
              {options.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </div>
           {type === 'month' ?
              (
                <MonthlyCollectionsDataGrid columns={columns} isLoading={monthlyCollectionLoading} monthlyCollection={monthlyCollectionData} />
              ) : (
                <YearlyCollectionsDataGrid columns={columns} isLoading={yearlyCollectionLoading} yearlyCollection={yearlyCollectionData} />
              )
            }
        </div>
        
        <div style={{height : '25rem', marginTop : 75}} >
          <p style={{ padding : 16 , textTransform : 'uppercase', fontSize : 'medium'}}>Birthday</p>
          <BirthdayDataGrid columns={birthday_column} birthdayData={birthdayData} isLoading={birthdayLoading} />
        </div>
      </div>
      {/* <Box display='flex' gap='10px' mt='5px' height='35rem'>
        <Box flex={1} width='49%'>
          <p style={{ padding : 16 , textTransform : 'uppercase', fontSize : 'medium'}}>Weekly Collection</p>
          <StlyedDataGrid  rows={weeklyCollection} columns={columns} getRowId={(r) => r.loan_detail_id } getRowClassName={(params) => `status--${params.row.payment_status_id}`}/>
        </Box>
        <div style={{ flex : 1, width : '49%',}}>
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
        
      </Box> */}
      {/* <DataGrid columns={columns} rows={[]}/> */}
      {/* <StlyedDataGrid  rows={weeklyCollection} columns={columns} getRowId={(r) => r.loan_detail_id } getRowClassName={(params) => `status--${params.row.payment_status_id}`}/> */}
      
    </Box>
  )
}

function MonthlyCollectionsDataGrid ({columns, monthlyCollection, isLoading }) {
  return isLoading ? <Skeleton variant='rectangular' height='100%' /> :  <StlyedDataGrid columns={columns} rows={monthlyCollection.data} getRowId={(r) => r.loan_detail_id } getRowClassName={(params) => `status--${params.row.payment_status_id}`}/>
}
function YearlyCollectionsDataGrid ({columns, yearlyCollection, isLoading }) {
   return isLoading ? <Skeleton variant='rectangular' height='100%' /> : <StlyedDataGrid  columns={columns} rows={ yearlyCollection.data} getRowId={(r) => r.loan_detail_id } getRowClassName={(params) => `status--${params.row.payment_status_id}`}/>
}

function BirthdayDataGrid({columns, birthdayData, isLoading}) {
  return isLoading ? <Skeleton variant='rectangular' height='100%' /> : <DataGrid columns={columns} rows={birthdayData.data}/> 
}

export default Dashboard