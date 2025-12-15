import { useEffect, useState } from "react";
import { CircularProgress, Alert, Box } from "@mui/material";
import { api } from "../../api/client";

declare global {
  interface Window {
    Plotly: any;
  }
}

interface RiskData {
  facility_type: string;
  risk: string;
  inspection_count: number;
}

export default function RiskByFacilityTypeViz() {
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

        const response = await api.get("/analytics/risk-by-facility-type");
        const data: RiskData[] = response.data.data;

        // Get top facility types by inspection count
        const topTypes = Array.from(
          new Map(
            data.map(d => [d.facility_type, 
              data.filter(x => x.facility_type === d.facility_type)
                .reduce((sum, x) => sum + x.inspection_count, 0)
            ])
          ),
          ([type, count]) => ({ type, count })
        )
          .sort((a, b) => b.count - a.count)
          .slice(0, 15)
          .map(t => t.type);

        const filteredData = data.filter(d => topTypes.includes(d.facility_type));

        // Group by risk level for stacked data
        const risks = [...new Set(filteredData.map(d => d.risk))].sort();
        const types = [...new Set(filteredData.map(d => d.facility_type))];

        const chartData = risks.map(risk => ({
          name: risk,
          x: types,
          y: types.map(type => 
            filteredData.find(d => d.facility_type === type && d.risk === risk)?.inspection_count || 0
          ),
          type: "bar",
        }));

        const layout = {
          title: "Inspection Risk by Facility Type (Top 15 Types)",
          xaxis: { tickangle: -45 },
          yaxis: { title: "Number of Inspections" },
          barmode: "group",
          height: window.innerHeight - 300,
          margin: { b: 150, l: 60, r: 40, t: 50 },
          autosize: true,
        };

        window.Plotly?.newPlot("risk-chart", chartData, layout, { responsive: true });
      } catch (err) {
        setError("Failed to load risk chart data");
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
      <Box sx={{ 
        borderRadius: 2, 
        overflow: "hidden", 
        border: "1px solid", 
        borderColor: "divider",
        boxShadow: 1,
        flex: 1,
        minHeight: 0
      }}>
        <div id="risk-chart" style={{ width: "100%", height: "100%" }} />
      </Box>
    </Box>
  );
}
