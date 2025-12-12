import { useQuery } from "@tanstack/react-query";
import { Box, TextField, Stack, Typography, Paper, Chip } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import type { GridColDef } from "@mui/x-data-grid";
import { useState } from "react";
import { api } from "../../api/client";

type Violation = {
  id: string;
  license_number: string;
  inspection_id: string;
  description: string;
  risk?: string;
};

export default function ViolationsPage() {
  const [q, setQ] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["violations", q],
    queryFn: async () => {
      const res = await api.get("/violations", { params: { q } });
      return res.data as Violation[];
    },
  });

  const cols: GridColDef[] = [
    { field: "license_number", headerName: "License #", width: 140 },
    { field: "inspection_id", headerName: "Inspection ID", width: 140 },
    {
      field: "description",
      headerName: "Description",
      flex: 1,
      renderCell: (p) => <span style={{ whiteSpace: "normal" }}>{p.value}</span>,
    },
    {
      field: "risk",
      headerName: "Risk",
      width: 150,
      renderCell: (p) => (
        <Chip
          label={p.value ?? "—"}
          color={
            p.value?.includes("High")
              ? "error"
              : p.value?.includes("Medium")
              ? "warning"
              : "success"
          }
          size="small"
        />
      ),
    },
  ];

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Violations</Typography>
      <Stack direction="row" spacing={2} mb={2}>
        <TextField
          size="small"
          label="Search violation text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </Stack>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="body2">
          🔍 Later, this page can include keyword or NLP-based tagging (e.g., “temperature,” “storage,” “sanitation”).
        </Typography>
      </Paper>

      <div style={{ height: 600 }}>
        <DataGrid
          loading={isLoading}
          rows={(data ?? []).map((v) => ({ id: v.id, ...v }))}
          columns={cols}
          pageSizeOptions={[25, 50]}
        />
      </div>
    </Box>
  );
}
