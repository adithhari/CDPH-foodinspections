import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchFacilitiesWithLatestInspection, updateFacility, deleteFacility, createFacility } from "../../api/facilities";
import { DataGrid } from "@mui/x-data-grid";
import type { GridColDef, GridPaginationModel } from "@mui/x-data-grid";
import { Box, Button, Stack, Paper, Typography, alpha } from "@mui/material";
import { useNavigate } from "react-router-dom";
import RiskChip from "../../components/common/RiskChip";
import EditFacilityDialog from "./EditFacilityDialog";
import ConfirmDeleteDialog from "./ConfirmDeleteDialog";
import AddFacilityDialog from "./AddFacilityDialog";
import type { Facility } from "../../types";

export default function FacilitiesPage() {
  const nav = useNavigate();
  const queryClient = useQueryClient();
  const [paginationModel, setPaginationModel] = useState({ pageSize: 25, page: 0 });
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["facilities-with-inspection", paginationModel.page, paginationModel.pageSize],
    queryFn: () =>
      fetchFacilitiesWithLatestInspection(
        paginationModel.pageSize,
        paginationModel.page * paginationModel.pageSize
      ),
  });

  const handleEditClick = (facility: any) => {
    const facilityData: Facility = {
      ...facility,
      facility_type: facility.facility_type || facility.type,
    };
    setSelectedFacility(facilityData);
    setEditDialogOpen(true);
  };

  const handleDeleteClick = (facility: any) => {
    const facilityData: Facility = {
      ...facility,
      facility_type: facility.facility_type || facility.type,
    };
    setSelectedFacility(facilityData);
    setDeleteDialogOpen(true);
    setDeleteError(null);
  };

  const handleConfirmDelete = async () => {
    if (!selectedFacility) return;
    setDeleteLoading(true);
    setDeleteError(null);
    try {
      await deleteFacility(selectedFacility.license_number);
      setDeleteDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["facilities-with-inspection"] });
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "Failed to delete facility");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleSaveFacility = async (facility: Facility) => {
    await updateFacility(facility.license_number, facility);
    queryClient.invalidateQueries({ queryKey: ["facilities-with-inspection"] });
  };

  const handleAddFacility = async (facility: Facility) => {
    await createFacility(facility);
    queryClient.invalidateQueries({ queryKey: ["facilities-with-inspection"] });
  };

  const cols: GridColDef[] = [
    { field: "license_number", headerName: "License #", width: 130, flex: 0.8 },
    { field: "dba_name", headerName: "Facility Name", flex: 1.5, minWidth: 220 },
    { field: "address", headerName: "Address", flex: 1.5, minWidth: 240 },
    { field: "risk", headerName: "Risk Level", width: 140, renderCell: p => <RiskChip risk={p.value} /> },
    { field: "latest_result", headerName: "Latest Result", width: 150 },
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
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 600, color: "text.primary" }}>
            Facilities Management
          </Typography>
          <Button
            variant="contained"
            sx={{ textTransform: "none" }}
            onClick={() => setAddDialogOpen(true)}
          >
            + Add Facility
          </Button>
        </Box>
        
        <Box
          sx={{
            height: 650,
            width: "100%",
            "& .MuiDataGrid-root": {
              border: "none",
              borderRadius: "8px",
              "& .MuiDataGrid-columnHeaderTitle": {
                fontWeight: 600,
                color: "text.primary",
              },
              "& .MuiDataGrid-virtualScroller": {
                backgroundColor: "background.paper",
              },
              "& .MuiDataGrid-row": {
                "&:hover": {
                  backgroundColor: alpha("#1976d2", 0.05),
                },
              },
              "& .MuiDataGrid-cell": {
                borderColor: "divider",
                padding: "12px 16px",
              },
              "& .MuiDataGrid-columnHeader": {
                backgroundColor: alpha("#1976d2", 0.08),
                borderColor: "divider",
              },
              "& .MuiTablePagination-root": {
                borderTop: "1px solid",
                borderColor: "divider",
              },
            },
          }}
        >
          <DataGrid
            loading={isLoading}
            rows={(data?.data ?? []).map((r: any) => ({ id: r.license_number, ...r }))}
            columns={cols}
            rowCount={data?.total ?? 0}
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
            onRowClick={(p) => {
              if ((p.colDef.field as string) !== "actions") {
                nav(`/facilities/${p.row.license_number}`);
              }
            }}
            pageSizeOptions={[25, 50, 100]}
            paginationMode="server"
            sx={{
              "& .MuiDataGrid-row:hover": {
                cursor: "pointer",
              },
            }}
          />
        </Box>
      </Paper>

      <EditFacilityDialog
        open={editDialogOpen}
        facility={selectedFacility}
        onClose={() => setEditDialogOpen(false)}
        onSave={handleSaveFacility}
      />
      <ConfirmDeleteDialog
        open={deleteDialogOpen}
        facilityName={selectedFacility?.dba_name || ""}
        loading={deleteLoading}
        error={deleteError}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setDeleteDialogOpen(false);
          setDeleteError(null);
        }}
      />
      <AddFacilityDialog
        open={addDialogOpen}
        onClose={() => setAddDialogOpen(false)}
        onSave={handleAddFacility}
      />
    </Box>
  );
}
