import { AddOutlined, RemoveCircleOutline } from '@mui/icons-material';
import { Autocomplete, Button, Grid, IconButton, InputAdornment, TextField } from '@mui/material';
import React, { useContext, useState } from 'react'
import { LoanFormContext } from './LoanForm1';

export default function DeductionDetailsForm({deductions, deductionsData, setDeductionsData}) {
  const [deductionItem, setDeductionItem] = useState(null);   
  const {formValue, setFormValue, validationError, setValidationError} = useContext(LoanFormContext)
  return (
    <>
      <Grid container>
        <Grid item xs={10}>
          <Autocomplete
            options={deductions.map((v) => v.deductionType)}
            value={deductionItem}
            onInputChange={ (e,v) => {
              setDeductionItem(v)
            }}
            renderInput= { (params) => <TextField {...params}  label='Deductions'/>}
          />
        </Grid>
        <Grid item xs={2}>
          <Button
            onClick={() => {
              if(deductionItem){
                let contains  = false;
                for (const d of deductionsData) {
                  if(d.label === deductionItem){ contains = true }
                }

                if(!contains){
                  const format = deductionItem.toLowerCase().split(' ').join('_')
                  const d = [...deductionsData, {label : deductionItem, name : format, amount : ''}]
                  setDeductionsData(d)
                  setFormValue({...formValue, deduction : d})
                }
              }
            }}
            variant="outlined" 
            color='success'
            sx={{ 
              fontSize: "14px",
              fontWeight: "bold",
              width: "90%",
              marginLeft : 'auto', 
              marginRight : 'auto',
              height : '100%',
              mx : 1
            }}
          >
            <AddOutlined sx={{ mr: "2px" }} />
          </Button>
        </Grid>
      </Grid>
      <Grid container gap={1.5} marginTop={1.5}>
        { deductionsData && deductionsData.map((d, i) =>(
          <TextField 
          label={d.label} 
          value={d.amount}
          error={validationError && Boolean(validationError[d.name])}
          type='number'
          onChange= {(e) =>{
            setValidationError(null)
            const d = deductionsData.map((v, index) => {
              return i === index ? {...v, amount : e.target.value} : v
            })
            setDeductionsData(d)
            setFormValue({...formValue, deduction : d})
          }}
          InputProps={{
            endAdornment : 
              <InputAdornment position='end'>
                <IconButton
                  onClick={(e) => {
                    const d = deductionsData.filter((v, index) => index !== i) 
                    setDeductionsData(d)
                    setFormValue({...formValue, deduction : d})
                  }}
                >
                  <RemoveCircleOutline />
                </IconButton>
              </InputAdornment>
          }}
          />
        ))}
      </Grid>
    </>
  )
}
