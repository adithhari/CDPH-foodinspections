// import React, { createContext, useMemo, useState } from "react";
// import { ThemeProvider, createTheme } from "@mui/material/styles";

// export const ColorModeContext = createContext({ toggle: () => {} });

// export default function ColorModeProvider({ children }: { children: React.ReactNode }) {
//   const [mode, setMode] = useState<"light"|"dark">("dark");
//   const colorMode = useMemo(() => ({ toggle: () => setMode(m => (m === "light" ? "dark" : "light")) }), []);
//   const theme = useMemo(() => createTheme({ palette: { mode } }), [mode]);
//   return (
//     <ColorModeContext.Provider value={colorMode}>
//       <ThemeProvider theme={theme}>{children}</ThemeProvider>
//     </ColorModeContext.Provider>
//   );
// }


import React, { createContext, useMemo, useState } from "react";
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";
import baseTheme from "./theme";

export const ColorModeContext = createContext({ toggle: () => {} });

export default function ColorModeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<"light" | "dark">("dark");
  const colorMode = useMemo(() => ({ toggle: () => setMode((m) => (m === "light" ? "dark" : "light")) }), []);
  const theme = useMemo(() => createTheme({ ...baseTheme, palette: { ...baseTheme.palette, mode } }), [mode]);

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}
