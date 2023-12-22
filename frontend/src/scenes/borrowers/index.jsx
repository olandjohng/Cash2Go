import { Paper, Table, TableContainer, TableHead, TableRow, TableCell, TableBody, Container, Button, Box, Typography, Modal, TextField, Grid, Select, MenuItem, FormControl, InputLabel } from "@mui/material"
import { useEffect, useState } from "react"
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import BorrowersModal from "./Components/BorrowersModal";



export function DPicker({label}) {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DatePicker label={label}  />
    </LocalizationProvider>
  );
}

const Borrowers = () => {
  const [customers, setCustomers] = useState([])
  const [open, setOpen] = useState(false)
  const [customer, setCustomer] = useState({})
  



  async function openModal (){
    setOpen(true)
  }

  useEffect(()=>{
    
    const getCustomer = async() =>{
      const req = await fetch('http://localhost:8000/customers')
      const resJson = await req.json()
      setCustomers(resJson)
    }
    getCustomer()

  }, [])

  console.log(customers)
  return (
    <>
      <Container sx={{display : 'flex', flexDirection : 'column', gap : '5px'}}>
        <Box sx={{display : 'flex', justifyContent : 'space-between', alignItems : 'center'}}>
          <Typography >Borrowers</Typography>
          <Button onClick={openModal} variant="contained">Add</Button>
        </Box>
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} aria-label="simple table">
            <TableHead>
              <TableRow>
              <TableCell>Name</TableCell>
                <TableCell>Contact No.</TableCell>
                <TableCell>Address</TableCell>
                <TableCell>Gender</TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {customers.map((customer, i) => (
                <TableRow key={i}>
                  <TableCell>{customer.f_name} {customer.m_name} {customer.l_name}</TableCell>
                  <TableCell>{customer.contactNo}</TableCell>
                  <TableCell>{customer.address}</TableCell>
                  <TableCell>{customer.gender}</TableCell>
                  <TableCell><Button variant="contained" color="error">Edit</Button></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        {/* SFSDFSFSFD */}
        
        <Modal open={open}>
            <BorrowersModal onOpen={setOpen} />
        </Modal>
      </Container>
    </>
  )
}

export default Borrowers