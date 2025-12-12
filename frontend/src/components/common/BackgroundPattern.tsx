import { Box } from "@mui/material";

export default function BackgroundPattern() {
  return (
    <Box
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        opacity: 0.03,
        pointerEvents: "none",
        zIndex: 0,
        backgroundImage: `
          radial-gradient(circle at 20% 30%, rgba(33, 150, 243, 0.3) 0%, transparent 50%),
          radial-gradient(circle at 80% 70%, rgba(76, 175, 80, 0.3) 0%, transparent 50%)
        `,
      }}
    />
  );
}