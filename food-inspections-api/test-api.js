// API Test Examples
// Run this file with: node test-api.js
// Make sure your server is running first!

const BASE_URL = 'http://localhost:3000';

// Helper function to make requests
async function testEndpoint(name, url) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Testing: ${name}`);
  console.log(`URL: ${url}`);
  console.log('='.repeat(60));
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2).slice(0, 500) + '...');
    return data;
  } catch (error) {
    console.error('Error:', error.message);
  }
}

async function runTests() {
  console.log('🧪 Food Inspections API Tests\n');
  
  // 1. Health Check
  await testEndpoint('Health Check', `${BASE_URL}/`);
  
  // 2. Get overall statistics
  await testEndpoint('Overall Statistics', `${BASE_URL}/api/analytics/stats`);
  
  // 3. Get facilities in Chicago
  await testEndpoint('Facilities in Chicago', `${BASE_URL}/api/facilities?city=Chicago&limit=5`);
  
  // 4. Search facilities by name
  await testEndpoint('Search Facilities (Pizza)', `${BASE_URL}/api/facilities/search/name?q=pizza&limit=5`);
  
  // 5. Get recent inspections
  await testEndpoint('Recent Inspections (30 days)', `${BASE_URL}/api/inspections/recent/all?days=30&limit=5`);
  
  // 6. Get failed inspections
  await testEndpoint('Failed Inspections', `${BASE_URL}/api/inspections/results/failures?limit=5`);
  
  // 7. Search for rodent violations
  await testEndpoint('Rodent Violations', `${BASE_URL}/api/analytics/violations/rodents?limit=5`);
  
  // 8. Get zip codes with highest fail rates
  await testEndpoint('Highest Fail Rates by Zip', `${BASE_URL}/api/analytics/fail-rates/by-zip?limit=5`);
  
  // 9. Get facilities with most complaints
  await testEndpoint('Top Complaint Facilities', `${BASE_URL}/api/analytics/complaints/top-facilities?months=12&limit=5`);
  
  // 10. Get risk distribution
  await testEndpoint('Risk Distribution', `${BASE_URL}/api/analytics/risk/distribution`);
  
  // 11. Get facility type distribution
  await testEndpoint('Facility Type Distribution', `${BASE_URL}/api/analytics/facility-types/distribution`);
  
  // 12. Get inspection trends
  await testEndpoint('Inspection Trends', `${BASE_URL}/api/analytics/trends/inspections?months=6`);
  
  // 13. Get top cities
  await testEndpoint('Top Cities by Inspections', `${BASE_URL}/api/analytics/cities/top-inspections?limit=10`);
  
  console.log('\n✅ All tests completed!\n');
}

// Run all tests
runTests().catch(console.error);
