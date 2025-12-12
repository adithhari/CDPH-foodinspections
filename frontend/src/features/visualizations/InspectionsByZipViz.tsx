import { useEffect, useState } from "react";
import { CircularProgress, Alert, Box } from "@mui/material";
import { api } from "../../api/client";

declare global {
  interface Window {
    Plotly: any;
  }
}

interface ZipData {
  zip: string;
  inspection_count: number;
}

export default function InspectionsByZipViz() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadChart = async () => {
      try {
        // Load plotly library
        if (!window.Plotly) {
          await new Promise((resolve) => {
            const script = document.createElement("script");
            script.src = "https://cdn.plot.ly/plotly-latest.min.js";
            script.onload = resolve;
            document.head.appendChild(script);
          });
        }

        const response = await api.get("/analytics/inspections-by-zip");
        const data: ZipData[] = response.data.data;

        if (!data || data.length === 0) {
          setError("No ZIP code data available");
          setLoading(false);
          return;
        }

        // Bin data into quintiles
        const counts = data.map(d => d.inspection_count).sort((a, b) => a - b);
        const q20 = counts[Math.floor(counts.length * 0.2)];
        const q40 = counts[Math.floor(counts.length * 0.4)];
        const q60 = counts[Math.floor(counts.length * 0.6)];
        const q80 = counts[Math.floor(counts.length * 0.8)];

        const getRange = (count: number) => {
          if (count <= q20) return "0-20%";
          if (count <= q40) return "20-40%";
          if (count <= q60) return "40-60%";
          if (count <= q80) return "60-80%";
          return "80-100%";
        };

        // Prepare data for bar chart (top 30 zip codes)
        const topZips = data.slice(0, 30);

        const chartData = [{
          x: topZips.map(d => d.zip),
          y: topZips.map(d => d.inspection_count),
          type: "bar",
          marker: {
            color: topZips.map(d => {
              const range = getRange(d.inspection_count);
              const colors: Record<string, string> = {
                "0-20%": "#d73027",
                "20-40%": "#fee090",
                "40-60%": "#1a9850",
                "60-80%": "#91bfdb",
                "80-100%": "#4575b4",
              };
              return colors[range];
            }),
          },
        }];

        const layout = {
          title: "Food Inspections by ZIP Code (Top 30)",
          xaxis: { title: "ZIP Code" },
          yaxis: { title: "Number of Inspections" },
          height: window.innerHeight - 300,
          margin: { b: 80, l: 60, r: 40, t: 50 },
          autosize: true,
        };

        window.Plotly?.newPlot("zip-chart", chartData, layout, { responsive: true });
      } catch (err) {
        setError("Failed to load ZIP code data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadChart();
  }, []);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", width: "100%", height: "100%" }}>
      {loading && <CircularProgress />}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Box sx={{ fontSize: "0.875rem", color: "text.secondary", mb: 2 }}>
        <strong>Color Scale:</strong> Red (lowest inspections) → Green (highest inspections)
      </Box>
      <Box sx={{ 
        borderRadius: 2, 
        overflow: "hidden", 
        border: "1px solid", 
        borderColor: "divider",
        boxShadow: 1,
        flex: 1,
        minHeight: 0
      }}>
        <div id="zip-chart" style={{ width: "100%", height: "100%" }} />
      </Box>
    </Box>
  );
}
