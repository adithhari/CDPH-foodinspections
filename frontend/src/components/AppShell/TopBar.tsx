import { AppBar, Toolbar, Typography, Box } from "@mui/material";
import DarkModeSwitch from "../common/DarkModeSwitch";

const DRAWER_WIDTH = 240;
const DRAWER_WIDTH_COLLAPSED = 80;

interface TopBarProps {
  sidebarOpen: boolean;
}

export default function TopBar({ sidebarOpen }: TopBarProps) {
  const drawerWidth = sidebarOpen ? DRAWER_WIDTH : DRAWER_WIDTH_COLLAPSED;

  return (
    <AppBar 
      position="fixed" 
      sx={{
        width: `calc(100% - ${drawerWidth}px)`,
        ml: `${drawerWidth}px`,
        zIndex: (theme) => theme.zIndex.drawer + 1,
        transition: "all 0.3s ease",
      }}
      elevation={1}
    >
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          🍽️ Chicago Food Safety Inspections
        </Typography>
        <Box>
          <DarkModeSwitch />
        </Box>
      </Toolbar>
    </AppBar>
  );
}