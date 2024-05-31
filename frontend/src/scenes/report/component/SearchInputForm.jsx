import { SearchOutlined } from '@mui/icons-material'
import { IconButton, InputBase } from '@mui/material'
import React from 'react'

export default function SearchInputForm({submit,  colors, name, ...props}) {
  return (
    <form onSubmit={(e) => { 
      e.preventDefault(); 
      submit(e.target[name].value, e)
    }}
      style={{
        display : 'inline-block',
        background : colors.greenAccent[800],
        borderRadius : 3
      }}
    >
      <InputBase size='small' 
        sx={{px : 1}}
        {...props} />
      <IconButton type='submit'>
        <SearchOutlined />
      </IconButton>
    </form>
  )
}
