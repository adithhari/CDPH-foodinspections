# 📊 Frontend Table API Integration Guide

## New Endpoint for Your Table View

I've created a **new API endpoint** specifically for your frontend table that returns facilities with their latest inspection results.

---

## 🔗 Endpoint Details

### **GET** `/api/facilities/with-latest-inspection`

Returns a list of facilities with their most recent inspection data - perfect for populating your table!

---

## 📝 Request Parameters

All parameters are optional and can be combined:

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `search` | string | Search in facility name or address | `?search=pizza` |
| `city` | string | Filter by city name | `?city=Chicago` |
| `risk` | string | Filter by risk level | `?risk=Risk 1 (High)` |
| `results` | string | Filter by inspection result | `?results=Fail` |
| `limit` | number | Number of results (default: 100) | `?limit=25` |
| `offset` | number | Skip records for pagination (default: 0) | `?offset=25` |

---

## 📤 Response Format

```json
{
  "success": true,
  "count": 25,
  "data": [
    {
      "license_number": "12345",
      "dba_name": "SUBWAY",
      "type": "Restaurant",
      "address": "123 MAIN ST",
      "city": "CHICAGO",
      "state": "IL",
      "zip": 60601,
      "risk": "Risk 1 (High)",
      "latest_result": "Pass",
      "latest_inspection_date": "2024-12-01"
    },
    ...
  ]
}
```

---

## 🚀 Usage Examples

### Basic Request - Get all facilities
```
GET http://localhost:3000/api/facilities/with-latest-inspection
```

### Search by name/address
```
GET http://localhost:3000/api/facilities/with-latest-inspection?search=pizza
```

### Filter by city
```
GET http://localhost:3000/api/facilities/with-latest-inspection?city=Chicago
```

### Filter by risk level
```
GET http://localhost:3000/api/facilities/with-latest-inspection?risk=Risk 1 (High)
```

### Filter by result
```
GET http://localhost:3000/api/facilities/with-latest-inspection?results=Fail
```

### Pagination (Page 2, 25 per page)
```
GET http://localhost:3000/api/facilities/with-latest-inspection?limit=25&offset=25
```

### Combined filters
```
GET http://localhost:3000/api/facilities/with-latest-inspection?city=Chicago&risk=Risk 1 (High)&limit=50
```

---

## 💻 Frontend Integration Code

### Using Fetch API (Vanilla JavaScript)

```javascript
async function loadTableData() {
  const response = await fetch('http://localhost:3000/api/facilities/with-latest-inspection?limit=25');
  const result = await response.json();
  
  if (result.success) {
    const facilities = result.data;
    
    // Populate your table
    facilities.forEach(facility => {
      console.log(facility.license_number, facility.dba_name, facility.latest_result);
    });
  }
}
```

### With Search Filter

```javascript
async function searchFacilities(searchTerm) {
  const params = new URLSearchParams({
    search: searchTerm,
    limit: 25
  });
  
  const response = await fetch(`http://localhost:3000/api/facilities/with-latest-inspection?${params}`);
  const result = await response.json();
  
  return result.data;
}

// Usage:
const results = await searchFacilities('pizza');
```

### With Pagination

```javascript
async function loadPage(pageNumber, pageSize = 25) {
  const offset = (pageNumber - 1) * pageSize;
  
  const params = new URLSearchParams({
    limit: pageSize,
    offset: offset
  });
  
  const response = await fetch(`http://localhost:3000/api/facilities/with-latest-inspection?${params}`);
  const result = await response.json();
  
  return result.data;
}

// Usage:
const page1 = await loadPage(1);  // First 25 records
const page2 = await loadPage(2);  // Next 25 records
```

---

## 🎨 React Example

```jsx
import React, { useState, useEffect } from 'react';

function FacilitiesTable() {
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  useEffect(() => {
    loadData();
  }, [searchQuery]);
  
  async function loadData() {
    setLoading(true);
    
    const params = new URLSearchParams({
      limit: 25
    });
    
    if (searchQuery) {
      params.append('search', searchQuery);
    }
    
    try {
      const response = await fetch(`http://localhost:3000/api/facilities/with-latest-inspection?${params}`);
      const result = await response.json();
      
      if (result.success) {
        setFacilities(result.data);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
    
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
      
      {loading ? (
        <p>Loading...</p>
      ) : (
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
      )}
    </div>
  );
}

export default FacilitiesTable;
```

---

## 🧪 Testing the Endpoint

### Using cURL

```bash
# Get first 10 records
curl "http://localhost:3000/api/facilities/with-latest-inspection?limit=10"

# Search for pizza places
curl "http://localhost:3000/api/facilities/with-latest-inspection?search=pizza"

# Get high-risk facilities
curl "http://localhost:3000/api/facilities/with-latest-inspection?risk=Risk%201%20(High)"

# Get failed inspections in Chicago
curl "http://localhost:3000/api/facilities/with-latest-inspection?city=Chicago&results=Fail"
```

### Using Postman or Thunder Client

1. Method: `GET`
2. URL: `http://localhost:3000/api/facilities/with-latest-inspection`
3. Add query parameters as needed
4. Send request

---

## 📦 Response Fields Mapping

Map these fields to your table columns:

| API Field | Your Table Column |
|-----------|-------------------|
| `license_number` | License # |
| `dba_name` | DBA |
| `type` | Type |
| `address` + `city` | Address |
| `risk` | Risk |
| `latest_result` | Latest Result |

---

## 🎯 Working Example

I've created a **complete working HTML page** (`table-example.html`) that demonstrates:

- ✅ Loading data from the API
- ✅ Search functionality
- ✅ Risk and result filters
- ✅ Pagination
- ✅ Styled table matching your design

**To use it:**

1. Make sure your API server is running: `npm run dev`
2. Open `table-example.html` in your browser
3. The table will automatically load data!

---

## 🔧 Troubleshooting

### CORS Errors

If you get CORS errors, the API already has CORS enabled. Make sure:
- Your API is running on `http://localhost:3000`
- You're accessing from `http://localhost` or `file://`

### No Data Returned

Check:
- ✅ API server is running
- ✅ Database has data
- ✅ Correct URL format
- ✅ Check server console for errors

### Network Errors

- Make sure the API server is running: `npm run dev`
- Check the correct port (default: 3000)
- Verify database connection in `.env`

---

## 📚 Additional Resources

- `frontend-integration.js` - More code examples
- `table-example.html` - Complete working example
- `api-tester.html` - Interactive API testing tool

---

**Need help?** Check the server console logs to see the actual requests being made!
