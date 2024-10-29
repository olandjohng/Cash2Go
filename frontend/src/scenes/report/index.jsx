import React, { useRef, useState } from 'react'
import Header from '../../components/Header'
import { Box, Button , Grid, MenuItem, TextField, Typography } from '@mui/material'
import { useTheme } from '@emotion/react';
import { tokens } from '../../theme';
import { toastErr, toastSucc } from '../../utils';
import * as yup from 'yup'
import { useFormik } from 'formik';
import { DataGrid, GridActionsCell, GridActionsCellItem } from '@mui/x-data-grid';
import useSWR from 'swr'
import useSWRMutation from 'swr/mutation'

import { DeleteForeverOutlined, DeleteOutline, DeleteRounded } from '@mui/icons-material';

const fetcher = url => fetch(url).then(res => res.json())

const denomSchema = yup.object({
  type : yup.string().required(),
  denomination : yup.string().required(),
  quantity: yup.string().required(),
})


export default function Report() {
  const [denoms, setDenoms] = useState([])
  const { data, isLoading} = useSWR('/api/reports', fetcher, 
    { 
      // onSuccess : (data) => setDenoms(data.denoms)
    })
  const theme = useTheme();
  // const colors = tokens(theme.palette.mode);

  const denom_column = [
    { field: "type", headerName: "Type" },
    { field: "denomination", headerName: "Denomination",  flex : 1 },
    { field: "quantity", headerName: "Quantity",  flex : 1 },
    { field: "total", headerName: "Total" ,  flex : 1},
    { field: "actions",  type: "actions",
      getActions : (params) => [
        <GridActionsCellItem 
          label='Delete'
          icon={<DeleteOutline color='error' />}
          onClick={() => {
            const filter = denoms.filter((val) => val.id != params.id)
            setDenoms(filter)
          }}
        />
      ]
      
    },
  ]

  const payment_column = [
    { field: "payment_type", headerName: "Type" },
    { field: "receipt_num",  headerName: "Receipt Num" },
    { field: "full_name", headerName: "Full Name", flex : 1 },
    { field: "total",  headerName: "Total" },
    
  ] 

  return (
    <div style={{ padding: 20 , height: "90%" }}>
      <Header title='Report' showButton={false} />
      <div style={{display : 'flex', height: '90%', gap : '5px'}}>
        <DataGrid
        sx={{ height: "100%" }} 
        columns={denom_column} 
        rows={denoms}
        slots={{
          toolbar : TollBar,
          footer : FooterSave
        }}
        slotProps={{
          toolbar: { setDenoms, denoms},
          footer: { total : denoms.reduce((acc, cur) => acc + cur.total, 0), data : denoms}
        }}
        />
        {!isLoading &&
          <DataGrid

          sx={{ height: "100%" }} 
          slots={{
            footer : FooterTotal
          }}
          slotProps={{
            footer: { total : data.total }
          }}
          loading={isLoading} columns={payment_column} rows={data.details} />
        }
      </div>
        {/* <Box display='flex' height='85%' gap='10px' >
          <Grid container  spacing={1} >
            <Grid item xs={6}>
              <DataGrid
                sx={{ height: "100%" }} 
                columns={denom_column} 
                rows={denoms}
                slots={{
                  toolbar : TollBar,
                  footer : FooterSave
                }}
                slotProps={{
                  toolbar: { setDenoms, denoms},
                  footer: { total : denoms.reduce((acc, cur) => acc + cur.total, 0), data : denoms}
                }}
                />
            </Grid>
            <Grid item xs={6}>
              {!isLoading &&
                <DataGrid

                sx={{ height: "100%" }} 
                slots={{
                  footer : FooterTotal
                }}
                slotProps={{
                  footer: { total : data.total }
                }}
                loading={isLoading} columns={payment_column} rows={data.details} />
              }
            </Grid>

          </Grid>
        </Box> */}
    </div>
  )
}

function FooterTotal(props) {
  
  return (
    <Box display='flex' padding={2} justifyContent='end' borderTop={1}>
      <Typography>Total : {props.total}</Typography>
    </Box>
  )
}


async function save(url, {arg}) {
  return await fetch(url, {
    method: 'POST',
    headers : {
      "Content-Type": "application/json",
    },
    body : JSON.stringify({ denoms : arg})
  })
}

function FooterSave(props) {

  const {trigger, isMutating} = useSWRMutation('api/reports', save )


  const handleClickedSave = async () => {
    const request =  await trigger(props.data)
    if(!request.ok) {
      return toastErr('Something went wrong')
    }
    
    const response = await request.json()
    
    if(response.success) {
      return toastSucc('Save Successfully')
    }
    
    return toastErr('Something went wrong')
    
  }

  return (
    <Box display='flex' padding={2} justifyContent='space-between' borderTop={1}>
      <Button size='small' disabled={isMutating} variant='outlined' color='success' style={{ padding : '0px'}} onClick={handleClickedSave}>Save</Button>
      <Typography>Total : {props.total}</Typography>
    </Box>
  )
}


function TollBar(props) {

  const formik = useFormik({
    initialValues : {
      type : '',
      denomination : '',
      quantity : ''
    },
    validationSchema : denomSchema,
    onSubmit : (value) => {
      addDenomination(value)
    }
  })


  const addDenomination = (value) => {
  
    const id = props.denoms.reduce((acc, curr) => acc = curr.id, 0)

    const denoms = [...props.denoms, {
      id : id + 1,
      type : value.type,
      denomination: value.denomination,
      quantity:  value.quantity,
      total : Number(value.denomination) * Number(value.quantity)
    }]

    props.setDenoms(denoms)
    formik.resetForm();
    
  }

  return (
    <form onSubmit={formik.handleSubmit}>
      <Box display='flex' padding='10px' gap='5px'>
      <TextField label='Type' style={{ width : 100}} name='type' id='type' value={formik.values?.type} select onChange={formik.handleChange}>
        <MenuItem value='coin'>Coin</MenuItem>
        <MenuItem value='bill'>Bill</MenuItem>
        <MenuItem value='check'>Check</MenuItem>
      </TextField>
      <TextField type='number' name='denomination' id='denomination' value={formik.values?.denomination} onChange={formik.handleChange} label='Denomination' />
      <TextField type='number' name='quantity' id='quantity' onChange={formik.handleChange} value={formik.values?.quantity} label='Quantity' />
      <Button sx={{flex : 1}} type='submit' color='success' variant='outlined'>ADD</Button>
      </Box>
    </form>
  )
}
