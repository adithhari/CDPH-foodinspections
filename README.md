# Chicago Food Inspections Dashboard

A full-stack application for viewing, searching, and analyzing Chicago Department of Public Health (CDPH) food inspection data. Built with React + TypeScript frontend and Node.js + Express backend.

## 📋 Project Overview

This project provides a comprehensive platform for:
- **Search & Browse**: Find facilities by name, license, or location
- **View Inspections**: Access detailed inspection records with violation data
- **Analytics Dashboard**: Visualize trends, risk distribution, and facility data
- **Interactive Maps**: Explore facility locations and inspection results geographically
- **Data Management**: Create, edit, and delete facility records (admin functionality)

## 🏗️ Architecture

```
├── food-inspections-api/        # Backend API (Node.js + Express)
│   ├── config/                  # Database configuration
│   ├── routes/                  # API endpoints
│   │   ├── facilities.js        # Facility CRUD & search
│   │   ├── inspections.js       # Inspection data
│   │   ├── analytics.js         # Dashboard & visualization data
│   │   └── violations.js        # Violation records
│   ├── server.js                # Express server
│   └── package.json
│
└── frontend/                    # Frontend Application (React + TypeScript)
    ├── src/
    │   ├── api/                 # API client & endpoints
    │   ├── components/          # Reusable React components
    │   ├── features/            # Feature pages
    │   │   ├── dashboard/       # Analytics dashboard
    │   │   ├── facilities/      # Facility management
    │   │   ├── inspections/     # Inspection viewer
    │   │   ├── search/          # Facility search
    │   │   ├── violations/      # Violation history
    │   │   └── visualizations/  # Data visualizations
    │   ├── charts/              # Chart components
    │   ├── theme/               # Material-UI theming
    │   └── main.tsx             # Entry point
    ├── package.json
    └── vite.config.ts
```

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+ (LTS)
- **npm** or **yarn**
- **PostgreSQL** 16+ (with food inspections data loaded)

### Environment Setup

1. **Backend Setup** (`food-inspections-api/.env`)
```bash
DB_USER=postgres
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432
DB_NAME=food_inspections
PORT=3000
NODE_ENV=development
```

2. **Frontend Setup** (uses localhost:3000 by default)

### Installation & Running

**Backend:**
```bash
cd food-inspections-api
npm install
npm run dev
# Server starts at http://localhost:3000
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
# Application starts at http://localhost:5173
```

## 📚 API Endpoints

### Facilities
- `GET /api/facilities/with-latest-inspection` - Get facilities with latest inspection
  - Query params: `search`, `city`, `risk`, `results`, `limit`, `offset`
- `GET /api/facilities/search/name?q=query` - Search by name
- `GET /api/facilities/search/license?license=XXX` - Search by license
- `POST /api/facilities` - Create facility
- `PUT /api/facilities/:license_number` - Update facility
- `DELETE /api/facilities/:license_number` - Delete facility

### Inspections
- `GET /api/inspections` - Get inspections with filters
  - Query params: `from`, `to`, `risk`, `result`
- `GET /api/inspections/:inspection_id` - Get inspection details

### Analytics & Visualizations
- `GET /api/analytics` - Dashboard data (trends, risk distribution, results)
- `GET /api/analytics/map-data` - Facility locations for mapping
- `GET /api/analytics/risk-by-facility-type` - Risk distribution by type
- `GET /api/analytics/inspections-by-zip` - Inspection counts by ZIP code
- `GET /api/analytics/stats` - Overall statistics summary

### Violations
- `GET /api/violations?license_number=XXX` - Violation history
- `GET /api/violations/types` - Common violation types

## 🎨 Features

### Dashboard
- **Pass Rate Trend**: 12-month inspection pass rate line chart
- **Inspection Volume**: Monthly pass/fail inspection counts
- **Risk Distribution**: Facilities by risk level (doughnut chart)
- **Results Breakdown**: Inspection outcomes distribution

### Facility Map
- Interactive Plotly mapbox visualization
- 5,000+ facility locations with latest inspection data
- Color-coded by inspection result (Green=Pass, Red=Fail, Orange=Conditional)
- Search functionality to filter facilities

### Analytics
- **Risk by Facility Type**: Grouped bar chart of top 15 facility types
- **Inspections by ZIP Code**: Top 30 ZIP codes with color-scale quintiles
- Responsive grid layout with tabbed navigation

### Facility Search
- Professional DataGrid with 50-record pagination
- Search by name or license number
- Edit and delete facility capabilities
- Filter by city, risk level, and inspection result

### Inspections
- Date range filtering
- Risk level and result filtering
- Detailed violation data
- Results breakdown visualization

## 💾 Database Schema

### Core Tables (Gold Schema)
- **facility**: Establishment information
- **facility_location**: Geographic and address details
- **inspection**: Individual inspection records
- **inspection_outcome**: Results, risk levels, and violations

## 🔧 Tech Stack

### Backend
- **Express.js**: REST API framework
- **PostgreSQL**: Relational database
- **pg**: PostgreSQL driver with connection pooling
- **Node.js**: JavaScript runtime

### Frontend
- **React 18**: UI framework with TypeScript
- **Vite**: Build tool and dev server
- **Material-UI (MUI)**: Component library and theming
- **Chart.js**: Dashboard charts (line, bar, doughnut)
- **Plotly.js**: Interactive visualizations (maps, bar charts)
- **React Query**: Data fetching and caching
- **React Router**: Navigation and routing
- **Leaflet**: Map library integration

## 📊 Data Statistics

- **Total Facilities**: 47,494
- **Total Inspections**: 500,000+
- **Data Range**: 2015 - Present
- **Cities Covered**: 156+
- **Risk Levels**: High, Medium, Low, Not Mentioned

## 🔐 Security

- ✅ Parameterized SQL queries (SQL injection prevention)
- ✅ Input validation and sanitization
- ✅ Environment variable management
- ✅ CORS configuration
- ✅ Error handling with safe error messages

## 📈 Performance Features

- Database indexing on frequently queried columns
- Connection pooling for efficient database access
- Pagination for large result sets
- Responsive design for all viewport sizes
- Lazy loading of visualization components

## 🚢 Deployment

### Production Checklist
- [ ] Set `NODE_ENV=production`
- [ ] Configure PostgreSQL backups
- [ ] Enable SSL/TLS connections
- [ ] Set up environment variables securely
- [ ] Configure CORS for production domain
- [ ] Enable rate limiting
- [ ] Set up monitoring and logging

### Recommended Platforms
- **Backend**: Heroku, Railway, Render, AWS EC2
- **Frontend**: Vercel, Netlify, AWS S3 + CloudFront
- **Database**: AWS RDS, Heroku Postgres, Digital Ocean

## 📖 Documentation

- [Backend Documentation](./food-inspections-api/BACKEND-DOCUMENTATION.md) - API reference, database schema, query patterns
- [Frontend Integration Guide](./food-inspections-api/FRONTEND-INTEGRATION-GUIDE.md) - How to integrate with the API
- [Quickstart Guide](./food-inspections-api/QUICKSTART.md) - Quick setup instructions

## 🐛 Troubleshooting

### Backend Issues
**Port already in use:**
```bash
lsof -i :3000
kill -9 <PID>
```

**Database connection error:**
- Verify PostgreSQL is running
- Check `.env` database credentials
- Ensure database exists: `createdb food_inspections`

### Frontend Issues
**Port already in use:**
```bash
npm run dev -- --port 5174
```

**CORS errors:**
- Ensure backend is running on port 3000
- Check CORS configuration in `server.js`

## 🤝 Contributing

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make changes and commit: `git commit -m "Add feature description"`
3. Push to GitHub: `git push origin feature/your-feature`
4. Open a Pull Request on GitHub

## 📝 Git Workflow

```bash
# Clone repository
git clone https://github.com/adithhari/CDPH-foodinspections.git

# Create feature branch
git checkout -b feature/new-feature

# Make changes
git add .
git commit -m "Descriptive commit message"

# Push to GitHub
git push origin feature/new-feature

# Create Pull Request on GitHub UI
```

## 📄 License

This project is part of the CDPH Food Inspections analysis. Data sourced from Chicago Department of Public Health.

## 🙋 Support

For issues, questions, or suggestions:
1. Check existing [GitHub Issues](https://github.com/adithhari/CDPH-foodinspections/issues)
2. Create a new issue with detailed description
3. Include error messages and steps to reproduce

## 🎯 Future Enhancements

- [ ] Export data to CSV/Excel
- [ ] Advanced filtering with saved searches
- [ ] Inspection history timeline
- [ ] Violation trend analysis
- [ ] Facility comparison tool
- [ ] Mobile-responsive optimizations
- [ ] Dark mode improvements
- [ ] Multi-language support
- [ ] Real-time data updates
- [ ] Authentication & user roles

## 📊 Project Statistics

- **Lines of Code**: 7,000+
- **API Endpoints**: 15+
- **React Components**: 30+
- **Database Tables**: 4
- **Test Coverage**: In Progress

---

**Last Updated**: December 2025

**Repository**: https://github.com/adithhari/CDPH-foodinspections

**Authors*: Adith <adithharinarayanan@github.com>, Srushti <srushti-s@github.com>, Humaid <humaidilyas@github.com>
