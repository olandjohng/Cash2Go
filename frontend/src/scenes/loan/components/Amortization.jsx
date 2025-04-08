import React, { useState } from 'react'
import Papa from 'papaparse'
import {  Box, Button, Grid,} from '@mui/material'
import { MuiFileInput } from 'mui-file-input'
import { AttachFile } from '@mui/icons-material'
import LoanDetailsTable from './LoanDetailsTable'
import dayjs from 'dayjs'
import { toast } from 'react-toastify'

export default function Amortization({banks, headerId, success}) {
  const [details, setDetails] = useState([])
  const [file, setFile] = useState(null)
  const [loanType, setLoanType] = useState('months')

  const handleSubmit = () => {
    if(details.length <= 0) { return }

    const transformDetails = details.map((d) => {
      let item = {...d , dueDate : d.dueDate.format()}
      // return null
      // console.log(item)
      console.log(item.bank_name)
      for (const b of banks) {
        if(item.bank_name === b.bank_branch) {
          item = {...item, bank_account_id : b.id }
        }
      }
      if(item.check_date)
        return {...item, check_date : item.check_date.format()};  
      return {...item};
    })


    fetch('/api/loans/details', {
      method : 'POST',
      headers: {
        "Content-Type": "application/json",
      },
      body : JSON.stringify({
        header_id : headerId,
        details : transformDetails
      }) 
    })
    .then((res) => {
      // console.log(res.status)
      if(res.status == 200) {
        toast.success('Save successfully!')
        return success()
      }
      toast.error('Something went wrong!')
    })
    .catch(() => toast.error('Something went wrong!'))
  }

  const handleGenerate = (file) => {
    if(!file) {return}

    Papa.parse(file, {
      header : true,
      skipEmptyLines : true,
      complete : (result, file) => {
        const data = result.data.map((v, i) => ({
          ...v, id : i + 1
        }))
        // setRows(data)
        setDetails(data)
      },
      transform : (value, field) => {
        if(field === 'dueDate') {
          return dayjs(value)
        }
        if(field === 'check_date'){
          return dayjs(value)
        }

        if(field === 'amortization' || field === 'interest' || field === 'principal') {
          return Number(value.replace(/[^0-9.-]+/g,""))
        }
        return value.trim()
      }
    })
  }
  return (
    // <div style={{ width : 850, paddingTop : 15}}>
    <Box width={900}>
      <Grid container spacing={1}>
        <Grid item xs={12}>
          <Box display='flex' justifyContent='space-between' width='100%'>
            <Box width='100%' display='flex' gap={1}>
              <MuiFileInput
                value={file}
                placeholder='Upload .csv file'
                hideSizeText 
                getInputText={(value) => value ? value.name : ''}
                size='small'
                sx={{ width : '200px' }}
                InputProps={{ startAdornment : <AttachFile /> }}
                inputProps={{ accept : '.csv'}}
                onChange={ async (file) => { setFile(file) }} 
              />
              <Button color='success' variant='outlined'
              onClick={() => handleGenerate(file)}
              >Generate</Button>
            </Box>
            <Button variant='outlined' color='success' onClick={() => handleSubmit()}>Save</Button>
          </Box>
          {/* <Box display='flex' alignItems='center' gap={3}>
            <Autocomplete sx={{mt : 2 , width : 150}} 
              options={['months', 'days']} 
              value={loanType}
              defaultValue={loanType}
              onInputChange={ (event, value) => setLoanType(value) }
              renderInput={(params) => <TextField {...params} label='Term Type' size='small'/>}
            />
            { loanType === 'months' &&
              <Typography color='white' mt={2}>{details.length} month's</Typography>
            }
          </Box> */}
        </Grid>
        <Grid item xs={12}>
          <LoanDetailsTable banks={banks} rows={details} setRows={setDetails} />
        </Grid>
      </Grid>
    </Box>
    
    // </div>
  )
}
