import { useState } from "react";
import { 
  Drawer, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText, 
  Toolbar,
  Divider,
  Box,
  Typography,
  IconButton,
} from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import HomeIcon from "@mui/icons-material/Home";
import TableChartIcon from "@mui/icons-material/TableChart";
import SearchIcon from "@mui/icons-material/Search";
import BarChartIcon from "@mui/icons-material/BarChart";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";

const DRAWER_WIDTH = 240;
const DRAWER_WIDTH_COLLAPSED = 80;

interface SideNavProps {
  onToggle?: (isOpen: boolean) => void;
}

export default function SideNav({ onToggle }: SideNavProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { text: "Home", icon: <HomeIcon />, path: "/" },
    { text: "View Data", icon: <TableChartIcon />, path: "/data" },
    { text: "Search", icon: <SearchIcon />, path: "/search" },
    { text: "Visualizations", icon: <BarChartIcon />, path: "/visualizations" },
  ];

  const handleToggle = () => {
    const newState = !isOpen;
    setIsOpen(newState);
    onToggle?.(newState);
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: isOpen ? DRAWER_WIDTH : DRAWER_WIDTH_COLLAPSED,
        flexShrink: 0,
        transition: "width 0.3s ease",
        "& .MuiDrawer-paper": {
          width: isOpen ? DRAWER_WIDTH : DRAWER_WIDTH_COLLAPSED,
          boxSizing: "border-box",
          transition: "width 0.3s ease",
          overflow: "hidden",
        },
      }}
    >
      <Toolbar>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
          {isOpen && (
            <Typography variant="h6" color="primary" sx={{ fontWeight: 600, whiteSpace: "nowrap" }}>
              CDPH
            </Typography>
          )}
          <IconButton
            size="small"
            onClick={handleToggle}
            sx={{
              ml: isOpen ? "auto" : 0,
              transition: "all 0.3s ease",
            }}
          >
            <ChevronLeftIcon sx={{ transform: isOpen ? "rotate(0)" : "rotate(180deg)", transition: "transform 0.3s ease" }} />
          </IconButton>
        </Box>
      </Toolbar>
      <Divider />
      <List sx={{ p: 0 }}>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => navigate(item.path)}
              sx={{
                justifyContent: isOpen ? "flex-start" : "center",
                px: isOpen ? 2 : 1,
                "&.Mui-selected": {
                  backgroundColor: "primary.light",
                  "&:hover": {
                    backgroundColor: "primary.light",
                  },
                },
              }}
              title={!isOpen ? item.text : ""}
            >
              <ListItemIcon sx={{ minWidth: isOpen ? 40 : "auto", justifyContent: "center" }}>
                {item.icon}
              </ListItemIcon>
              {isOpen && <ListItemText primary={item.text} />}
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
}