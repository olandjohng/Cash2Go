import { Box, Button, Modal, Popover, TextField, Typography } from '@mui/material'
import React, { useState } from 'react'
import { useTheme } from "@emotion/react";
import { tokens } from '../../theme';
import { Link } from 'react-router-dom';
import logo from '../../assets/c2g_logo.png'
import { useFormik } from 'formik';
import * as yup from 'yup'
import axios from 'axios'
import { useAuthContext } from '../../context/AuthContext';
import ChangePasswordModal from './components/ChangePasswordModal';

const userSchema = yup.object({
  username : yup.string().required(),
  password: yup.string().required()
})


const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

export default function Signin() {
  const { getUserLocalStorage } = useAuthContext()
  const theme = useTheme()
  const [user, setUser] = useState({})
  const colors = tokens(theme.palette.mode);
  const [openChangePasswordModal, setOpenChangePasswordModal] = useState(false)
  
  const handleChangePasswordSubmit = async (data) => {
    const req = await axios.post(`/api/auth/${user.id}/change-password`, data)
    if(req.status == 200) {
       localStorage.setItem('user', JSON.stringify(user))
       setOpenChangePasswordModal(false)
       getUserLocalStorage()
    }
  }

  const handleSubmit = async (input) => {
    try {
      const req = await axios.post('/api/auth/login', input)
      if(!req.data.did_init) {
        setUser(req.data)
        return setOpenChangePasswordModal(true)
      }

      localStorage.setItem('user', JSON.stringify(req.data))
      
      getUserLocalStorage()

    } catch (error) {
      console.log(error)  
    }
    
  }

  const formik = useFormik({
    initialValues : {
      username : '',
      password : ''
    },
    validationSchema : userSchema,
    onSubmit : handleSubmit
  })

  return (
    <>
      <Box height='100%' display='flex' alignItems='center' justifyContent='center' sx={{backgroundColor : 'white'}}>
        <Box 
          border={`solid 2px ${colors.greenAccent[300]}`} 
          display='flex' 
          flexDirection='column' 
          width='30%' height='60%'
          borderRadius={2} 
          paddingX={3} paddingY={2} 
          sx={{backgroundColor : colors.greenAccent[900], boxShadow : 3}}
        > 
          <Box flex={1} display='flex' justifyContent='center' alignItems='center'>
            <img src={logo} 
              width="110px"
              height="110px"
              style={{borderRadius: "50%" }}
            />
          </Box>
          <form onSubmit={formik.handleSubmit}>
            <Box flex={1} display='flex' justifyContent='center' flexDirection='column' gap={2}>
              <Box>
                <TextField 
                  label='Username' 
                  name='username' 
                  fullWidth
                  type='text'
                  size='small'
                  sx={{
                    // Root class for the input field
                    "& .MuiOutlinedInput-root": {
                      // Class for the border around the input field
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: colors.grey[300],
                      },
                    },
                    // Class for the label of the input field
                    "& .MuiInputLabel-outlined": {
                      color: colors.grey[300],
                    },
                  }}
                  onChange={formik.handleChange}
                  value={formik.values.username}
                />
                {formik.errors.username && 
                  <Typography fontSize={10} color='red'>{formik.errors.username}</Typography>
                }

              </Box>
              <Box>
                <TextField 
                  label='Password' 
                  fullWidth
                  size='small'
                  type='password'
                  name='password' 
                  sx={{
                    // Root class for the input field
                    "& .MuiOutlinedInput-root": {
                      // Class for the border around the input field
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: colors.grey[300],
                      },
                    },
                    // Class for the label of the input field
                    "& .MuiInputLabel-outlined": {
                      color: colors.grey[300],
                    },
                  }}
                  onChange={formik.handleChange}
                  value={formik.values.password}
                />
                {formik.errors.password && 
                  <Typography fontSize={10} color='red'>{formik.errors.password}</Typography>
                }

              </Box>
              <Box display='flex' justifyContent='space-between' alignItems='center'>
                <Typography><Link>Forgot Password?</Link></Typography>
                <Button type='submit' color='success' size='small' variant='outlined'>Login</Button>
              </Box>
            </Box>
          </form>
        </Box>
      </Box>
      <ChangePasswordModal open={openChangePasswordModal} handleSubmit={handleChangePasswordSubmit} />
    </>
  )
}
