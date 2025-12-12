import { IconButton, Tooltip } from "@mui/material";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import React from "react";
import { useTheme } from "@mui/material/styles";
import { ColorModeContext } from "../../theme/ColorModeContext";

export default function DarkModeSwitch() {
  const theme = useTheme();
  const ctx = React.useContext(ColorModeContext);
  const isDark = theme.palette.mode === "dark";
  return (
    <Tooltip title={isDark ? "Switch to light" : "Switch to dark"}>
      <IconButton onClick={ctx.toggle} color="inherit" size="small" aria-label="toggle dark mode">
        {isDark ? <LightModeIcon /> : <DarkModeIcon />}
      </IconButton>
    </Tooltip>
  );
}
