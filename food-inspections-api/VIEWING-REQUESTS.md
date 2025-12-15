# 👀 How to See Requests - Visual Guide

## What You'll See When Making Requests

When you make API requests, the server console will show detailed information about each request and response.

## Setup

1. **Start your server in one terminal:**
   ```bash
   cd food-inspections-api
   npm run dev
   ```

2. **Keep that terminal visible** - this is where you'll see all the request logs!

## Testing Methods

### Method 1: HTML API Tester (EASIEST!)

1. **Open `api-tester.html` in your browser**
   - Just double-click the file
   - Or right-click → Open With → Browser

2. **Click any "Test Endpoint" button**

3. **Watch your server terminal!** You'll see:
   ```
   ════════════════════════════════════════════════════════════════════════════════
   📥 INCOMING REQUEST
   ────────────────────────────────────────────────────────────────────────────────
   ⏰ Time:        2024-01-15T10:30:45.123Z
   🔷 Method:      GET
   🔗 Path:        /api/analytics/stats
   🌐 Full URL:    http://localhost:3000/api/analytics/stats
   🖥️  IP:          ::1
   ════════════════════════════════════════════════════════════════════════════════

   📤 RESPONSE for GET /api/analytics/stats
   ✅ Status:      200
   ════════════════════════════════════════════════════════════════════════════════
   ```

4. **The browser will also show the response data!**

### Method 2: Command Line (Terminal)

Open a **second terminal** and run:

```bash
cd food-inspections-api
./example-requests.sh
```

**You'll see:**
- JSON responses in your current terminal
- Detailed request logs in the **server terminal**

### Method 3: Manual Testing with cURL

In a **second terminal**, run individual commands:

```bash
# Get statistics
curl http://localhost:3000/api/analytics/stats

# Search for pizza places
curl "http://localhost:3000/api/facilities/search/name?q=pizza&limit=5"

# Get rodent violations
curl "http://localhost:3000/api/analytics/violations/rodents?limit=5"
```

**Server terminal shows each request!**

## What Information You'll See

For each request, the server logs:

✅ **Timestamp** - When the request was made
✅ **HTTP Method** - GET, POST, etc.
✅ **Path** - The endpoint being called
✅ **Full URL** - Complete URL with query parameters
✅ **Query Parameters** - All URL parameters (if any)
✅ **IP Address** - Where the request came from
✅ **Response Status** - 200 (success), 404 (not found), etc.

## Example: What a Request Looks Like

**You make this request:**
```bash
curl "http://localhost:3000/api/facilities?city=Chicago&limit=3"
```

**Server console shows:**
```
════════════════════════════════════════════════════════════════════════════════
📥 INCOMING REQUEST
────────────────────────────────────────────────────────────────────────────────
⏰ Time:        2024-12-09T15:45:30.123Z
🔷 Method:      GET
🔗 Path:        /api/facilities
🌐 Full URL:    http://localhost:3000/api/facilities?city=Chicago&limit=3
❓ Query Params: { city: 'Chicago', limit: '3' }
🖥️  IP:          ::1
════════════════════════════════════════════════════════════════════════════════

📤 RESPONSE for GET /api/facilities
✅ Status:      200
════════════════════════════════════════════════════════════════════════════════
```

## Tips

💡 **Split your screen:** Have the server terminal on one side and your browser/test terminal on the other

💡 **Use the HTML tester:** It's the easiest way to test and see immediate results

💡 **Color coding:** 
   - 📥 Blue = Incoming request
   - 📤 Green = Response sent
   - ❌ Red = Error

💡 **Try different queries:** Modify the parameters to see how the logging works with different requests

## Troubleshooting

**Not seeing logs?**
- Make sure the server is running with `npm run dev`
- Check you're looking at the correct terminal window
- Verify the request URL is correct

**Getting errors?**
- Check your `.env` database configuration
- Make sure PostgreSQL is running
- Verify the database has data

**CORS errors in browser?**
- Make sure the server is running on localhost:3000
- The API has CORS enabled by default

Enjoy testing your API! 🚀
