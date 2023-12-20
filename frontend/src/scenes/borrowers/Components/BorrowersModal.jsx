import { Box, Typography, Grid, TextField, FormControl, Select, InputLabel, MenuItem, Button } from "@mui/material"
import { useState } from "react";
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
// import { DPicker } from "../index"
const style = { 
  width: '500px',
  height : '505px',
  border: '1px solid #000',
  borderRadius: '10px',  
  position : 'absolute', 
  top : 'calc(50% - (505px / 2))', 
  left : 'calc(50% - ( 500px / 2))',
  bgcolor: 'background.paper',
  p: 2,
}

export default function BorrowersModal({onOpen}){
  const [borrower, setBorrower] = useState({})
  const [spouse, setSpouse] = useState({})

  function borrowerInputChange(target){
    const {name, value} = target
    const temp = borrower
    temp[name] = value
    setBorrower(temp)
  }
  
  function spouseInputChange(target){
    const {name, value} = target
    const temp = spouse
    temp[name] = value
    setSpouse(temp)
  }
  function submit(){
     console.log(borrower, spouse)
  }
  return (
    <>
      <Box sx={style} autoComplete="off">
        <Typography>Borrower Info</Typography>
        <Grid container spacing={'10px'} sx={{ mt : '1px'}}>
          <Grid item xs={4}>
            <TextField name="fName" onChange={(e) => borrowerInputChange(e.target)} fullWidth id="outlined-basic" label="First Name" variant="outlined" />
          </Grid>
          <Grid item xs={4}>
            <TextField name="mName" onChange={(e) => borrowerInputChange(e.target)} fullWidth id="outlined-basic" label="Middle Name" variant="outlined" />
          </Grid>
          <Grid item xs={4}>
            <TextField name="lName" onChange={(e) => borrowerInputChange(e.target)} fullWidth id="outlined-basic" label="Last Name" variant="outlined" />
          </Grid>
          <Grid item xs={4}>
            <TextField name="phoneNum" onChange={(e) => borrowerInputChange(e.target)} fullWidth id="outlined-basic" label="Phone Number" variant="outlined" />
          </Grid>
          <Grid item xs={8}>
            <TextField name="address" onChange={(e) => borrowerInputChange(e.target)} fullWidth id="outlined-basic" label="Address"  variant="outlined" />
          </Grid>
          <Grid item xs={4} >
            <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker name="birthday"  onChange={(e) => console.log(e)} label='Birthday'/>
            </LocalizationProvider>
          </Grid>
          <Grid item xs={4} >
            <FormControl fullWidth>
              <InputLabel>Gender</InputLabel>
              <Select label="Gender" name="gender" onChange={(e) => borrowerInputChange(e.target)}>
                <MenuItem value={'MALE'}>Male</MenuItem>
                <MenuItem value={'FEMALE'}>Female</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={4} >
            <FormControl fullWidth>
              <InputLabel>Civil Status</InputLabel>
              <Select label="Civil Status" name="civilStatus" onChange={(e) => borrowerInputChange(e.target)}>
                <MenuItem value='MARRIED'>Married</MenuItem>
                <MenuItem value='SINGLE'>Single</MenuItem>
                <MenuItem value='WIDOWED'>Widowed</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
        <Box sx={{mt : 2}}>
          <Typography>Spouse Info</Typography>
          <Grid container spacing={'10px'} sx={{ mt : '1px'}}>
            <Grid item xs={4}>
              <TextField name="spfName" onChange={(e) => spouseInputChange(e.target)} fullWidth id="outlined-basic" label="First Name" variant="outlined" />
            </Grid>
            <Grid item xs={4}>
              <TextField name="spmName" onChange={(e) => spouseInputChange(e.target)} fullWidth id="outlined-basic" label="Middle Name" variant="outlined" />
            </Grid>
            <Grid item xs={4}>
              <TextField name="splName" onChange={(e) => spouseInputChange(e.target)} fullWidth id="outlined-basic" label="Last Name" variant="outlined" />
            </Grid>
            <Grid item xs={4}>
              <TextField name="spPhone" onChange={(e) => spouseInputChange(e.target)} fullWidth id="outlined-basic" label="Phone Number" variant="outlined" />
            </Grid>
            <Grid item xs={8}>
              <TextField name="spAddress" onChange={(e) => spouseInputChange(e.target)} fullWidth id="outlined-basic" label="Address" variant="outlined" />
            </Grid>
            <Grid item xs={4} >
            <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker name="spBirthday" label='Birthday'/>
            </LocalizationProvider>
            </Grid>
            <Grid item xs={4} >
              <FormControl fullWidth>
                <InputLabel>Gender</InputLabel>
                <Select label="Gender" name="spGender" onChange={(e) => spouseInputChange(e.target)}>
                  <MenuItem value='MALE'>Male</MenuItem>
                  <MenuItem value='FEMALE'>Female</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Box>
          <Box sx={{display : 'flex', gap: 1, justifyContent: 'flex-end', mt: 1}}>
            <Button onClick={() => onOpen(false)} variant="contained">Cancel</Button>
            <Button variant="contained" onClick={submit}>Save</Button>
          </Box>
          {/* </form>  */}
      </Box>
    </>
  )
}