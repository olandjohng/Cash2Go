import { useTheme } from "@emotion/react";
import { Button, Grid, TextField, Tooltip } from "@mui/material";
import { tokens } from "../../../theme";
import { useEffect, useState } from "react";
import { Bounce, toast } from 'react-toastify';
import { useNavigate, useParams } from "react-router-dom";
import axios from 'axios';

export default function newDeduction({ onDeductionAdded, onClosePopup }) {
    const { id } = useParams();
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const navigate = useNavigate();
    const [deductionType, setDeductionType] = useState('');

    useEffect(() => {
      if (id) {
        axios.get(`http://localhost:8000/deductions/read/${id}`)
          .then((res) => {
            console.log('API Response:', res.data);
    
            if (Array.isArray(res.data) && res.data.length > 0) {
              const { deductionType } = res.data[0];
              console.log('Deduction Type:', deductionType);
              setDeductionType(deductionType);
            } else {
              console.error('Invalid data structure returned by the API');
            }
          })
          .catch((err) => console.log(err));
      }
    }, [id]);
    
    
    
    const handleChange = (e) => {
      const { name, value } = e.target;
      setDeductionType(value);
    };
    
    
    

  const handleSubmit = async (e) => {
    e.preventDefault();
    const apiURL = id ? `http://localhost:8000/deductions/edit/${id}` : 'http://localhost:8000/deductions/new'
    console.log({deductionType});
    const axiosMethod = id ? axios.put : axios.post;

axiosMethod(apiURL, { deductionType })
  .then((res) => {
    console.log(res);
    navigate('/deduction');
  })
  .catch((err) => console.log(err));
  };

  return (
    <Grid container>
      <Grid width={350} item xs={12}>
        <TextField
          variant="outlined"
          label="Deduction Type"
          type="text"
          name="deductionType"
          value={deductionType}
          onChange={handleChange}
          fullWidth
          sx={{ width: "95%", margin: 1 }}
        />
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
    </Grid>
  )
}
