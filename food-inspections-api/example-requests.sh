#!/bin/bash
# API Request Examples
# Run these commands to test your API and see the requests in the server logs

echo "🧪 Food Inspections API - Example Requests"
echo "=========================================="
echo ""
echo "Make sure your server is running first with: npm run dev"
echo ""

BASE_URL="http://localhost:3000"

# 1. Health Check
echo "1️⃣  Health Check"
curl -s "${BASE_URL}/" | jq '.'
echo ""
echo "---"
echo ""

# 2. Get Overall Statistics
echo "2️⃣  Get Overall Statistics"
curl -s "${BASE_URL}/api/analytics/stats" | jq '.'
echo ""
echo "---"
echo ""

# 3. Get Facilities in Chicago
echo "3️⃣  Get Facilities in Chicago (limit 3)"
curl -s "${BASE_URL}/api/facilities?city=Chicago&limit=3" | jq '.'
echo ""
echo "---"
echo ""

# 4. Search Facilities by Name
echo "4️⃣  Search Facilities (pizza)"
curl -s "${BASE_URL}/api/facilities/search/name?q=pizza&limit=3" | jq '.'
echo ""
echo "---"
echo ""

# 5. Get Recent Inspections
echo "5️⃣  Get Recent Inspections (last 30 days)"
curl -s "${BASE_URL}/api/inspections/recent/all?days=30&limit=3" | jq '.'
echo ""
echo "---"
echo ""

# 6. Get Failed Inspections
echo "6️⃣  Get Failed Inspections (limit 3)"
curl -s "${BASE_URL}/api/inspections/results/failures?limit=3" | jq '.'
echo ""
echo "---"
echo ""

# 7. Get Rodent Violations
echo "7️⃣  Get Rodent Violations (limit 3)"
curl -s "${BASE_URL}/api/analytics/violations/rodents?limit=3" | jq '.'
echo ""
echo "---"
echo ""

# 8. Get Zip Codes with Highest Fail Rates
echo "8️⃣  Get Zip Codes with Highest Fail Rates"
curl -s "${BASE_URL}/api/analytics/fail-rates/by-zip?limit=5" | jq '.'
echo ""
echo "---"
echo ""

# 9. Get Facilities with Most Complaints
echo "9️⃣  Get Facilities with Most Complaints"
curl -s "${BASE_URL}/api/analytics/complaints/top-facilities?months=12&limit=5" | jq '.'
echo ""
echo "---"
echo ""

# 10. Get Risk Distribution
echo "🔟 Get Risk Distribution"
curl -s "${BASE_URL}/api/analytics/risk/distribution" | jq '.'
echo ""
echo "---"
echo ""

echo "✅ All example requests completed!"
echo ""
echo "💡 Tips:"
echo "  - Watch your server terminal to see detailed request logs"
echo "  - Remove '| jq' if you don't have jq installed"
echo "  - Modify the parameters to test different queries"
