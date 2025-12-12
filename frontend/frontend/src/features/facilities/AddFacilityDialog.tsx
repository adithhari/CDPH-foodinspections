import { useState } from "react";
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

interface AddFacilityDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (facility: Facility) => Promise<void>;
}

const RISK_OPTIONS = [
  "Risk 1 (High)",
  "Risk 2 (Medium)",
  "Risk 3 (Low)",
];

export default function AddFacilityDialog({
  open,
  onClose,
  onSave,
}: AddFacilityDialogProps) {
  const [formData, setFormData] = useState<Partial<Facility>>({
    license_number: "",
    dba_name: "",
    facility_type: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    risk: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (field: keyof Facility, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSave = async () => {
    setError(null);
    
    // Validate required fields
    if (!formData.license_number || !formData.dba_name || !formData.address) {
      setError("License Number, DBA Name, and Address are required");
      return;
    }

    setLoading(true);
    try {
      await onSave(formData as Facility);
      onClose();
      // Reset form
      setFormData({
        license_number: "",
        dba_name: "",
        facility_type: "",
        address: "",
        city: "",
        state: "",
        zip: "",
        risk: "",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add New Facility</DialogTitle>
      <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 2 }}>
        {error && <Alert severity="error">{error}</Alert>}
        <TextField
          label="License Number *"
          value={formData.license_number || ""}
          onChange={(e) => handleChange("license_number", e.target.value)}
          fullWidth
          size="small"
        />
        <TextField
          label="DBA Name *"
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
          label="Address *"
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
          {loading ? <CircularProgress size={24} /> : "Add"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
