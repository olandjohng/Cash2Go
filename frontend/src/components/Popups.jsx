import { Box, Button, Dialog, DialogContent, DialogTitle, Typography } from "@mui/material";
import { useTheme } from '@emotion/react'
import { tokens } from "../theme"



export default function Popups(props) {

    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const {title, children, openPopup, setOpenPopup} = props
    const dialogStyle = {
      padding: 2,
      position: 'absolute',
      top: 5,
  };

    
  return (
    <Box>
      <Dialog open={openPopup} maxWidth="xl" PaperProps={{style: dialogStyle}}>
        <DialogTitle>
          <div style={{display: 'flex', justifyContent: 'space-between', padding: 2}}>
            <Typography variant="h3" component="div">
              {title}
            </Typography>
            <Button
                        variant="text"
                        size="medium"
                        sx={{
                            backgroundColor: colors.blueAccent[700],
                            color: colors.grey[100],
                            fontWeight: "bold",
                            borderColor: colors.grey    [400],
                            "&:hover": {borderColor: colors.grey[400],
                                        backgroundColor: colors.grey[700]        
                                }
                                
                        }}
                        onClick={() => setOpenPopup(false)}
                    >
                        X
                    </Button>
          </div>
        </DialogTitle>
        <DialogContent dividers>
            {children}
        </DialogContent>
      </Dialog>
    </Box>
  )
}

