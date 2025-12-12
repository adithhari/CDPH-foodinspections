import { useEffect, useState } from "react";
import { Box, TextField, Button, CircularProgress, Alert } from "@mui/material";
import { api } from "../../api/client";

declare global {
  interface Window {
    Plotly: any;
  }
}

interface MapData {
  license_number: string;
  dba_name: string;
  facility_type: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  latitude: number;
  longitude: number;
  inspection_date: string;
  results: string;
  risk: string;
}

export default function FacilityMapViz() {
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const plotMap = async (search = "") => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get("/analytics/map-data", {
        params: search ? { search } : {}
      });

      const data: MapData[] = response.data.data;

      if (!data || data.length === 0) {
        setError(`No facilities found${search ? ` matching "${search}"` : ""}`);
        setLoading(false);
        return;
      }

      // Filter valid coordinates
      const validData = data.filter(d => d.latitude && d.longitude);

      const mapData = [
        {
          type: "scattermapbox",
          lat: validData.map(d => d.latitude),
          lon: validData.map(d => d.longitude),
          mode: "markers",
          marker: {
            size: 8,
            color: validData.map(d => 
              d.results === "Pass" ? "green" : d.results === "Fail" ? "red" : "orange"
            ),
            opacity: 0.7,
          },
          text: validData.map(d => 
            `<b>${d.dba_name}</b><br/>` +
            `Address: ${d.address}, ${d.city}, ${d.state} ${d.zip}<br/>` +
            `Type: ${d.facility_type}<br/>` +
            `Risk: ${d.risk || "N/A"}<br/>` +
            `Latest: ${d.inspection_date}<br/>` +
            `Result: ${d.results}`
          ),
          hovertemplate: "%{text}<extra></extra>",
        }
      ];

      const layout = {
        title: `Chicago Facilities – Latest Inspection Outcome${search ? ` (search: ${search})` : ""}`,
        mapbox: {
          style: "open-street-map",
          zoom: 10,
          center: { lat: 41.8781, lon: -87.6298 }
        },
        margin: { r: 0, t: 50, l: 0, b: 0 },
        height: window.innerHeight - 300,
        autosize: true,
      };

      window.Plotly?.newPlot("facility-map", mapData, layout, { responsive: true });
    } catch (err) {
      setError("Failed to load map data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    plotMap(searchTerm);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  useEffect(() => {
    // Load plotly library
    if (!window.Plotly) {
      const script = document.createElement("script");
      script.src = "https://cdn.plot.ly/plotly-latest.min.js";
      script.onload = () => {
        plotMap();
      };
      document.head.appendChild(script);
    } else {
      plotMap();
    }
  }, []);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", width: "100%", height: "100%", gap: 2 }}>
      <Box sx={{ display: "flex", gap: 2 }}>
        <TextField
          placeholder="Search by facility name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={handleKeyPress}
          size="small"
          fullWidth
          sx={{ maxWidth: 400 }}
        />
        <Button variant="contained" onClick={handleSearch} disabled={loading} sx={{ minWidth: 120 }}>
          Search
        </Button>
      </Box>
      
      {loading && <CircularProgress />}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      
      <Box sx={{ 
        borderRadius: 2, 
        overflow: "hidden", 
        border: "1px solid", 
        borderColor: "divider",
        boxShadow: 1,
        flex: 1,
        minHeight: 0
      }}>
        <div id="facility-map" style={{ width: "100%", height: "100%" }} />
      </Box>
    </Box>
  );
}
