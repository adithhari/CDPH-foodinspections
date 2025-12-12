import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ColorModeProvider from "./theme/ColorModeContext";
import AppShell from "./components/AppShell/AppShell";
import HomePage from "./features/home/HomePage";
import FacilitiesPage from "./features/facilities/FacilitiesPage";
import SearchFacilitiesPage from "./features/search/SearchFacilitiesPage";
import VisualizationsPage from "./features/visualizations/VisualizationsPage";

export default function App() {
  return (
    <ColorModeProvider>
      <BrowserRouter>
        <AppShell>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/data" element={<FacilitiesPage />} />
            <Route path="/search" element={<SearchFacilitiesPage />} />
            <Route path="/visualizations" element={<VisualizationsPage />} />
          </Routes>
        </AppShell>
      </BrowserRouter>
    </ColorModeProvider>
  );
}
