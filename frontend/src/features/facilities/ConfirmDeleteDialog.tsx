import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
  Alert,
} from "@mui/material";

interface ConfirmDeleteDialogProps {
  open: boolean;
  facilityName: string;
  loading: boolean;
  error: string | null;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
}

export default function ConfirmDeleteDialog({
  open,
  facilityName,
  loading,
  error,
  onConfirm,
  onCancel,
}: ConfirmDeleteDialogProps) {
  return (
    <Dialog open={open} onClose={onCancel}>
      <DialogTitle>Delete Facility</DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <p>
          Are you sure you want to delete <strong>{facilityName}</strong>? This action cannot be undone.
        </p>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          color="error"
          disabled={loading}
          sx={{ minWidth: 80 }}
        >
          {loading ? <CircularProgress size={24} /> : "Delete"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
