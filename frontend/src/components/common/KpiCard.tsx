import { Paper, Typography, Box } from "@mui/material";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";

interface KpiCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  color?: "primary" | "success" | "warning" | "error" | "info";
  trend?: string; // Optional: "+12%" or "-5%"
}

export default function KpiCard({ title, value, icon, color = "primary", trend }: KpiCardProps) {
  const colorConfig = {
    primary: { 
      main: "#2196f3", 
      light: "#e3f2fd",
      gradient: "linear-gradient(135deg, #2196f3 0%, #1976d2 100%)"
    },
    success: { 
      main: "#4caf50", 
      light: "#e8f5e9",
      gradient: "linear-gradient(135deg, #4caf50 0%, #388e3c 100%)"
    },
    warning: { 
      main: "#ff9800", 
      light: "#fff3e0",
      gradient: "linear-gradient(135deg, #ff9800 0%, #f57c00 100%)"
    },
    error: { 
      main: "#f44336", 
      light: "#ffebee",
      gradient: "linear-gradient(135deg, #f44336 0%, #d32f2f 100%)"
    },
    info: { 
      main: "#00bcd4", 
      light: "#e0f7fa",
      gradient: "linear-gradient(135deg, #00bcd4 0%, #0097a7 100%)"
    },
  };

  const colors = colorConfig[color];

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        height: "100%",
        borderRadius: 3,
        border: "1px solid",
        borderColor: "divider",
        position: "relative",
        overflow: "hidden",
        background: (theme) =>
          theme.palette.mode === "dark"
            ? `linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)`
            : "#ffffff",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        "&:hover": {
          transform: "translateY(-8px)",
          boxShadow: "0 12px 24px rgba(0,0,0,0.15)",
          borderColor: colors.main,
        },
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "4px",
          background: colors.gradient,
        },
      }}
    >
      <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", mb: 2 }}>
        <Box sx={{ flexGrow: 1 }}>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ 
              fontWeight: 600, 
              mb: 1, 
              textTransform: "uppercase", 
              fontSize: "0.7rem",
              letterSpacing: "0.5px"
            }}
          >
            {title}
          </Typography>
        </Box>
        <Box
          sx={{
            width: 56,
            height: 56,
            borderRadius: 2.5,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: colors.gradient,
            color: "white",
            boxShadow: `0 4px 12px ${colors.main}40`,
          }}
        >
          {icon || <TrendingUpIcon sx={{ fontSize: 28 }} />}
        </Box>
      </Box>

      <Typography 
        variant="h3" 
        sx={{ 
          fontWeight: 800, 
          color: (theme) => theme.palette.mode === 'dark' ? 'white' : 'text.primary',
          mb: 0.5,
          fontSize: "2.5rem"
        }}
      >
        {value}
      </Typography>

      {trend && (
        <Typography 
          variant="caption" 
          sx={{ 
            color: trend.startsWith('+') ? 'success.main' : 'error.main',
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            gap: 0.5
          }}
        >
          {trend}
          <Typography variant="caption" color="text.secondary">
            vs last month
          </Typography>
        </Typography>
      )}
    </Paper>
  );
}