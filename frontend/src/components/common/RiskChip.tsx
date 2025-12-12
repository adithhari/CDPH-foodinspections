import { Chip } from "@mui/material";
export default function RiskChip({ risk }: { risk?: string }) {
  const color =
    risk?.includes("High") ? "error" :
    risk?.includes("Medium") ? "warning" :
    risk?.includes("Low") ? "success" : "default";
  return <Chip label={risk ?? "—"} color={color as any} size="small" variant="outlined" />;
}
