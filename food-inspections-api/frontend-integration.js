// FRONTEND INTEGRATION EXAMPLE
// How to connect your frontend table to the API

// Base API URL
const API_BASE_URL = 'http://localhost:3000';

// ====================================
// MAIN FUNCTION: Fetch and Display Data
// ====================================

async function loadFacilitiesData(searchQuery = '', page = 1, pageSize = 25) {
  try {
    // Build the API URL with query parameters
    const params = new URLSearchParams({
      limit: pageSize,
      offset: (page - 1) * pageSize
    });
    
    // Add search query if provided
    if (searchQuery) {
      params.append('search', searchQuery);
    }
    
    const url = `${API_BASE_URL}/api/facilities/with-latest-inspection?${params}`;
    
    console.log('Fetching data from:', url);
    
    // Make the API request
    const response = await fetch(url);
    const result = await response.json();
    
    if (result.success) {
      console.log('Data received:', result.data);
      return result.data;
    } else {
      console.error('API Error:', result.error);
      return [];
    }
  } catch (error) {
    console.error('Network Error:', error);
    return [];
  }
}

// ====================================
// EXAMPLE: Populate Your Table
// ====================================

async function populateTable() {
  const data = await loadFacilitiesData();
  
  // Example: Log the data
  console.log('Facilities:', data);
  
  // Each row will have this structure:
  data.forEach(facility => {
    console.log({
      license_number: facility.license_number,
      dba_name: facility.dba_name,
      type: facility.type,
      address: facility.address,
      risk: facility.risk,
      latest_result: facility.latest_result
    });
  });
  
  // TODO: Add your table rendering code here
  // For example, if you're using React, Angular, Vue, etc.
}

// ====================================
// EXAMPLE: Search Functionality
// ====================================

function setupSearch() {
  const searchInput = document.querySelector('input[placeholder*="Search"]');
  
  if (searchInput) {
    // Debounce search to avoid too many API calls
    let searchTimeout;
    
    searchInput.addEventListener('input', (e) => {
      clearTimeout(searchTimeout);
      
      searchTimeout = setTimeout(async () => {
        const searchTerm = e.target.value;
        const data = await loadFacilitiesData(searchTerm);
        
        // Update your table with the filtered data
        console.log('Search results:', data);
        // TODO: Update table UI here
      }, 500); // Wait 500ms after user stops typing
    });
  }
}

// ====================================
// REACT EXAMPLE
// ====================================

/*
import React, { useState, useEffect } from 'react';

function FacilitiesTable() {
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  useEffect(() => {
    loadData();
  }, [searchQuery]);
  
  async function loadData() {
    setLoading(true);
    const data = await loadFacilitiesData(searchQuery);
    setFacilities(data);
    setLoading(false);
  }
  
  return (
    <div>
      <input
        type="text"
        placeholder="Search name/address..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      
      <table>
        <thead>
          <tr>
            <th>License #</th>
            <th>DBA</th>
            <th>Type</th>
            <th>Address</th>
            <th>Risk</th>
            <th>Latest Result</th>
          </tr>
        </thead>
        <tbody>
          {facilities.map(facility => (
            <tr key={facility.license_number}>
              <td>{facility.license_number}</td>
              <td>{facility.dba_name}</td>
              <td>{facility.type}</td>
              <td>{facility.address}</td>
              <td>{facility.risk}</td>
              <td>{facility.latest_result}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
*/

// ====================================
// VANILLA JS EXAMPLE
// ====================================

/*
async function renderTable() {
  const tableBody = document.querySelector('tbody');
  const data = await loadFacilitiesData();
  
  tableBody.innerHTML = '';
  
  if (data.length === 0) {
    tableBody.innerHTML = '<tr><td colspan="6">No rows</td></tr>';
    return;
  }
  
  data.forEach(facility => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${facility.license_number || ''}</td>
      <td>${facility.dba_name || ''}</td>
      <td>${facility.type || ''}</td>
      <td>${facility.address || ''}, ${facility.city || ''}</td>
      <td>${facility.risk || ''}</td>
      <td>${facility.latest_result || ''}</td>
    `;
    tableBody.appendChild(row);
  });
}

// Call this when page loads
document.addEventListener('DOMContentLoaded', renderTable);
*/

// ====================================
// FILTERING EXAMPLES
// ====================================

// Filter by city
async function loadChicagoFacilities() {
  const params = new URLSearchParams({
    city: 'Chicago',
    limit: 100
  });
  
  const response = await fetch(`${API_BASE_URL}/api/facilities/with-latest-inspection?${params}`);
  const result = await response.json();
  return result.data;
}

// Filter by risk level
async function loadHighRiskFacilities() {
  const params = new URLSearchParams({
    risk: 'Risk 1 (High)',
    limit: 100
  });
  
  const response = await fetch(`${API_BASE_URL}/api/facilities/with-latest-inspection?${params}`);
  const result = await response.json();
  return result.data;
}

// Filter by results
async function loadFailedInspections() {
  const params = new URLSearchParams({
    results: 'Fail',
    limit: 100
  });
  
  const response = await fetch(`${API_BASE_URL}/api/facilities/with-latest-inspection?${params}`);
  const result = await response.json();
  return result.data;
}

// ====================================
// PAGINATION EXAMPLE
// ====================================

async function loadPage(pageNumber, pageSize = 25) {
  const data = await loadFacilitiesData('', pageNumber, pageSize);
  
  // Update your table with the data
  console.log(`Page ${pageNumber}:`, data);
  
  return data;
}

// Example: Load page 2 with 25 items per page
// loadPage(2, 25);

// ====================================
// EXPORT FOR USE IN OTHER FILES
// ====================================

// If using modules:
// export { loadFacilitiesData, loadChicagoFacilities, loadHighRiskFacilities };
