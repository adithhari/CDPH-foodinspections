import { useState } from "react";
import {
  Box,
  Button,
  Stack,
  TextField,
  MenuItem,
  Typography,
} from "@mui/material";
import dayjs from "dayjs";
import type{ Inspection } from "../../types";

interface Props {
  initial?: Partial<Inspection>;
  onSubmit: (data: Partial<Inspection>) => void;
}

export default function InspectionForm({ initial, onSubmit }: Props) {
  const [form, setForm] = useState<Partial<Inspection>>({
    inspection_date: initial?.inspection_date ?? dayjs().format("YYYY-MM-DD"),
    result: initial?.result ?? "",
    inspection_type: initial?.inspection_type ?? "",
    risk: initial?.risk ?? "",
    violations: initial?.violations ?? "",
  });

  const handleChange = (field: keyof Inspection, value: string) => {
    setForm((f) => ({ ...f, [field]: value }));
  };

  return (
    <Box component="form" onSubmit={(e) => { e.preventDefault(); onSubmit(form); }}>
      <Typography variant="h6" mb={2}>
        {initial ? "Edit Inspection" : "New Inspection"}
      </Typography>

      <Stack spacing={2}>
        <TextField
          type="date"
          label="Inspection Date"
          value={form.inspection_date}
          onChange={(e) => handleChange("inspection_date", e.target.value)}
          InputLabelProps={{ shrink: true }}
          required
        />

        <TextField
          label="Inspection Type"
          value={form.inspection_type}
          onChange={(e) => handleChange("inspection_type", e.target.value)}
        />

        <TextField
          select
          label="Result"
          value={form.result}
          onChange={(e) => handleChange("result", e.target.value)}
          required
        >
          <MenuItem value="Pass">Pass</MenuItem>
          <MenuItem value="Fail">Fail</MenuItem>
          <MenuItem value="Pass w/ Conditions">Pass w/ Conditions</MenuItem>
          <MenuItem value="Out of Business">Out of Business</MenuItem>
        </TextField>

        <TextField
          select
          label="Risk"
          value={form.risk}
          onChange={(e) => handleChange("risk", e.target.value)}
        >
          <MenuItem value="Risk 1 (High)">Risk 1 (High)</MenuItem>
          <MenuItem value="Risk 2 (Medium)">Risk 2 (Medium)</MenuItem>
          <MenuItem value="Risk 3 (Low)">Risk 3 (Low)</MenuItem>
        </TextField>

        <TextField
          multiline
          rows={3}
          label="Violations"
          value={form.violations}
          onChange={(e) => handleChange("violations", e.target.value)}
        />

        <Button variant="contained" type="submit">
          {initial ? "Update" : "Submit"}
        </Button>
      </Stack>
    </Box>
  );
}
