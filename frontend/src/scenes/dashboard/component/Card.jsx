import { useTheme } from '@emotion/react';
import { Box, Typography } from '@mui/material';
import React from 'react';
import { tokens } from '../../../theme';
import { 
  LocalAtmOutlined, 
  TrendingUpOutlined,
  CalendarTodayOutlined,
  DateRangeOutlined 
} from '@mui/icons-material';

export default function Card({ title, content, icon, ...props }) {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const getIcon = () => {
    switch(icon) {
      case 'daily':
        return <CalendarTodayOutlined sx={{ fontSize: 40 }} />;
      case 'weekly':
        return <DateRangeOutlined sx={{ fontSize: 40 }} />;
      case 'monthly':
        return <TrendingUpOutlined sx={{ fontSize: 40 }} />;
      default:
        return <LocalAtmOutlined sx={{ fontSize: 40 }} />;
    }
  };

  return (
    <Box
      sx={{
        position: 'relative',
        background: `linear-gradient(135deg, ${colors.greenAccent[700]} 0%, ${colors.greenAccent[800]} 100%)`,
        boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
        borderRadius: 3,
        overflow: 'hidden',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        border: `1px solid ${colors.greenAccent[600]}`,
        '&:hover': {
          transform: 'translateY(-8px)',
          boxShadow: '0 16px 48px rgba(0,0,0,0.3)',
          '& .icon-container': {
            transform: 'scale(1.1) rotate(5deg)',
          },
          '& .amount': {
            color: colors.greenAccent[300],
          }
        },
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          right: 0,
          width: '120px',
          height: '120px',
          background: `radial-gradient(circle, ${colors.greenAccent[600]}40 0%, transparent 70%)`,
          borderRadius: '50%',
          transform: 'translate(40%, -40%)',
        }
      }}
    >
      <Box px={3} py={3} display='flex' flexDirection='column' gap={2}>
        {/* Icon and Title Row */}
        <Box display='flex' alignItems='center' justifyContent='space-between'>
          <Box display='flex' alignItems='center' gap={1.5}>
            <Box 
              className="icon-container"
              sx={{
                color: colors.greenAccent[300],
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              {getIcon()}
            </Box>
            <Typography 
              variant="h6"
              sx={{ 
                textTransform: 'capitalize', 
                fontWeight: 700,
                letterSpacing: '0.5px',
                color: colors.grey[100],
                fontSize: '1.1rem'
              }}
            >
              {title}
            </Typography>
          </Box>
        </Box>

        {/* Amount Display */}
        <Box>
          <Typography 
            className="amount"
            variant="h4"
            sx={{
              fontWeight: 800,
              color: colors.greenAccent[400],
              textAlign: 'right',
              letterSpacing: '1px',
              fontFamily: 'monospace',
              transition: 'color 0.3s ease',
            }}
          >
            {content}
          </Typography>
          <Box 
            sx={{ 
              height: '3px', 
              width: '60%',
              background: `linear-gradient(90deg, transparent 0%, ${colors.greenAccent[400]} 100%)`,
              borderRadius: '2px',
              ml: 'auto',
              mt: 1
            }} 
          />
        </Box>
      </Box>
    </Box>
  );
}