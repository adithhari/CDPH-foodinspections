import React from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Box, 
  Typography, 
  Paper, 
  CircularProgress,
  Card,
  CardContent,
  Divider,
  Tabs,
  Tab
} from "@mui/material";
import { Bar, Line, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { api } from "../../api/client";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import AssessmentIcon from "@mui/icons-material/Assessment";
import PieChartIcon from "@mui/icons-material/PieChart";
import FacilityMapViz from "./FacilityMapViz";
import RiskByFacilityTypeViz from "./RiskByFacilityTypeViz";
import InspectionsByZipViz from "./InspectionsByZipViz";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface InspectionTrend {
  month: string;
  pass_count: number;
  fail_count: number;
  total_count: number;
  pass_rate: number;
}

interface RiskDistribution {
  risk: string;
  count: number;
}

interface ResultBreakdown {
  result: string;
  count: number;
}

interface VizData {
  inspection_trends: InspectionTrend[];
  risk_distribution: RiskDistribution[];
  result_breakdown: ResultBreakdown[];
}

export default function VisualizationsPage() {
  const [tabValue, setTabValue] = React.useState(0);
  const { data, isLoading, error } = useQuery<VizData>({
    queryKey: ["visualizations"],
    queryFn: async () => {
      const res = await api.get("/analytics");
      return res.data;
    },
  });

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px" }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">Error loading visualization data</Typography>
      </Box>
    );
  }

  // Prepare Pass Rate Over Time Chart Data
  const passRateData = {
    labels: data?.inspection_trends?.map(d => d.month) || [],
    datasets: [
      {
        label: "Pass Rate (%)",
        data: data?.inspection_trends?.map(d => d.pass_rate) || [],
        borderColor: "#4caf50",
        backgroundColor: "rgba(76, 175, 80, 0.1)",
        borderWidth: 3,
        tension: 0.4,
        fill: true,
      },
    ],
  };

  // Prepare Inspection Volume Chart Data
  const volumeData = {
    labels: data?.inspection_trends?.map(d => d.month) || [],
    datasets: [
      {
        label: "Pass",
        data: data?.inspection_trends?.map(d => d.pass_count) || [],
        backgroundColor: "#4caf50",
      },
      {
        label: "Fail",
        data: data?.inspection_trends?.map(d => d.fail_count) || [],
        backgroundColor: "#f44336",
      },
    ],
  };

  // Prepare Risk Distribution Doughnut Chart
  const riskData = {
    labels: data?.risk_distribution?.map(d => d.risk || "Unknown") || [],
    datasets: [
      {
        label: "Facilities",
        data: data?.risk_distribution?.map(d => d.count) || [],
        backgroundColor: [
          "#f44336", // Risk High
          "#ff9800", // Risk Medium
          "#4caf50", // Risk Low
          "#9e9e9e", // Unknown
        ],
        borderWidth: 2,
        borderColor: "#fff",
      },
    ],
  };

  // Prepare Results Breakdown Chart
  const resultsData = {
    labels: data?.result_breakdown?.map(d => d.result || "Unknown") || [],
    datasets: [
      {
        label: "Count",
        data: data?.result_breakdown?.map(d => d.count) || [],
        backgroundColor: [
          "#4caf50", // Pass
          "#ff9800", // Pass w/ Conditions
          "#f44336", // Fail
          "#2196f3", // Out of Business
          "#9e9e9e", // Other
        ],
      },
    ],
  };

  return (
    <Box sx={{ 
      display: "flex", 
      flexDirection: "column",
      backgroundColor: "background.default", 
      height: "100vh",
      p: 0,
      overflow: "hidden"
    }}>
      <Paper
        elevation={0}
        sx={{
          p: 3,
          borderRadius: 0,
          backgroundColor: "background.paper",
          border: "none",
          borderBottom: "1px solid",
          borderColor: "divider",
          flex: "0 0 auto"
        }}
      >
        <Box sx={{ mb: 2 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, color: "text.primary" }}>
            Food Inspection Analytics
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Visual analysis of Chicago food inspection data showing trends, patterns, and distributions
          </Typography>
        </Box>

        {/* Tabs */}
        <Box sx={{ borderTop: 1, borderColor: "divider", pt: 2 }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange}
            sx={{
              "& .MuiTab-root": {
                textTransform: "uppercase",
                fontWeight: 600,
                fontSize: "0.875rem",
                minHeight: 48,
                "&.Mui-selected": {
                  color: "primary.main",
                }
              },
            }}
          >
            <Tab label="Dashboard" />
            <Tab label="Facility Map" />
            <Tab label="Risk by Type" />
            <Tab label="Inspections by ZIP" />
          </Tabs>
        </Box>
      </Paper>

      {/* Content Area - Scrollable */}
      <Box sx={{ 
        flex: 1,
        overflow: "auto",
        p: 3
      }}>

        {/* Tab 1: Dashboard */}
        {tabValue === 0 && (
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 3, width: "100%" }}>
            {/* Pass Rate Trend - Full Width */}
            <Box sx={{ gridColumn: { xs: "1", md: "1 / -1" } }}>
              <ChartCard
                icon={<TrendingUpIcon />}
                title="Pass Rate Trend Over Time"
                description="Monthly pass rate percentage showing inspection success trends"
              >
                <Box sx={{ height: 450, width: "100%" }}>
                  <Line 
                    data={passRateData} 
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { position: "top" as const },
                        title: { display: false },
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          max: 100,
                          ticks: {
                            callback: (value) => `${value}%`,
                          },
                        },
                      },
                    }}
                  />
                </Box>
              </ChartCard>
            </Box>

            {/* Inspection Volume - Half Width */}
            <Box>
              <ChartCard
                icon={<AssessmentIcon />}
                title="Inspection Volume"
                description="Monthly inspection counts by result type"
              >
                <Box sx={{ height: 400, width: "100%" }}>
                  <Bar 
                    data={volumeData} 
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { position: "top" as const },
                      },
                      scales: {
                        x: { stacked: true },
                        y: { 
                          stacked: true,
                          beginAtZero: true,
                        },
                      },
                    }}
                  />
                </Box>
              </ChartCard>
            </Box>

            {/* Risk Distribution - Half Width */}
            <Box>
              <ChartCard
                icon={<PieChartIcon />}
                title="Risk Level Distribution"
                description="Proportion of facilities by risk category"
              >
                <Box sx={{ height: 400, display: "flex", justifyContent: "center", alignItems: "center" }}>
                  <Box sx={{ width: "100%", maxWidth: 350 }}>
                    <Doughnut 
                      data={riskData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: true,
                        plugins: {
                          legend: { position: "bottom" as const },
                        },
                      }}
                    />
                  </Box>
                </Box>
              </ChartCard>
            </Box>

            {/* Results Breakdown - Full Width */}
            <Box sx={{ gridColumn: { xs: "1", md: "1 / -1" } }}>
              <ChartCard
                icon={<AssessmentIcon />}
                title="Inspection Results Breakdown"
                description="Distribution of all inspection outcomes"
              >
                <Box sx={{ height: 400, width: "100%" }}>
                  <Bar 
                    data={resultsData} 
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      indexAxis: "y" as const,
                      plugins: {
                        legend: { display: false },
                      },
                      scales: {
                        x: { beginAtZero: true },
                      },
                    }}
                  />
                </Box>
              </ChartCard>
            </Box>
          </Box>
        )}

        {/* Tab 2: Facility Map */}
        {tabValue === 1 && (
          <Box sx={{ width: "100%", height: "100%", display: "flex" }}>
            <FacilityMapViz />
          </Box>
        )}

        {/* Tab 3: Risk by Facility Type */}
        {tabValue === 2 && (
          <Box sx={{ width: "100%", height: "100%" }}>
            <RiskByFacilityTypeViz />
          </Box>
        )}

        {/* Tab 4: Inspections by ZIP */}
        {tabValue === 3 && (
          <Box sx={{ width: "100%", height: "100%" }}>
            <InspectionsByZipViz />
          </Box>
        )}
      </Box>
    </Box>
  );
}

// Chart Card Component
interface ChartCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  children: React.ReactNode;
}

function ChartCard({ icon, title, description, children }: ChartCardProps) {
  return (
    <Card
      elevation={0}
      sx={{
        height: "100%",
        borderRadius: 3,
        border: "1px solid",
        borderColor: "divider",
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "primary.main",
              color: "white",
              mr: 2,
            }}
          >
            {icon}
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {title}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {description}
            </Typography>
          </Box>
        </Box>
        <Divider sx={{ my: 2 }} />
        {children}
      </CardContent>
    </Card>
  );
}
