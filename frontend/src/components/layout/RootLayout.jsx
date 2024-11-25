import React from 'react'
import LeftSidebar from '../../scenes/global/LeftSidebar'
import { Outlet } from 'react-router-dom'
import { Box } from '@mui/material'
import Topbar from '../../scenes/global/Topbar'

export default function RootLayout() {
  return (
    <Box display='flex' width='100%' height='100%' 
      >
      <LeftSidebar />
      <Box style={{ flex : 1}}>
        <Box style={{ height : '100%', display: 'block'}}>
          <Topbar/> 
          <Outlet/>
        </Box>
      </Box>
    </Box>
  )
}
