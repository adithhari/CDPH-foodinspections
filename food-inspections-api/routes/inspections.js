const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// GET all inspections with details
router.get('/', async (req, res) => {
  try {
    const { 
      results, 
      risk, 
      inspection_type,
      start_date,
      end_date,
      limit = 100, 
      offset = 0 
    } = req.query;
    
    let query = `
      SELECT 
        i.inspection_id,
        i.license_number,
        i.inspection_date,
        f.dba_name,
        f.facility_type,
        io.risk,
        io.inspection_type,
        io.results,
        fl.city,
        fl.state,
        fl.zip
      FROM gold.inspection i
      JOIN gold.facility f ON i.license_number = f.license_number
      JOIN gold.inspection_outcome io ON i.inspection_id = io.inspection_id
      LEFT JOIN gold.facility_location fl ON f.license_number = fl.license_number
      WHERE 1=1
    `;
    
    const params = [];
    let paramCount = 1;
    
    if (results) {
      query += ` AND io.results ILIKE $${paramCount}`;
      params.push(`%${results}%`);
      paramCount++;
    }
    
    if (risk) {
      query += ` AND io.risk ILIKE $${paramCount}`;
      params.push(`%${risk}%`);
      paramCount++;
    }
    
    if (inspection_type) {
      query += ` AND io.inspection_type ILIKE $${paramCount}`;
      params.push(`%${inspection_type}%`);
      paramCount++;
    }
    
    if (start_date) {
      query += ` AND i.inspection_date >= $${paramCount}`;
      params.push(start_date);
      paramCount++;
    }
    
    if (end_date) {
      query += ` AND i.inspection_date <= $${paramCount}`;
      params.push(end_date);
      paramCount++;
    }
    
    query += ` ORDER BY i.inspection_date DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(limit, offset);
    
    const result = await pool.query(query, params);
    
    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching inspections:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

// GET inspection by ID with full details
router.get('/:inspection_id', async (req, res) => {
  try {
    const { inspection_id } = req.params;
    
    const query = `
      SELECT 
        i.inspection_id,
        i.license_number,
        i.inspection_date,
        f.dba_name,
        f.facility_type,
        fl.address,
        fl.city,
        fl.state,
        fl.zip,
        fl.latitude,
        fl.longitude,
        io.risk,
        io.inspection_type,
        io.results,
        vn.violations
      FROM gold.inspection i
      JOIN gold.facility f ON i.license_number = f.license_number
      JOIN gold.inspection_outcome io ON i.inspection_id = io.inspection_id
      LEFT JOIN gold.facility_location fl ON f.license_number = fl.license_number
      LEFT JOIN gold.violation_narrative vn ON i.inspection_id = vn.inspection_id
      WHERE i.inspection_id = $1
    `;
    
    const result = await pool.query(query, [inspection_id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Inspection not found'
      });
    }
    
    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching inspection:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

// GET inspections with failures
router.get('/results/failures', async (req, res) => {
  try {
    const { limit = 100, offset = 0 } = req.query;
    
    const query = `
      SELECT 
        i.inspection_id,
        i.inspection_date,
        f.dba_name,
        f.facility_type,
        fl.city,
        fl.state,
        io.results,
        io.risk,
        vn.violations
      FROM gold.inspection i
      JOIN gold.facility f ON i.license_number = f.license_number
      JOIN gold.inspection_outcome io ON i.inspection_id = io.inspection_id
      LEFT JOIN gold.facility_location fl ON f.license_number = fl.license_number
      LEFT JOIN gold.violation_narrative vn ON i.inspection_id = vn.inspection_id
      WHERE io.results IN ('Fail', 'Pass w/ Conditions')
      ORDER BY i.inspection_date DESC
      LIMIT $1 OFFSET $2
    `;
    
    const result = await pool.query(query, [limit, offset]);
    
    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching failed inspections:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

// GET recent inspections
router.get('/recent/all', async (req, res) => {
  try {
    const { days = 30, limit = 100 } = req.query;
    
    const query = `
      SELECT 
        i.inspection_id,
        i.inspection_date,
        f.dba_name,
        f.facility_type,
        fl.city,
        fl.state,
        io.results,
        io.risk,
        io.inspection_type
      FROM gold.inspection i
      JOIN gold.facility f ON i.license_number = f.license_number
      JOIN gold.inspection_outcome io ON i.inspection_id = io.inspection_id
      LEFT JOIN gold.facility_location fl ON f.license_number = fl.license_number
      WHERE i.inspection_date >= CURRENT_DATE - INTERVAL '1 day' * $1
      ORDER BY i.inspection_date DESC
      LIMIT $2
    `;
    
    const result = await pool.query(query, [days, limit]);
    
    res.json({
      success: true,
      count: result.rows.length,
      days: parseInt(days),
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching recent inspections:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Search violations by keyword
router.get('/violations/search', async (req, res) => {
  try {
    const { q, limit = 50 } = req.query;
    
    if (!q) {
      return res.status(400).json({
        success: false,
        error: 'Search query (q) is required'
      });
    }
    
    const query = `
      SELECT 
        i.inspection_id,
        i.inspection_date,
        f.dba_name,
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
      WHERE vn.violations ILIKE $1
      ORDER BY i.inspection_date DESC
      LIMIT $2
    `;
    
    const result = await pool.query(query, [`%${q}%`, limit]);
    
    res.json({
      success: true,
      count: result.rows.length,
      keyword: q,
      data: result.rows
    });
  } catch (error) {
    console.error('Error searching violations:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

module.exports = router;
