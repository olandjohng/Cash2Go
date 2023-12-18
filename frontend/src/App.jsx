import { Route, Routes } from "react-router-dom";
import Topbar from "./scenes/global/topbar";
import { ColorModeContext, useMode } from "./theme";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { Dashboard } from "@mui/icons-material";
import LeftSidebar from "./scenes/global/LeftSidebar";


function App() {

  const [theme, colorMode] = useMode();

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <div className='flex relative w-full h-full'>
          <LeftSidebar />
          <main className="w-full h-full">
            <Topbar />
            <Routes>
              <Route path="/" element={<Dashboard />} />

            </Routes>
          </main>
        </div>
      </ThemeProvider>
    </ColorModeContext.Provider>
    
  )
}

export default App
