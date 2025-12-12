import React from "react";
import { useNavigate } from "react-router-dom";
import { 
  Box, 
  Typography, 
  Button, 
  Paper, 
  Container,
  Card,
  CardContent,
  Stack
} from "@mui/material";
import TableChartIcon from "@mui/icons-material/TableChart";
import BarChartIcon from "@mui/icons-material/BarChart";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import HealthAndSafetyIcon from "@mui/icons-material/HealthAndSafety";
import AssessmentIcon from "@mui/icons-material/Assessment";
import PublicIcon from "@mui/icons-material/Public";

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <Box sx={{ width: "100%", minHeight: "100vh", bgcolor: "background.default" }}>
      <Container maxWidth="xl" sx={{ py: 6 }}>
        {/* Hero Section */}
        <Paper 
          elevation={0}
          sx={{ 
            p: { xs: 4, md: 6 }, 
            borderRadius: 4,
            border: "1px solid",
            borderColor: "divider",
            textAlign: "center",
            mb: 6,
            background: (theme) =>
              theme.palette.mode === "dark"
                ? "linear-gradient(135deg, rgba(33, 150, 243, 0.1) 0%, rgba(33, 150, 243, 0.02) 100%)"
                : "linear-gradient(135deg, rgba(33, 150, 243, 0.05) 0%, rgba(255, 255, 255, 1) 100%)",
          }}
        >
          <RestaurantIcon sx={{ fontSize: 64, color: "primary.main", mb: 2 }} />
          <Typography variant="h3" gutterBottom sx={{ fontWeight: 800, mb: 2, fontSize: { xs: "2rem", md: "3rem" } }}>
            Chicago Department of Public Health
          </Typography>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: "primary.main", mb: 3, fontSize: { xs: "1.25rem", md: "1.5rem" } }}>
            Food Inspections Database
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8, maxWidth: 800, mx: "auto", mb: 4 }}>
            The Chicago Department of Public Health (CDPH) is committed to ensuring the safety and quality of food 
            establishments throughout the city. Our comprehensive inspection program monitors restaurants, grocery stores, 
            and other food facilities to protect public health and prevent foodborne illnesses.
          </Typography>
          
          {/* Action Buttons */}
          <Stack direction={{ xs: "column", sm: "row" }} spacing={3} justifyContent="center" sx={{ mt: 4 }}>
            <Button
              variant="contained"
              size="large"
              startIcon={<TableChartIcon />}
              onClick={() => navigate("/data")}
              sx={{
                py: 1.5,
                px: 4,
                borderRadius: 2,
                fontSize: "1.1rem",
                fontWeight: 600,
                textTransform: "none",
                boxShadow: 3,
                "&:hover": {
                  boxShadow: 6,
                  transform: "translateY(-2px)",
                },
                transition: "all 0.3s ease",
              }}
            >
              View Data
            </Button>
            <Button
              variant="contained"
              size="large"
              startIcon={<BarChartIcon />}
              onClick={() => navigate("/visualizations")}
              sx={{
                py: 1.5,
                px: 4,
                borderRadius: 2,
                fontSize: "1.1rem",
                fontWeight: 600,
                textTransform: "none",
                boxShadow: 3,
                bgcolor: "success.main",
                "&:hover": {
                  bgcolor: "success.dark",
                  boxShadow: 6,
                  transform: "translateY(-2px)",
                },
                transition: "all 0.3s ease",
              }}
            >
              View Visualizations
            </Button>
          </Stack>
        </Paper>

        {/* About CDPH Section */}
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, mb: 4 }}>
          About Our Inspection Program
        </Typography>
        
        {/* 2x2 Grid using Flexbox - FORCED 2 columns */}
        <Box 
          sx={{ 
            display: "flex",
            flexDirection: "row",
            flexWrap: "wrap",
            gap: 3,
            mb: 6
          }}
        >
          {/* Row 1 - Card 1 */}
          <Box sx={{ flex: { xs: "1 1 100%", sm: "1 1 calc(50% - 12px)" } }}>
            <InfoCard
              icon={<HealthAndSafetyIcon sx={{ fontSize: 40 }} />}
              title="Public Health Protection"
              description="CDPH conducts regular inspections of food establishments to ensure compliance with Chicago's Food Protection Ordinance and Illinois Department of Public Health regulations."
              color="#2196f3"
            />
          </Box>
          
          {/* Row 1 - Card 2 */}
          <Box sx={{ flex: { xs: "1 1 100%", sm: "1 1 calc(50% - 12px)" } }}>
            <InfoCard
              icon={<AssessmentIcon sx={{ fontSize: 40 }} />}
              title="Risk-Based Inspections"
              description="Facilities are inspected 1-2 times per year based on their risk level, type of food handling, and compliance history. High-risk establishments receive more frequent inspections."
              color="#4caf50"
            />
          </Box>
          
          {/* Row 2 - Card 3 */}
          <Box sx={{ flex: { xs: "1 1 100%", sm: "1 1 calc(50% - 12px)" } }}>
            <InfoCard
              icon={<RestaurantIcon sx={{ fontSize: 40 }} />}
              title="Comprehensive Coverage"
              description="Our database includes inspection records for restaurants, grocery stores, school cafeterias, day care centers, and other food service establishments across Chicago."
              color="#ff9800"
            />
          </Box>
          
          {/* Row 2 - Card 4 */}
          <Box sx={{ flex: { xs: "1 1 100%", sm: "1 1 calc(50% - 12px)" } }}>
            <InfoCard
              icon={<PublicIcon sx={{ fontSize: 40 }} />}
              title="Transparency & Access"
              description="All inspection data is made publicly available to help residents make informed decisions about where to dine and to encourage establishments to maintain high food safety standards."
              color="#9c27b0"
            />
          </Box>
        </Box>

        {/* Dataset Information */}
        <Paper 
          elevation={0}
          sx={{ 
            p: 4, 
            borderRadius: 3,
            border: "1px solid",
            borderColor: "divider",
            bgcolor: (theme) => theme.palette.mode === "dark" ? "grey.900" : "grey.50"
          }}
        >
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 700, mb: 3 }}>
            Dataset Information
          </Typography>
          <Box 
            sx={{ 
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              gap: 3,
              justifyContent: "space-around"
            }}
          >
            <Box sx={{ textAlign: "center", flex: 1 }}>
              <Typography variant="h3" sx={{ fontWeight: 700, color: "primary.main", mb: 1 }}>
                15,000+
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                FOOD ESTABLISHMENTS
              </Typography>
            </Box>
            <Box sx={{ textAlign: "center", flex: 1 }}>
              <Typography variant="h3" sx={{ fontWeight: 700, color: "success.main", mb: 1 }}>
                200,000+
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                INSPECTION RECORDS
              </Typography>
            </Box>
            <Box sx={{ textAlign: "center", flex: 1 }}>
              <Typography variant="h3" sx={{ fontWeight: 700, color: "info.main", mb: 1 }}>
                2010 - 2025
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                DATA COVERAGE
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}

// Info Card Component
interface InfoCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
}

function InfoCard({ icon, title, description, color }: InfoCardProps) {
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
            width: 72,
            height: 72,
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
