# 🚀 Quick Start Guide

## Setup Instructions

### 1. Navigate to the project folder
```bash
cd food-inspections-api
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure Database Connection

Edit the `.env` file and update your PostgreSQL credentials:

```env
PORT=3000
DB_USER=postgres
DB_HOST=localhost
DB_NAME=food_inspections
DB_PASSWORD=YOUR_PASSWORD_HERE  # ⚠️ UPDATE THIS!
DB_PORT=5432
NODE_ENV=development
```

### 4. Start the Server

**Development Mode** (with auto-reload):
```bash
npm run dev
```

**Production Mode**:
```bash
npm start
```

You should see:
```
╔════════════════════════════════════════════════════════════╗
║   🍔 Food Inspections API Server                          ║
║   Status: Running                                          ║
║   Port: 3000                                               ║
╚════════════════════════════════════════════════════════════╝
```

### 5. Test the API

Open your browser and go to:
```
http://localhost:3000
```

Or use curl:
```bash
curl http://localhost:3000/api/analytics/stats
```

Or run the test script:
```bash
node test-api.js
```

## 📌 Key Endpoints

- **Health Check**: `GET http://localhost:3000/`
- **All Facilities**: `GET http://localhost:3000/api/facilities`
- **Statistics**: `GET http://localhost:3000/api/analytics/stats`
- **Search Facilities**: `GET http://localhost:3000/api/facilities/search/name?q=pizza`
- **Rodent Violations**: `GET http://localhost:3000/api/analytics/violations/rodents`

## 📚 Full Documentation

See `README.md` for complete API documentation with all endpoints and examples.

## ❓ Troubleshooting

**Database connection error?**
- Check your `.env` file has the correct credentials
- Make sure PostgreSQL is running
- Verify the database name is `food_inspections`

**Port already in use?**
- Change `PORT=3000` to another port in `.env` file

**Module not found?**
- Run `npm install` again

## 🎉 You're Ready!

Your REST API is now running and ready to serve food inspection data!
