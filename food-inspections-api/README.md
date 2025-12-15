# Food Inspections REST API

A comprehensive REST API for querying food inspection data with a medallion architecture (Bronze → Silver → Gold layers).

## 🚀 Features

- **Facility Management**: Search and retrieve facility information
- **Inspection Records**: Access detailed inspection data with filters
- **Analytics**: Get statistics, trends, and insights
- **Violation Search**: Find specific violations (e.g., rodent issues)
- **Performance Metrics**: Fail rates, complaint analysis, and more

## 📋 Prerequisites

- Node.js (v14 or higher)
- PostgreSQL database with gold schema
- npm or yarn

## 🛠️ Installation

1. **Clone/Download the project**

2. **Install dependencies**
```bash
cd food-inspections-api
npm install
```

3. **Configure environment variables**

Edit the `.env` file with your database credentials:
```env
PORT=3000
DB_USER=postgres
DB_HOST=localhost
DB_NAME=food_inspections
DB_PASSWORD=your_password_here
DB_PORT=5432
NODE_ENV=development
```

4. **Start the server**

Development mode (with auto-reload):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

## 📚 API Endpoints

### Health Check
- `GET /` - API information and available endpoints

### Facilities

#### Get All Facilities
```
GET /api/facilities
```
Query Parameters:
- `city` (optional) - Filter by city name
- `state` (optional) - Filter by state code
- `zip` (optional) - Filter by zip code
- `facility_type` (optional) - Filter by facility type
- `limit` (optional, default: 100) - Number of results
- `offset` (optional, default: 0) - Pagination offset

Example:
```bash
curl "http://localhost:3000/api/facilities?city=Chicago&limit=10"
```

#### Get Facility by License Number
```
GET /api/facilities/:license_number
```

Example:
```bash
curl "http://localhost:3000/api/facilities/12345"
```

#### Get Facility Inspection History
```
GET /api/facilities/:license_number/inspections
```

#### Get Facilities by City
```
GET /api/facilities/city/:city
```

#### Search Facilities by Name
```
GET /api/facilities/search/name?q=<search_term>
```

### Inspections

#### Get All Inspections
```
GET /api/inspections
```
Query Parameters:
- `results` (optional) - Filter by results (Pass, Fail, etc.)
- `risk` (optional) - Filter by risk level
- `inspection_type` (optional) - Filter by inspection type
- `start_date` (optional) - Filter from date (YYYY-MM-DD)
- `end_date` (optional) - Filter to date (YYYY-MM-DD)
- `limit` (optional, default: 100)
- `offset` (optional, default: 0)

Example:
```bash
curl "http://localhost:3000/api/inspections?results=Fail&limit=20"
```

#### Get Inspection by ID
```
GET /api/inspections/:inspection_id
```

#### Get Failed Inspections
```
GET /api/inspections/results/failures
```

#### Get Recent Inspections
```
GET /api/inspections/recent/all?days=30
```

#### Search Violations
```
GET /api/inspections/violations/search?q=<keyword>
```

Example (search for rodent violations):
```bash
curl "http://localhost:3000/api/inspections/violations/search?q=rodent"
```

### Analytics

#### Get Overall Statistics
```
GET /api/analytics/stats
```

Returns:
- Total facilities
- Total inspections
- Failed/passed inspection counts
- Cities covered
- Date ranges

#### Get Zip Codes with Highest Fail Rates
```
GET /api/analytics/fail-rates/by-zip
```
Query Parameters:
- `min_inspections` (optional, default: 50) - Minimum inspections required
- `limit` (optional, default: 20)

#### Get Facilities with Most Complaints
```
GET /api/analytics/complaints/top-facilities
```
Query Parameters:
- `months` (optional, default: 12) - Time range in months
- `limit` (optional, default: 10)

#### Get Rodent Violations
```
GET /api/analytics/violations/rodents
```

#### Get Risk Distribution
```
GET /api/analytics/risk/distribution
```

#### Get Facility Type Distribution
```
GET /api/analytics/facility-types/distribution
```

#### Get Inspection Trends
```
GET /api/analytics/trends/inspections?months=12
```

#### Get Top Cities by Inspection Volume
```
GET /api/analytics/cities/top-inspections?limit=20
```

## 📊 Response Format

All API responses follow this structure:

**Success Response:**
```json
{
  "success": true,
  "count": 10,
  "data": [...]
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Error message",
  "message": "Detailed error description"
}
```

## 🔧 Testing the API

You have **3 ways** to test your API:

### 1. Interactive HTML Tester (Easiest!)

Open `api-tester.html` in your browser:
```bash
open api-tester.html   # Mac
# or just double-click the file
```

This provides a beautiful UI to test endpoints and see responses in real-time!

### 2. Bash Script with Examples

Run the example requests script:
```bash
chmod +x example-requests.sh
./example-requests.sh
```

This will run multiple test requests and show the responses.

### 3. Manual cURL Commands

Get all facilities in Chicago:
```bash
curl "http://localhost:3000/api/facilities?city=Chicago"
```

Get recent failed inspections:
```bash
curl "http://localhost:3000/api/inspections/results/failures?limit=10"
```

Get overall statistics:
```bash
curl "http://localhost:3000/api/analytics/stats"
```

Search for facilities with "pizza":
```bash
curl "http://localhost:3000/api/facilities/search/name?q=pizza"
```

### Using JavaScript (fetch)

```javascript
// Get facilities
fetch('http://localhost:3000/api/facilities?city=Chicago')
  .then(res => res.json())
  .then(data => console.log(data));

// Get statistics
fetch('http://localhost:3000/api/analytics/stats')
  .then(res => res.json())
  .then(data => console.log(data));
```

## 👀 Viewing Requests in Real-Time

The server now includes **detailed request logging**! When you make any request, you'll see in the server console:

```
════════════════════════════════════════════════════════════════════════════════
📥 INCOMING REQUEST
────────────────────────────────────────────────────────────────────────────────
⏰ Time:        2024-01-15T10:30:45.123Z
🔷 Method:      GET
🔗 Path:        /api/facilities
🌐 Full URL:    http://localhost:3000/api/facilities?city=Chicago&limit=5
❓ Query Params: { city: 'Chicago', limit: '5' }
🖥️  IP:          ::1
════════════════════════════════════════════════════════════════════════════════

📤 RESPONSE for GET /api/facilities
✅ Status:      200
════════════════════════════════════════════════════════════════════════════════
```

## 🗂️ Project Structure

```
food-inspections-api/
├── config/
│   └── database.js          # PostgreSQL connection pool
├── routes/
│   ├── facilities.js        # Facility endpoints
│   ├── inspections.js       # Inspection endpoints
│   └── analytics.js         # Analytics endpoints
├── .env                     # Environment variables
├── .gitignore              # Git ignore rules
├── server.js               # Main application file
├── package.json            # Dependencies
├── api-tester.html         # Interactive API testing UI
├── example-requests.sh     # Bash script with example requests
├── test-api.js            # Node.js API test examples
├── QUICKSTART.md          # Quick setup guide
└── README.md              # This file
```

## 🛡️ Database Schema

The API works with the Gold layer of the medallion architecture:

- `gold.facility` - Facility information
- `gold.facility_location` - Location details
- `gold.inspection` - Inspection records
- `gold.inspection_outcome` - Inspection results
- `gold.violation_narrative` - Violation details

## 🚦 Status Codes

- `200` - Success
- `400` - Bad Request (missing required parameters)
- `404` - Resource Not Found
- `500` - Internal Server Error

## 📝 Development

Run in development mode with auto-reload:
```bash
npm run dev
```

## 🤝 Contributing

Feel free to submit issues and enhancement requests!

## 📄 License

ISC
