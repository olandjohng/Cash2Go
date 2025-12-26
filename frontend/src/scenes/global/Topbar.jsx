import { Box, Button, Grid, IconButton, Popper, Typography, useTheme } from "@mui/material"
import { useContext, useRef, useState } from "react"
import { ColorModeContext, tokens } from "../../theme"
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import api from '../utils/api';

import axios from "axios";
import { useAuthContext } from "../../context/AuthContext";

const Topbar = () => {
    const {getUserLocalStorage} =  useAuthContext()
    const accountIconRef = useRef(null)
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    
    const colorMode = useContext(ColorModeContext);

    const [openAccountPoper, setOpenAccountPoper] = useState(false)
    
    const handleOpenAccount = () => {
        setOpenAccountPoper(open => !open)
    }

    const handleLogout = async () => {
        try {
            const request = await api.post('/api/auth/logout')
            if(request.status == 200) {
                localStorage.removeItem('user')
                setOpenAccountPoper(false)
                getUserLocalStorage()
            }
        } catch (error) {
        }
    }  

    return ( 
        <Box display="flex" justifyContent="flex-end" paddingX={2} paddingY='1px'> 
            <Box display="flex">
                {/* <IconButton onClick={colorMode.toggleColorMode}>
                    {theme.palette.mode === 'dark' ? (
                        <DarkModeOutlinedIcon />
                    ) : (
                        <LightModeOutlinedIcon />
                    )}
                </IconButton>
                <IconButton ref={notificationRef} onClick={() => setOpenNotification((old) => !old)}>
                    <NotificationsOutlinedIcon />
                </IconButton>
                <IconButton>
                    <SettingsOutlinedIcon />
                </IconButton> */}
                <IconButton ref={accountIconRef} onClick={handleOpenAccount}>
                    <PersonOutlineOutlinedIcon />
                </IconButton>
            </Box>
            <Popper open={openAccountPoper} anchorEl={accountIconRef.current}>
                <Box sx={{ border: 1, padding : 1,  borderRadius: 2, borderColor: colors.greenAccent[900], bgcolor: colors.greenAccent[800] }}>
                    {/* {noficationList()} */}
                    <Button sx={{color : 'white'}} onClick={handleLogout}>Logout</Button>
                </Box>
            </Popper>
            {/* Icons End */}
        </Box> 
    )
}

export default Topbar