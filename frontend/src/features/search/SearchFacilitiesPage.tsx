import { useState, useCallback } from "react";
import {
  Box,
  TextField,
  Button,
  Paper,
  CircularProgress,
  Typography,
  Alert,
  Stack,
  alpha,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../../api/client";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import RiskChip from "../../components/common/RiskChip";
import EditFacilityDialog from "../facilities/EditFacilityDialog";
import ConfirmDeleteDialog from "../facilities/ConfirmDeleteDialog";
import { updateFacility, deleteFacility } from "../../api/facilities";

export default function SearchFacilitiesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [editingFacility, setEditingFacility] = useState<any>(null);
  const [deletingFacility, setDeletingFacility] = useState<any>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: searchResults, isLoading, error } = useQuery({
    queryKey: ["searchFacilities", searchQuery],
    queryFn: async () => {
      if (!searchQuery.trim()) {
        return { data: [], total: 0 };
      }
      const response = await api.get("/facilities/with-latest-inspection", {
        params: {
          search: searchQuery,
          limit: 100,
          offset: 0,
        },
      });
      return response.data;
    },
    enabled: searchPerformed && searchQuery.trim().length > 0,
  });

  const handleSearch = useCallback(() => {
    setSearchPerformed(true);
  }, []);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleEditClick = (facility: any) => {
    setEditingFacility(facility);
  };

  const handleDeleteClick = (facility: any) => {
    setDeletingFacility(facility);
  };

  const handleEditSave = async (facility: any) => {
    try {
      await updateFacility(facility.license_number, facility);
      setEditingFacility(null);
      queryClient.invalidateQueries({ queryKey: ["searchFacilities", searchQuery] });
    } catch (error) {
      console.error("Error updating facility:", error);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingFacility) return;
    setDeleteLoading(true);
    setDeleteError(null);
    try {
      await deleteFacility(deletingFacility.license_number);
      setDeletingFacility(null);
      queryClient.invalidateQueries({ queryKey: ["searchFacilities", searchQuery] });
    } catch (error) {
      setDeleteError("Failed to delete facility. Please try again.");
      console.error("Error deleting facility:", error);
    } finally {
      setDeleteLoading(false);
    }
  };

  const cols: GridColDef[] = [
    { field: "license_number", headerName: "License #", width: 130, flex: 0.8 },
    { field: "dba_name", headerName: "Facility Name", flex: 1.5, minWidth: 220 },
    { field: "address", headerName: "Address", flex: 1.5, minWidth: 240 },
    { field: "city", headerName: "City", width: 120 },
    { field: "risk", headerName: "Risk Level", width: 140, renderCell: p => <RiskChip risk={p.value} /> },
    {
      field: "actions",
      headerName: "Actions",
      width: 220,
      sortable: false,
      align: "center" as const,
      headerAlign: "center" as const,
      renderCell: (params) => (
        <Stack direction="row" spacing={1} sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
          <Button
            size="small"
            variant="outlined"
            startIcon={<EditIcon />}
            sx={{
              textTransform: "none",
              borderRadius: "6px",
              "&:hover": {
                backgroundColor: alpha("#1976d2", 0.1),
              }
            }}
            onClick={() => handleEditClick(params.row)}
          >
            Edit
          </Button>
          <Button
            size="small"
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            sx={{
              textTransform: "none",
              borderRadius: "6px",
              "&:hover": {
                backgroundColor: alpha("#d32f2f", 0.1),
              }
            }}
            onClick={() => handleDeleteClick(params.row)}
          >
            Delete
          </Button>
        </Stack>
      ),
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Paper
        elevation={0}
        sx={{
          p: 3,
          borderRadius: 2,
          backgroundColor: "background.paper",
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <Typography variant="h5" sx={{ mb: 3, fontWeight: 600, color: "text.primary" }}>
          Search Facilities
        </Typography>

        {/* Search Box */}
        <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
          <TextField
            fullWidth
            placeholder="Search by facility name (DBA Name) or license number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            variant="outlined"
            size="small"
          />
          <Button
            variant="contained"
            onClick={handleSearch}
            startIcon={<SearchIcon />}
            sx={{ minWidth: 120 }}
          >
            Search
          </Button>
        </Box>

        {/* Results Section */}
        {searchPerformed && (
          <>
            {isLoading && (
              <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                <CircularProgress />
              </Box>
            )}

            {error && (
              <Alert severity="error">
                Error searching facilities. Please try again.
              </Alert>
            )}

            {!isLoading && searchResults && (
              <>
                {searchResults.data && searchResults.data.length > 0 ? (
                  <Box sx={{ height: 600, width: "100%" }}>
                    <Typography variant="body2" sx={{ mb: 2, color: "text.secondary" }}>
                      Found <strong>{searchResults.total || 0}</strong> facility(ies)
                    </Typography>
                    <DataGrid
                      rows={searchResults.data.map((f: any) => ({ ...f, id: f.license_number }))}
                      columns={cols}
                      disableColumnMenu
                      hideFooterPagination
                      hideFooter
                      sx={{
                        border: "1px solid",
                        borderColor: "divider",
                        borderRadius: 1,
                        "& .MuiDataGrid-columnHeader": {
                          backgroundColor: "background.default",
                          fontWeight: 600,
                        },
                        "& .MuiDataGrid-row": {
                          "&:hover": {
                            backgroundColor: "action.hover",
                          },
                        },
                      }}
                    />
                  </Box>
                ) : (
                  <Alert severity="info">
                    No facilities found matching "{searchQuery}". Try searching with a different name or license number.
                  </Alert>
                )}
              </>
            )}

            {!searchPerformed && (
              <Alert severity="info">
                Enter a facility name (DBA Name) or license number and click Search to get started.
              </Alert>
            )}
          </>
        )}

        {!searchPerformed && (
          <Alert severity="info">
            Enter a facility name (DBA Name) or license number and click Search to get started.
          </Alert>
        )}
      </Paper>

      {/* Edit Dialog */}
      {editingFacility && (
        <EditFacilityDialog
          open={true}
          onClose={() => setEditingFacility(null)}
          facility={editingFacility}
          onSave={handleEditSave}
        />
      )}

      {/* Delete Dialog */}
      {deletingFacility && (
        <ConfirmDeleteDialog
          open={true}
          onCancel={() => setDeletingFacility(null)}
          facilityName={deletingFacility.dba_name}
          loading={deleteLoading}
          error={deleteError}
          onConfirm={handleDeleteConfirm}
        />
      )}
    </Box>
  );
}

