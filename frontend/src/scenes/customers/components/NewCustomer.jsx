import { Button, FormControl, Grid, InputLabel, MenuItem, Select, TextField, Tooltip } from "@mui/material";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTheme } from "@emotion/react";
import { tokens } from "../../../theme";
import axios from "axios";
import { Bounce, toast } from "react-toastify";


export default function NewCustomer({onCustomerAdded, onClosePopup}) {
  const { id } = useParams();
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const navigate = useNavigate();
  const [gender, setGender] = useState('');
  const [spouseGender, setSpouseGender] = useState('');
  const [marital, setMarital] = useState('');
  const [spouseMarital, setSpouseMarital] = useState('');
  const [customer, setCustomer] = useState({  
          cfname : '',
          cmname : '',
          clname : '',
          address : '', 
          contactno : '',
          birthdate : new Date().toISOString().split('T')[0],
          gender : '',
          maritalstatus : '',
          spousefname : '',
          spousemname : '',
          spouselname : '',
          spouseaddress : '',
          spousebirthdate : new Date().toISOString().split('T')[0],
          spousegender : '',
          spousemaritalstatus : '',
          spousecontactno : ''
   });

   // Start useEffect
   useEffect(() => {
    if (id) {
        axios.get(`http://localhost:8000/customerInfo/read/${id}`)
        .then((res) => {
            console.log('API Response:', res.data);
            
            if (Array.isArray(res.data) && res.data.length > 0) {
                const { cfname, cmname, clname, address,  contactno, birthdate, gender, maritalstatus, 
                        spousefname, spousemname, spouselname, spouseaddress, spousebirthdate, spousegender, spousemaritalstatus, spousecontactno 
                      } = res.data[0];
                console.log('Customer:', { cfname, cmname, clname, address,  contactno, birthdate, gender, maritalstatus, 
                  spousefname, spousemname, spouselname, spouseaddress, spousebirthdate, spousegender, spousemaritalstatus, spousecontactno 
                 });
                setCustomer({ cfname, cmname, clname, address,  contactno, birthdate, gender, maritalstatus, 
                  spousefname, spousemname, spouselname, spouseaddress, spousebirthdate, spousegender, spousemaritalstatus, spousecontactno 
                 });
            } else {
                console.error('Invalid data structure returned by the API');
            }
        })
        .catch((err) => console.log(err));
    }
    
}, [id]);
// End useEffect

// Start HandleChange
const handleChange = (e) => {
  const { name, value } = e.target;

  if (name === 'gender') {
    setGender(value);
  } else if (name === 'spousegender') {
    setSpouseGender(value);
  } else if (name === 'maritalstatus') {
    setMarital(value);
  } else if (name === 'spousemaritalstatus') {
    setSpouseMarital(value);
  }

  setCustomer((prevCustomer) => ({
    ...prevCustomer,
    [name]: value,
  }));
};
// End HandleChange



// Start handleSubmit
const handleSubmit = async (e) => {
  e.preventDefault();
  const apiURL = id ? `http://localhost:8000/customerInfo/edit/${id}` : 'http://localhost:8000/customerInfo/new';
  console.log({ customer });
  const axiosMethod = id ? axios.put : axios.post;

// start - formating the date
const formattedCustomer = {
  ...customer,
  birthdate: new Date(customer.birthdate).toISOString().split('T')[0],
  spousebirthdate: new Date(customer.spousebirthdate).toISOString().split('T')[0],
};
// end - formating the date

  axiosMethod(apiURL, { customer: formattedCustomer })
    .then((res) => {
      console.log(res);
      onCustomerAdded();
      onClosePopup();
      navigate('/customers');

      toast.success(res.data.message, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
        transition: Bounce,
      });
    })
    .catch((err) => {
      console.log(err);
      toast.error('Error occurred. Please try again.', {
        position: toast.POSITION.TOP_RIGHT,
        transition: Bounce,
        autoClose: 3000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: false,
      });
    });
};
// End handleSubmit

  return (
    <Grid container spacing={1}>
      <Grid item xs={4}>
        <TextField
          variant="outlined"
          label="Firstname"
          type="text"
          name="cfname"
          value={customer.cfname}
          onChange={handleChange}
          fullWidth
          
        />
      </Grid>
      <Grid item xs={4}>
        <TextField
          variant="outlined"
          label="Middlename"
          type="text"
          name="cmname"
          value={customer.cmname}
          onChange={handleChange}
          fullWidth
         
        />
      </Grid>
      <Grid item xs={4}>
        <TextField
          variant="outlined"
          label="Lastname"
          type="text"
          name="clname"
          value={customer.clname}
          onChange={handleChange}
          fullWidth
          
        />
      </Grid>
      <Grid item xs={8}>
        <TextField
          variant="outlined"
          label="Address"
          type="text"
          name="address"
          value={customer.address}
          onChange={handleChange}
          fullWidth
          
        />
      </Grid>
      <Grid item xs={4}>
        <TextField
          variant="outlined"
          label="Contact No."
          type="text"
          name="contactno"
          value={customer.contactno}
          onChange={handleChange}
          fullWidth
          
        />
      </Grid>
      <Grid item xs={4}>
        <TextField
          variant="outlined"
          label="Date of Birth"
          type="date"
          name="birthdate"
          value={customer.birthdate ? customer.birthdate.split('T')[0] : ''}
          onChange={handleChange}
          fullWidth
          focused
        />
      </Grid>
      <Grid item xs={4}>
        <FormControl fullWidth>
          <InputLabel id="gender-select-label">Gender</InputLabel>
          <Select
            labelId="gender-select-label"
            id="gender-select"
            label="Gender"
            name="gender"
            value={customer.gender || ''}
            onChange={(e) => handleChange(e)}
          >
            <MenuItem value="MALE">Male</MenuItem>
            <MenuItem value="FEMALE">Female</MenuItem>
          </Select>
        </FormControl>
      </Grid>
      <Grid item xs={4}>
        <FormControl fullWidth>
          <InputLabel id="marital-select-label">Marital Status</InputLabel>
          <Select
            labelId="marital-select-label"
            id="marital-select"
            label="Marital Status"
            name="maritalstatus"
            value={customer.maritalstatus || ''}
            onChange={(e) => handleChange(e)}
          >
            <MenuItem value="SINGLE">Single</MenuItem>
            <MenuItem value="MARRIED">Married</MenuItem>
            <MenuItem value="WIDOW">Widow</MenuItem>
            <MenuItem value="SEPERATED">Seperated</MenuItem>
          </Select>
        </FormControl>
      </Grid>
      {/* --------------------------------------------------------------------------------------------- */}
      <Grid item xs={12}>

      </Grid>
      <Grid item xs={4}>
        <TextField
          variant="outlined"
          label="Spouse Firstname"
          type="text"
          name="spousefname"
          value={customer.spousefname}
          onChange={handleChange}
          fullWidth
          
        />
      </Grid>
      <Grid item xs={4}>
        <TextField
          variant="outlined"
          label="Spouse Middlename"
          type="text"
          name="spousemname"
          value={customer.spousemname}
          onChange={handleChange}
          fullWidth
         
        />
      </Grid>
      <Grid item xs={4}>
        <TextField
          variant="outlined"
          label="Spouse Lastname"
          type="text"
          name="spouselname"
          value={customer.spouselname}
          onChange={handleChange}
          fullWidth
          
        />
      </Grid>
      <Grid item xs={8}>
        <TextField
          variant="outlined"
          label="Spouse Address"
          type="text"
          name="spouseaddress"
          value={customer.spouseaddress}
          onChange={handleChange}
          fullWidth
          
        />
      </Grid>
      <Grid item xs={4}>
        <TextField
          variant="outlined"
          label="Spouse Contact No."
          type="text"
          name="spousecontactno"
          value={customer.spousecontactno}
          onChange={handleChange}
          fullWidth
          
        />
      </Grid>
      <Grid item xs={4}>
        <TextField
          variant="outlined"
          label="Spouse Date of Birth"
          type="date"
          name="spousebirthdate"
          value={customer.spousebirthdate ? customer.spousebirthdate.split('T')[0] : ''}
          onChange={handleChange}
          fullWidth
          focused
        />
      </Grid>
      <Grid item xs={4}>
        <FormControl fullWidth>
          <InputLabel id="spouse-gender-select-label">Spouse Gender</InputLabel>
          <Select
            labelId="spouse-gender-select-label"
            id="spouse-gender-select"
            label="Spouse Gender"
            name="spousegender"
            value={customer.spousegender || ''}
            onChange={(e) => handleChange(e)}
          >
            <MenuItem value="MALE">Male</MenuItem>
            <MenuItem value="FEMALE">Female</MenuItem>
          </Select>
        </FormControl>
      </Grid>
      <Grid item xs={4}>
        <FormControl fullWidth>
          <InputLabel id="spouse-marital-select-label">Spouse Marital Status</InputLabel>
          <Select
            labelId="spouse-marital-select-label"
            id="spouse-marital-select"
            label="Spouse Marital Status"
            name="spousemaritalstatus"
            value={customer.spousemaritalstatus}
            onChange={(e) => handleChange(e)}
          >
            <MenuItem value="SINGLE">Single</MenuItem>
            <MenuItem value="MARRIED">Married</MenuItem>
            <MenuItem value="WIDOW">Widow</MenuItem>
            <MenuItem value="SEPERATED">Seperated</MenuItem>
          </Select>
        </FormControl>
      </Grid>
      {/* ------------------------------------------------------------------------ */}
      <Grid container justifyContent="flex-end" spacing={1} mt={2}>
          <Grid item>
            <Tooltip title="Add" placement="top">
                <Button variant="outlined" 
                  sx={{
                      backgroundColor: colors.blueAccent[700],
                      color: colors.grey[100],
                      borderColor: colors.grey[400],
                      "&:hover": {borderColor: colors.grey[400],
                                  backgroundColor: colors.grey[700]        
                      }
                  }}
                >
                  Cancel
                </Button>
            </Tooltip>
            
          </Grid>
          <Grid item>
            <Button 
                variant="outlined" 
                onClick={handleSubmit}
                sx={{
                    backgroundColor: colors.blueAccent[700],
                    color: colors.grey[100],
                    borderColor: colors.grey[400],
                    "&:hover": {borderColor: colors.grey[400],
                                backgroundColor: colors.grey[700]        
                    }
                }}
            >
              {id ? 'Update' : 'Submit'}
            </Button>
          </Grid>
        </Grid>
    </Grid>
  )
}
