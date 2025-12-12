import { useQuery } from "@tanstack/react-query";
import { Box, Stack, TextField, Button, Paper, Typography, MenuItem } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import type { GridColDef } from "@mui/x-data-grid";
import { useState } from "react";
import dayjs from "dayjs";
import type { Inspection } from "../../types";
import { api } from "../../api/client";
import ResultBreakdownBar from "../../charts/ResultBreakdownBar";

export default function InspectionsPage() {
  const [from, setFrom] = useState(dayjs().subtract(90, "day").format("YYYY-MM-DD"));
  const [to, setTo] = useState(dayjs().format("YYYY-MM-DD"));
  const [risk, setRisk] = useState("");
  const [result, setResult] = useState("");

  const { data, isLoading, refetch, error } = useQuery({
    queryKey: ["inspections", from, to, risk, result],
    queryFn: async () => {
      const res = await api.get("/inspections", { params: { from, to, risk, result } });
      return res.data as Inspection[];
    },
  });

  const cols: GridColDef[] = [
    { field: "inspection_id", headerName: "ID", width: 120 },
    { field: "license_number", headerName: "License #", width: 130 },
    { field: "inspection_date", headerName: "Date", width: 130 },
    { field: "inspection_type", headerName: "Type", flex: 1 },
    { field: "result", headerName: "Result", width: 160 },
    { field: "risk", headerName: "Risk", width: 160 },
  ];

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">
          Error loading inspections: {(error as Error).message}
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Inspections</Typography>
      <Stack direction="row" spacing={2} mb={2} alignItems="center">
        <TextField
          type="date" label="From" value={from}
          onChange={(e) => setFrom(e.target.value)} 
          InputLabelProps={{ shrink: true }}
          size="small"
        />
        <TextField
          type="date" label="To" value={to}
          onChange={(e) => setTo(e.target.value)} 
          InputLabelProps={{ shrink: true }}
          size="small"
        />
        <TextField
          label="Risk" 
          value={risk} 
          onChange={(e) => setRisk(e.target.value)}
          select 
          sx={{ width: 160 }}
          size="small"
        >
          <MenuItem value="">All</MenuItem>
          <MenuItem value="Risk 1 (High)">High</MenuItem>
          <MenuItem value="Risk 2 (Medium)">Medium</MenuItem>
          <MenuItem value="Risk 3 (Low)">Low</MenuItem>
        </TextField>
        <TextField
          label="Result" 
          value={result} 
          onChange={(e) => setResult(e.target.value)}
          select 
          sx={{ width: 180 }}
          size="small"
        >
          <MenuItem value="">All</MenuItem>
          <MenuItem value="Pass">Pass</MenuItem>
          <MenuItem value="Fail">Fail</MenuItem>
          <MenuItem value="Pass w/ Conditions">Pass w/ Conditions</MenuItem>
        </TextField>
        <Button variant="contained" onClick={() => refetch()}>Apply</Button>
      </Stack>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="subtitle1">Result Breakdown</Typography>
        <ResultBreakdownBar inspections={data ?? []} />
      </Paper>

      <div style={{ height: 600 }}>
        <DataGrid
          loading={isLoading}
          rows={(data ?? []).map((i) => ({ id: i.inspection_id, ...i }))}
          columns={cols}
          pageSizeOptions={[25, 50]}
          initialState={{ pagination: { paginationModel: { pageSize: 25, page: 0 }}}}
        />
      </div>
    </Box>
  );
}
