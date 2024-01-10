import { Typography, Box, useTheme, Button } from "@mui/material"
import { tokens } from "../theme"
import { AddOutlined } from "@mui/icons-material";

const Header = ({title, subtitle, showButton = true, onAddButtonClick}) => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);

  return (
    <Box width="100%" display="flex" justifyContent="space-between" p={2} sx={{ '& button': { m: 1 } }}>
        <div>
        <Typography 
            variant="h2" 
            color={colors.grey[100]} 
            fontWeight="bold" 
            sx={{ mb:"5px" }}
        > 
            {title} 
        </Typography>

        <Typography
            variant="h5"
            color={colors.greenAccent[400]}
            
        > 
            {subtitle} 
        </Typography>
        </div>
        <div>
        {showButton && (
                <div>
                    <Button
                        variant="outlined"
                        size="medium"
                        sx={{
                            backgroundColor: colors.blueAccent[700],
                            color: colors.grey[100],
                            fontSize: "14px",
                            fontWeight: "bold",
                            padding: "10px 20px",
                            borderColor: colors.grey    [400],
                            "&:hover": {borderColor: colors.grey[400],
                                        backgroundColor: colors.grey[700]        
                                }
                        }}
                        onClick={onAddButtonClick}
                    >
                        <AddOutlined sx={{ mr: "2px" }} />
                        Add
                    </Button>
                </div>
            )}
        </div>
    </Box>
  )
}

export default Header