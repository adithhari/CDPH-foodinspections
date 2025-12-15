import { useState } from "react";
import { Box, Toolbar } from "@mui/material";
import TopBar from "./TopBar";
import SideNav from "./SideNav";

const DRAWER_WIDTH = 240;
const DRAWER_WIDTH_COLLAPSED = 80;

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const drawerWidth = sidebarOpen ? DRAWER_WIDTH : DRAWER_WIDTH_COLLAPSED;

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", width: "100%" }}>
      <TopBar sidebarOpen={sidebarOpen} />
      <SideNav onToggle={setSidebarOpen} />
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1, 
          p: 4,
          width: `calc(100% - ${drawerWidth}px)`,
          minHeight: "100vh",
          height: "100vh",
          overflow: "auto",
          backgroundColor: (theme) => theme.palette.background.default,
          transition: "width 0.3s ease",
        }}
      >
        <Toolbar />
        <Box sx={{ maxWidth: 1400, mx: "auto" }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
}