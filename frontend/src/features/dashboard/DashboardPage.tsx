import { useQuery } from "@tanstack/react-query";
import { 
  Grid, 
  Paper, 
  Typography, 
  CircularProgress, 
  Box, 
  Chip,
  Card,
  CardContent,
  Divider
} from "@mui/material";
import KpiCard from "../../components/common/KpiCard";
import { api } from "../../api/client";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import AssignmentIcon from "@mui/icons-material/Assignment";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import WarningIcon from "@mui/icons-material/Warning";
import SearchIcon from "@mui/icons-material/Search";
import BarChartIcon from "@mui/icons-material/BarChart";
import MapIcon from "@mui/icons-material/MapOutlined";
import FilterListIcon from "@mui/icons-material/FilterList";
import TimelineIcon from "@mui/icons-material/Timeline";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import AccessTimeIcon from "@mui/icons-material/AccessTime";

interface DashboardStats {
  total_facilities: number;
  recent_inspections: number;
  pass_rate: number;
  high_risk_count: number;
}

export default function DashboardPage() {
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const res = await api.get("/stats");
      return res.data as DashboardStats;
    },
  });

  const lastUpdated = new Date().toLocaleString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px" }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box>
      {/* Welcome Card - Full Width */}
      <Paper 
        elevation={0}
        sx={{ 
          p: 5, 
          borderRadius: 3,
          border: "1px solid",
          borderColor: "divider",
          textAlign: "center",
          mb: 4,
          background: (theme) =>
            theme.palette.mode === "dark"
              ? "linear-gradient(135deg, rgba(33, 150, 243, 0.08) 0%, rgba(33, 150, 243, 0.02) 100%)"
              : "linear-gradient(135deg, rgba(33, 150, 243, 0.03) 0%, rgba(255, 255, 255, 1) 100%)",
        }}
      >
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, mb: 2 }}>
          Welcome to Chicago Food Safety Inspections
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8, maxWidth: 900, mx: "auto" }}>
          Access comprehensive food establishment inspection data across Chicago since 2010. 
          This platform enables residents, officials, and restaurant owners to make data-driven 
          decisions about food safety and public health.
        </Typography>
      </Paper>

      {/* System Status Badge + Last Updated */}
      <Box sx={{ mb: 4, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
          <Chip
            icon={<FiberManualRecordIcon sx={{ fontSize: 12 }} />}
            label={error ? "Backend Disconnected" : "System Online"}
            color={error ? "error" : "success"}
            variant="outlined"
            sx={{ 
              fontWeight: 600,
              borderWidth: 2,
            }}
          />
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <AccessTimeIcon sx={{ fontSize: 18, color: "text.secondary" }} />
            <Typography variant="body2" color="text.secondary">
              Last Updated: {lastUpdated}
            </Typography>
          </Box>
        </Box>

        {/* Quick Stats - Inline with Status */}
        <Box sx={{ display: "flex", gap: 3 }}>
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ textTransform: "uppercase", fontWeight: 600, fontSize: "0.65rem" }}>
              Data Source
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              City of Chicago
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ textTransform: "uppercase", fontWeight: 600, fontSize: "0.65rem" }}>
              Coverage
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              2010 - Present
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ textTransform: "uppercase", fontWeight: 600, fontSize: "0.65rem" }}>
              Updates
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              Daily
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Statistics Cards - ALWAYS SHOW */}
      <Grid container spacing={3} sx={{ mb: 5 }}>
        <Grid item xs={12} sm={6} lg={3}>
          <KpiCard 
            title="Total Facilities" 
            value={stats?.total_facilities.toLocaleString() ?? "—"}
            icon={<RestaurantIcon />}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <KpiCard 
            title="Inspections (30d)" 
            value={stats?.recent_inspections.toLocaleString() ?? "—"}
            icon={<AssignmentIcon />}
            color="info"
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <KpiCard 
            title="Pass Rate (30d)" 
            value={stats ? `${stats.pass_rate.toFixed(1)}%` : "—"}
            icon={<CheckCircleIcon />}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <KpiCard 
            title="High-Risk Flags" 
            value={stats?.high_risk_count.toLocaleString() ?? "—"}
            icon={<WarningIcon />}
            color="error"
          />
        </Grid>
      </Grid>

      {/* Platform Features */}
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 700, mb: 3 }}>
        Platform Features
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={4}>
          <FeatureCard
            icon={<SearchIcon sx={{ fontSize: 32 }} />}
            title="Browse & Search"
            description="Search facilities by name, address, or license number"
            color="#2196f3"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <FeatureCard
            icon={<BarChartIcon sx={{ fontSize: 32 }} />}
            title="Analyze Trends"
            description="View violations and safety trends with visual charts"
            color="#4caf50"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <FeatureCard
            icon={<MapIcon sx={{ fontSize: 32 }} />}
            title="Interactive Maps"
            description="Explore facility locations on interactive maps"
            color="#ff9800"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <FeatureCard
            icon={<FilterListIcon sx={{ fontSize: 32 }} />}
            title="Advanced Filters"
            description="Filter by date ranges, risk levels, and results"
            color="#9c27b0"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <FeatureCard
            icon={<TimelineIcon sx={{ fontSize: 32 }} />}
            title="History Tracking"
            description="View detailed inspection history and outcomes"
            color="#00bcd4"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <FeatureCard
            icon={<TrendingUpIcon sx={{ fontSize: 32 }} />}
            title="Real-Time Data"
            description="Access up-to-date inspection information daily"
            color="#f44336"
          />
        </Grid>
      </Grid>
    </Box>
  );
}

// Feature Card Component
interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
}

function FeatureCard({ icon, title, description, color }: FeatureCardProps) {
  return (
    <Card
      elevation={0}
      sx={{
        height: "100%",
        borderRadius: 3,
        border: "1px solid",
        borderColor: "divider",
        transition: "all 0.3s ease",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: 3,
          borderColor: color,
        },
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box
          sx={{
            width: 64,
            height: 64,
            borderRadius: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: `${color}15`,
            color: color,
            mb: 2.5,
          }}
        >
          {icon}
        </Box>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 1.5 }}>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
          {description}
        </Typography>
      </CardContent>
    </Card>
  );
}
