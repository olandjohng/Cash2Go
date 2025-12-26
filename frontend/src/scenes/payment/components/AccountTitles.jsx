import { Autocomplete, Box, Button, Grid, IconButton, TextField, Typography } from '@mui/material'
import React, { useState } from 'react'
import useSWR from 'swr'
import axios from 'axios'
import { NumberInput } from '../../expenses/components/ExpensesVoucher'
import { DeleteOutlineOutlined } from '@mui/icons-material'
import api from '../../../utils/api';

const fetcher = async (url) => {
  const request = await api.get(url)
  return request.data
}

export default function AccountTitles({ paymentDataSetter, paymentData }) {
  const {data} = useSWR('/api/account-title/expenses', fetcher )
  const [accountTitles, setAccountTitles] = useState(paymentData.account_titles)
  
  const updateAccountTitles = (updateAccountTitle) => {
    paymentDataSetter((old) => ({...old, account_titles : updateAccountTitle}))
  } 

  const handleAddTitle = () => {
    const newItem = [...accountTitles, { category : null, credit : '0', debit : '0' } ]
    setAccountTitles(newItem)
    updateAccountTitles(newItem)
  }

  const handleDeleteTitle = (index) => {
    const filter = accountTitles.filter((_, i) => index != i );
    setAccountTitles(filter)
    updateAccountTitles(filter)
  }

  const handleEditItem = (field, index, value) => {
    const temp = [...accountTitles] // copy array as temp
    temp[index] = {...temp[index], [field] : value}
    
    setAccountTitles(temp)
    updateAccountTitles(temp)
  }

  return (
    <Box>
      <Button onClick={handleAddTitle} variant='outlined' color='success' size='small'>Add Account Title</Button>
      <Box mt={1.5}>
        {data &&
          <Grid container spacing='10px'>
            {accountTitles.length == 0 && 
              <Grid item xs>
                <Box textAlign='center'>
                  <Typography textTransform='uppercase'> Please Click "Add Account Title"</Typography> 
                </Box>
              </Grid>
            }
            { accountTitles.map((item, index) => {
              return (
              <>
                <Grid item xs={5}>
                  <Autocomplete
                    value={item.category}
                    options={data}
                    getOptionLabel={(option) => option.name}
                    renderOption={(props, option) => {
                      return (
                      <Box {...props} component='li' key={option.id} id={option.id}>
                        {option.name}
                      </Box>  
                      )
                    }}
                    onChange={(_, value) => { handleEditItem('category', index, value)}}
                    renderInput={(props) => {
                      return <TextField {...props} size='small' label='Category' />
                    }}
                  />
                </Grid>
                <Grid item xs={3}>
                  <NumberInput mask={Number} size='small' value={item.debit}  unmask='type'  thousandsSeparator=',' padFractionalZeros={true} radix="." label='Debit' 
                    onAccept={(value, mask) => { handleEditItem('debit', index, value) }}
                  />
                </Grid>
                <Grid item xs={3}>
                  <NumberInput mask={Number} size='small' value={item.credit}  unmask='type'  thousandsSeparator=',' padFractionalZeros={true} radix="." label='Credit' 
                    onAccept={(value, mask) =>  { handleEditItem('credit', index, value) }}
                  />
                </Grid>
                <Grid item xs>
                  <IconButton onClick={() => { handleDeleteTitle(index) }}  color='error'><DeleteOutlineOutlined/></IconButton>
                </Grid>
              </>
              )
            })}
          </Grid>
        }

      </Box>
    </Box>
  )
}
