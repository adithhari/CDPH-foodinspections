import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchFacility, fetchFacilityInspections } from "../../api/facilities";
import { Box, Grid, Paper, Typography } from "@mui/material";
import PassRateOverTime from "../../charts/PassRateOverTime";
import FacilityMap from "../../maps/FacilityMap";

export default function FacilityDetailPage() {
  const { license } = useParams();
  const { data: fac } = useQuery({ queryKey: ["facility", license], queryFn: () => fetchFacility(license!) });
  const { data: ins } = useQuery({ queryKey: ["facility-ins", license], queryFn: () => fetchFacilityInspections(license!) });

  return (
    <Box>
      <Typography variant="h5" gutterBottom>{fac?.dba_name} • {fac?.license_number}</Typography>
      <Typography variant="body2" gutterBottom>{fac?.address}</Typography>

      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1">Inspections • Trend</Typography>
            <PassRateOverTime inspections={ins ?? []} />
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: 360 }}>
            <Typography variant="subtitle1">Location</Typography>
            <FacilityMap lat={fac?.latitude} lon={fac?.longitude} />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
