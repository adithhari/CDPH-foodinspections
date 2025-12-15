const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// GET visualization dashboard data (inspection trends, risk distribution, results breakdown)
router.get('/', async (req, res) => {
  try {
    // 1. Get inspection trends by month
    const trendsQuery = `
      SELECT 
        DATE_TRUNC('month', i.inspection_date)::date AS month,
        COUNT(*) FILTER (WHERE io.results = 'Pass') AS pass_count,
        COUNT(*) FILTER (WHERE io.results IN ('Fail', 'Pass w/ Conditions')) AS fail_count,
        COUNT(*) AS total_count,
        ROUND(100.0 * COUNT(*) FILTER (WHERE io.results = 'Pass') / COUNT(*), 1) AS pass_rate
      FROM gold.inspection i
      JOIN gold.inspection_outcome io ON io.inspection_id = i.inspection_id
      GROUP BY DATE_TRUNC('month', i.inspection_date)
      ORDER BY month DESC
      LIMIT 12
    `;

    // 2. Get risk distribution
    const riskQuery = `
      SELECT 
        o.risk,
        COUNT(DISTINCT i.license_number) AS count
      FROM gold.inspection i
      JOIN gold.inspection_outcome o ON o.inspection_id = i.inspection_id
      WHERE i.inspection_date = (
        SELECT MAX(i2.inspection_date)
        FROM gold.inspection i2
        WHERE i2.license_number = i.license_number
      )
      GROUP BY o.risk
      ORDER BY o.risk
    `;

    // 3. Get results breakdown
    const resultsQuery = `
      SELECT 
        o.results as result,
        COUNT(*) AS count
      FROM gold.inspection i
      JOIN gold.inspection_outcome o ON o.inspection_id = i.inspection_id
      GROUP BY o.results
      ORDER BY count DESC
    `;

    const [trendsResult, riskResult, resultsResult] = await Promise.all([
      pool.query(trendsQuery),
      pool.query(riskQuery),
      pool.query(resultsQuery)
    ]);

    res.json({
      success: true,
      inspection_trends: trendsResult.rows.reverse(),
      risk_distribution: riskResult.rows,
      result_breakdown: resultsResult.rows
    });
  } catch (error) {
    console.error('Error fetching visualization data:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

// GET overall statistics
router.get('/stats', async (req, res) => {
  try {
    const query = `
      SELECT 
        (SELECT COUNT(*) FROM gold.facility) as total_facilities,
        (SELECT COUNT(*) FROM gold.inspection) as total_inspections,
        (SELECT COUNT(*) FROM gold.inspection i
         JOIN gold.inspection_outcome io ON i.inspection_id = io.inspection_id
         WHERE io.results = 'Fail') as failed_inspections,
        (SELECT COUNT(*) FROM gold.inspection i
         JOIN gold.inspection_outcome io ON i.inspection_id = io.inspection_id
         WHERE io.results = 'Pass') as passed_inspections,
        (SELECT COUNT(DISTINCT city) FROM gold.facility_location) as cities_covered,
        (SELECT MAX(inspection_date) FROM gold.inspection) as latest_inspection_date,
        (SELECT MIN(inspection_date) FROM gold.inspection) as earliest_inspection_date
    `;
    
    const result = await pool.query(query);
    
    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

// GET zip codes with highest fail rates
router.get('/fail-rates/by-zip', async (req, res) => {
  try {
    const { min_inspections = 50, limit = 20 } = req.query;
    
    const query = `
      SELECT 
        fl.zip,
        fl.city,
        fl.state,
        COUNT(*) AS total_inspections,
        COUNT(*) FILTER (WHERE io.results IN ('Fail','Pass w/ Conditions')) AS failed_inspections,
        ROUND(100.0 * COUNT(*) FILTER (WHERE io.results IN ('Fail','Pass w/ Conditions')) / COUNT(*), 1) AS fail_rate_pct
      FROM gold.inspection i
      JOIN gold.inspection_outcome io ON io.inspection_id = i.inspection_id
      JOIN gold.facility_location fl ON fl.license_number = i.license_number
      GROUP BY fl.zip, fl.city, fl.state
      HAVING COUNT(*) >= $1
      ORDER BY fail_rate_pct DESC, total_inspections DESC
      LIMIT $2
    `;
    
    const result = await pool.query(query, [min_inspections, limit]);
    
    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching fail rates by zip:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

// GET facilities with most complaints
router.get('/complaints/top-facilities', async (req, res) => {
  try {
    const { months = 12, limit = 10 } = req.query;
    
    const query = `
      SELECT 
        f.license_number, 
        f.dba_name, 
        f.facility_type,
        fl.city, 
        fl.state,
        fl.address,
        COUNT(*) AS complaint_count,
        MAX(i.inspection_date) AS last_complaint_date
      FROM gold.inspection i
      JOIN gold.inspection_outcome io ON io.inspection_id = i.inspection_id
      JOIN gold.facility f ON f.license_number = i.license_number
      LEFT JOIN gold.facility_location fl ON fl.license_number = i.license_number
      WHERE io.inspection_type ILIKE '%complaint%'
        AND i.inspection_date >= CURRENT_DATE - INTERVAL '1 month' * $1
      GROUP BY f.license_number, f.dba_name, f.facility_type, fl.city, fl.state, fl.address
      ORDER BY complaint_count DESC, last_complaint_date DESC
      LIMIT $2
    `;
    
    const result = await pool.query(query, [months, limit]);
    
    res.json({
      success: true,
      count: result.rows.length,
      months: parseInt(months),
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching top complaint facilities:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

// GET rodent violations
router.get('/violations/rodents', async (req, res) => {
  try {
    const { limit = 100 } = req.query;
    
    const query = `
      SELECT 
        i.inspection_id,
        i.inspection_date, 
        f.dba_name,
        f.facility_type,
        fl.city, 
        fl.state,
        fl.address,
        io.results,
        vn.violations
      FROM gold.violation_narrative vn
      JOIN gold.inspection i ON i.inspection_id = vn.inspection_id
      JOIN gold.facility f ON f.license_number = i.license_number
      LEFT JOIN gold.facility_location fl ON fl.license_number = f.license_number
      JOIN gold.inspection_outcome io ON i.inspection_id = io.inspection_id
      WHERE vn.violations ILIKE '%rodent%'
      ORDER BY i.inspection_date DESC
      LIMIT $1
    `;
    
    const result = await pool.query(query, [limit]);
    
    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching rodent violations:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

// GET risk distribution
router.get('/risk/distribution', async (req, res) => {
  try {
    const query = `
      SELECT 
        io.risk,
        COUNT(*) as inspection_count,
        COUNT(*) FILTER (WHERE io.results = 'Fail') as failed_count,
        COUNT(*) FILTER (WHERE io.results = 'Pass') as passed_count,
        ROUND(100.0 * COUNT(*) FILTER (WHERE io.results = 'Fail') / COUNT(*), 1) as fail_rate_pct
      FROM gold.inspection_outcome io
      GROUP BY io.risk
      ORDER BY inspection_count DESC
    `;
    
    const result = await pool.query(query);
    
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching risk distribution:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

// GET facility type distribution
router.get('/facility-types/distribution', async (req, res) => {
  try {
    const query = `
      SELECT 
        f.facility_type,
        COUNT(DISTINCT f.license_number) as facility_count,
        COUNT(i.inspection_id) as total_inspections,
        ROUND(AVG(CASE WHEN io.results = 'Fail' THEN 1.0 ELSE 0.0 END) * 100, 1) as avg_fail_rate
      FROM gold.facility f
      LEFT JOIN gold.inspection i ON f.license_number = i.license_number
      LEFT JOIN gold.inspection_outcome io ON i.inspection_id = io.inspection_id
      GROUP BY f.facility_type
      ORDER BY facility_count DESC
      LIMIT 20
    `;
    
    const result = await pool.query(query);
    
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching facility type distribution:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

// GET inspection trends over time
router.get('/trends/inspections', async (req, res) => {
  try {
    const { months = 12 } = req.query;
    
    const query = `
      SELECT 
        DATE_TRUNC('month', i.inspection_date) as month,
        COUNT(*) as total_inspections,
        COUNT(*) FILTER (WHERE io.results = 'Pass') as passed,
        COUNT(*) FILTER (WHERE io.results = 'Fail') as failed,
        COUNT(*) FILTER (WHERE io.results = 'Pass w/ Conditions') as pass_with_conditions,
        ROUND(100.0 * COUNT(*) FILTER (WHERE io.results = 'Fail') / COUNT(*), 1) as fail_rate_pct
      FROM gold.inspection i
      JOIN gold.inspection_outcome io ON i.inspection_id = io.inspection_id
      WHERE i.inspection_date >= CURRENT_DATE - INTERVAL '1 month' * $1
      GROUP BY DATE_TRUNC('month', i.inspection_date)
      ORDER BY month DESC
    `;
    
    const result = await pool.query(query, [months]);
    
    res.json({
      success: true,
      months: parseInt(months),
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching inspection trends:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

// GET top cities by inspection volume
router.get('/cities/top-inspections', async (req, res) => {
  try {
    const { limit = 20 } = req.query;
    
    const query = `
      SELECT 
        fl.city,
        fl.state,
        COUNT(DISTINCT f.license_number) as facility_count,
        COUNT(i.inspection_id) as total_inspections,
        ROUND(100.0 * COUNT(*) FILTER (WHERE io.results = 'Fail') / COUNT(*), 1) as fail_rate_pct
      FROM gold.facility_location fl
      JOIN gold.facility f ON fl.license_number = f.license_number
      LEFT JOIN gold.inspection i ON f.license_number = i.license_number
      LEFT JOIN gold.inspection_outcome io ON i.inspection_id = io.inspection_id
      GROUP BY fl.city, fl.state
      HAVING COUNT(i.inspection_id) > 0
      ORDER BY total_inspections DESC
      LIMIT $1
    `;
    
    const result = await pool.query(query, [limit]);
    
    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching top cities:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

// GET map data - latest inspection outcome per facility
router.get('/map-data', async (req, res) => {
  try {
    const { search } = req.query;
    
    let query = `
      SELECT
        fl.license_number,
        f.dba_name,
        f.facility_type,
        fl.address,
        fl.city,
        fl.state,
        fl.zip,
        fl.latitude,
        fl.longitude,
        i.inspection_date,
        o.results,
        o.risk
      FROM gold.inspection i
      JOIN gold.inspection_outcome o
        ON o.inspection_id = i.inspection_id
      JOIN gold.facility_location fl
        ON fl.license_number = i.license_number
      JOIN gold.facility f
        ON f.license_number = i.license_number
      WHERE i.inspection_date = (
        SELECT MAX(i2.inspection_date)
        FROM gold.inspection i2
        WHERE i2.license_number = i.license_number
      )
    `;
    
    const params = [];
    if (search) {
      query += ` AND f.dba_name ILIKE $1`;
      params.push(`%${search}%`);
    }
    
    query += ` LIMIT 5000`;
    
    const result = await pool.query(query, params);
    
    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching map data:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

// GET risk distribution by facility type
router.get('/risk-by-facility-type', async (req, res) => {
  try {
    const query = `
      SELECT
        f.facility_type,
        o.risk,
        COUNT(*) AS inspection_count
      FROM gold.inspection i
      JOIN gold.inspection_outcome o
        ON o.inspection_id = i.inspection_id
      JOIN gold.facility f
        ON f.license_number = i.license_number
      WHERE f.facility_type IS NOT NULL AND f.facility_type != ''
      GROUP BY f.facility_type, o.risk
      ORDER BY inspection_count DESC, f.facility_type, o.risk
      LIMIT 1000
    `;
    
    const result = await pool.query(query);
    
    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching risk by facility type:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

// GET inspections by ZIP code
router.get('/inspections-by-zip', async (req, res) => {
  try {
    const query = `
      SELECT
        fl.zip::text AS zip,
        COUNT(*) AS inspection_count
      FROM gold.inspection i
      JOIN gold.facility_location fl
        ON fl.license_number = i.license_number
      WHERE fl.zip IS NOT NULL
      GROUP BY fl.zip
      ORDER BY inspection_count DESC
    `;
    
    const result = await pool.query(query);
    
    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching inspections by zip:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

module.exports = router;
