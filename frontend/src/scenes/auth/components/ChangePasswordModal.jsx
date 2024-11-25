import { Box, Button, Modal, TextField, Typography } from '@mui/material'
import { useFormik } from 'formik';
import React from 'react'
import * as yup from 'yup'
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

const confirmPasswordSchema = yup.object({
  password : yup.string().required('Password is required'),
  confirm_password : yup.string().oneOf([yup.ref('password'), null], 'password not match')
})

export default function ChangePasswordModal({open, handleSubmit}) {
  
  const formik = useFormik({
    initialValues : {
      password : '',
      confirm_password : ''
    },
    validationSchema : confirmPasswordSchema,
    onSubmit : handleSubmit
  })
  return (
    <Modal open={open}>
        <form onSubmit={formik.handleSubmit}>
          <Box sx={style}>
            <Typography id="modal-modal-title" variant="h6" component="h2">
              Please Change Your Password
            </Typography>
            <Typography id="modal-modal-description" sx={{ mt: 2 }}>
              New Password
            </Typography>
            <TextField type='password' name='password' variant='outlined' size='small' onChange={formik.handleChange} value={formik.values.password}  fullWidth/>
            {formik.errors.password && 
              <Typography fontSize={10} color='red'>{formik.errors.password.toUpperCase()}</Typography>
            }
            <Typography id="modal-modal-description" sx={{ mt: 2 }}>
              Confirm Password
            </Typography>
            <TextField type='password' name='confirm_password' variant='outlined' size='small' onChange={formik.handleChange} value={formik.values.confirm_password} fullWidth/>
            {formik.errors.confirm_password && 
              <Typography fontSize={10} color='red'>{formik.errors.confirm_password.toUpperCase()}</Typography>
            }
            <Box display='flex' justifyContent='end' mt='10px'>
              <Button variant='outlined' type='submit' color='success' size='small'>Submit</Button>
            </Box>
          </Box>

        </form>
      </Modal>
  )
}
