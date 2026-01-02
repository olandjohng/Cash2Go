import { useState } from 'react'
import { Box, Tabs, Tab, useTheme } from '@mui/material'
import { tokens } from '../../theme'
import Header from '../../components/Header'
import ReceivablesReport from './components/ReceivablesReport'
import DailyCashReport from './components/DailyCashReport'

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`report-tabpanel-${index}`}
      aria-labelledby={`report-tab-${index}`}
      {...other}
      style={{ height: '100%' }}
    >
      {value === index && (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          {children}
        </Box>
      )}
    </div>
  )
}

export default function Report() {
  const [activeTab, setActiveTab] = useState(0)
  const theme = useTheme()
  const colors = tokens(theme.palette.mode)

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue)
  }

  return (
    <Box padding={2} height="100%" display="flex" flexDirection="column">
      <Header
        title="Reports"
        subtitle="Financial reports and cash management"
        showButton={false}
      />

      <Box
        sx={{
          borderBottom: 1,
          borderColor: colors.greenAccent[700],
          mb: 2
        }}
      >
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          aria-label="report tabs"
          sx={{
            '& .MuiTab-root': {
              color: colors.grey[300],
              fontSize: '14px',
              fontWeight: 'bold',
              '&.Mui-selected': {
                color: colors.greenAccent[400],
              },
            },
            '& .MuiTabs-indicator': {
              backgroundColor: colors.greenAccent[400],
            },
          }}
        >
          <Tab label="Receivables Report" id="report-tab-0" />
          <Tab label="Daily Cash Report" id="report-tab-1" />
          <Tab label="Loan Aging" id="report-tab-2" disabled />
          <Tab label="Collection Report" id="report-tab-3" disabled />
          <Tab label="Income Statement" id="report-tab-4" disabled />
        </Tabs>
      </Box>

      <Box flex={1} position="relative">
        <TabPanel value={activeTab} index={0}>
          <ReceivablesReport />
        </TabPanel>
        <TabPanel value={activeTab} index={1}>
          <DailyCashReport />
        </TabPanel>
        <TabPanel value={activeTab} index={2}>
          <Box>Loan Aging Report - Coming Soon</Box>
        </TabPanel>
        <TabPanel value={activeTab} index={3}>
          <Box>Collection Report - Coming Soon</Box>
        </TabPanel>
        <TabPanel value={activeTab} index={4}>
          <Box>Income Statement - Coming Soon</Box>
        </TabPanel>
      </Box>
    </Box>
  )
}