import { Box } from "@mui/material"
import Header from "../../components/Header"

const Dashboard = () => {
  return (
    <Box m="20px" width="100%">
      <Box display="flex" justifyContent="space-between" alignItems="center" width="100%">
        <Header title="DASHBOARD" subtitle="Welcome to your Dashboard" showButton={false} />
      </Box>
      
    </Box>
  )
}

export default Dashboard