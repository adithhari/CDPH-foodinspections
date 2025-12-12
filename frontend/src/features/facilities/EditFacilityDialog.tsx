import { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  Button,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
} from "@mui/material";
import type { Facility } from "../../types";

interface EditFacilityDialogProps {
  open: boolean;
  facility: Facility | null;
  onClose: () => void;
  onSave: (facility: Facility) => Promise<void>;
}

const RISK_OPTIONS = [
  "Risk 1 (High)",
  "Risk 2 (Medium)",
  "Risk 3 (Low)",
];

export default function EditFacilityDialog({
  open,
  facility,
  onClose,
  onSave,
}: EditFacilityDialogProps) {
  const [formData, setFormData] = useState<Facility | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (facility) {
      setFormData(facility);
      setError(null);
    }
  }, [facility, open]);

  const handleChange = (field: keyof Facility, value: any) => {
    if (formData) {
      setFormData({ ...formData, [field]: value });
    }
  };

  const handleSave = async () => {
    if (!formData) return;
    setLoading(true);
    setError(null);
    try {
      await onSave(formData);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Edit Facility</DialogTitle>
      <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 2 }}>
        {error && <Alert severity="error">{error}</Alert>}
        {formData && (
          <>
            <TextField
              label="License Number"
              value={formData.license_number || ""}
              disabled
              fullWidth
              size="small"
            />
            <TextField
              label="DBA Name"
              value={formData.dba_name || ""}
              onChange={(e) => handleChange("dba_name", e.target.value)}
              fullWidth
              size="small"
            />
            <TextField
              label="Facility Type"
              value={formData.facility_type || ""}
              onChange={(e) => handleChange("facility_type", e.target.value)}
              fullWidth
              size="small"
            />
            <TextField
              label="Address"
              value={formData.address || ""}
              onChange={(e) => handleChange("address", e.target.value)}
              fullWidth
              size="small"
            />
            <TextField
              label="City"
              value={formData.city || ""}
              onChange={(e) => handleChange("city", e.target.value)}
              fullWidth
              size="small"
            />
            <TextField
              label="State"
              value={formData.state || ""}
              onChange={(e) => handleChange("state", e.target.value)}
              fullWidth
              size="small"
            />
            <TextField
              label="ZIP"
              value={formData.zip || ""}
              onChange={(e) => handleChange("zip", e.target.value)}
              fullWidth
              size="small"
            />
            <FormControl fullWidth size="small">
              <InputLabel>Risk</InputLabel>
              <Select
                value={formData.risk || ""}
                label="Risk"
                onChange={(e) => handleChange("risk", e.target.value)}
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                {RISK_OPTIONS.map((risk) => (
                  <MenuItem key={risk} value={risk}>
                    {risk}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button 
          onClick={handleSave} 
          variant="contained" 
          disabled={loading}
          sx={{ minWidth: 80 }}
        >
          {loading ? <CircularProgress size={24} /> : "Save"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
