const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// CREATE a new facility
router.post('/', async (req, res) => {
  try {
    const { license_number, dba_name, facility_type, address, city, state, zip, risk } = req.body;
    
    // Validate required fields
    if (!license_number || !dba_name) {
      return res.status(400).json({
        success: false,
        error: 'License number and DBA name are required'
      });
    }
    
    // Check if facility already exists
    const checkQuery = `SELECT license_number FROM gold.facility WHERE license_number = $1`;
    const checkResult = await pool.query(checkQuery, [license_number]);
    
    if (checkResult.rows.length > 0) {
      return res.status(409).json({
        success: false,
        error: 'Facility with this license number already exists'
      });
    }
    
    // Insert into facility table
    const facilityQuery = `
      INSERT INTO gold.facility (license_number, dba_name, facility_type)
      VALUES ($1, $2, $3)
      RETURNING license_number, dba_name, facility_type
    `;
    
    const facilityResult = await pool.query(facilityQuery, [license_number, dba_name, facility_type]);
    
    // Insert into facility_location table if address is provided
    if (address) {
      const locationQuery = `
        INSERT INTO gold.facility_location (license_number, address, city, state, zip)
        VALUES ($1, $2, $3, $4, $5)
      `;
      
      await pool.query(locationQuery, [license_number, address, city, state, zip]);
    }
    
    // Note: Inspections and outcomes are not automatically created when adding a new facility.
    // They should be created through separate inspection submission workflow.
    
    res.json({
      success: true,
      message: 'Facility created successfully',
      data: facilityResult.rows[0]
    });
  } catch (error) {
    console.error('Error creating facility:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

// GET all facilities with their locations
router.get('/', async (req, res) => {
  try {
    const { city, state, zip, facility_type, limit = 100, offset = 0 } = req.query;
    
    let query = `
      SELECT 
        f.license_number,
        f.dba_name,
        f.facility_type,
        fl.address,
        fl.city,
        fl.state,
        fl.zip,
        fl.latitude,
        fl.longitude,
        fl.location
      FROM gold.facility f
      LEFT JOIN gold.facility_location fl ON f.license_number = fl.license_number
      WHERE 1=1
    `;
    
    const params = [];
    let paramCount = 1;
    
    if (city) {
      query += ` AND fl.city ILIKE $${paramCount}`;
      params.push(`%${city}%`);
      paramCount++;
    }
    
    if (state) {
      query += ` AND fl.state = $${paramCount}`;
      params.push(state);
      paramCount++;
    }
    
    if (zip) {
      query += ` AND fl.zip = $${paramCount}`;
      params.push(zip);
      paramCount++;
    }
    
    if (facility_type) {
      query += ` AND f.facility_type ILIKE $${paramCount}`;
      params.push(`%${facility_type}%`);
      paramCount++;
    }
    
    query += ` ORDER BY f.dba_name LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(limit, offset);
    
    const result = await pool.query(query, params);
    
    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching facilities:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

// GET facilities with latest inspection results (for frontend table view)
router.get('/with-latest-inspection', async (req, res) => {
  try {
    const { 
      search, 
      city, 
      risk, 
      results,
      limit = 100, 
      offset = 0 
    } = req.query;
    
    let whereClause = `1=1`;
    const params = [];
    let paramCount = 1;
    
    // Search filter (searches in DBA name and address)
    if (search) {
      whereClause += ` AND (f.dba_name ILIKE $${paramCount} OR fl.address ILIKE $${paramCount})`;
      params.push(`%${search}%`);
      paramCount++;
    }
    
    // City filter
    if (city) {
      whereClause += ` AND fl.city ILIKE $${paramCount}`;
      params.push(`%${city}%`);
      paramCount++;
    }
    
    // Risk filter
    if (risk) {
      whereClause += ` AND io.risk ILIKE $${paramCount}`;
      params.push(`%${risk}%`);
      paramCount++;
    }
    
    // Results filter
    if (results) {
      whereClause += ` AND io.results ILIKE $${paramCount}`;
      params.push(`%${results}%`);
      paramCount++;
    }
    
    // Get total count
    const countQuery = `
      SELECT COUNT(DISTINCT f.license_number) as total
      FROM gold.facility f
      LEFT JOIN gold.facility_location fl ON f.license_number = fl.license_number
      LEFT JOIN gold.inspection i ON f.license_number = i.license_number
      LEFT JOIN gold.inspection_outcome io ON i.inspection_id = io.inspection_id
      WHERE ${whereClause}
    `;
    const countResult = await pool.query(countQuery, params);
    const total = parseInt(countResult.rows[0].total);
    
    // Get paginated data
    const dataQuery = `
      SELECT DISTINCT ON (f.license_number)
        f.license_number,
        f.dba_name,
        f.facility_type as type,
        fl.address,
        fl.city,
        fl.state,
        fl.zip,
        io.risk,
        io.results as latest_result,
        i.inspection_date as latest_inspection_date
      FROM gold.facility f
      LEFT JOIN gold.facility_location fl ON f.license_number = fl.license_number
      LEFT JOIN gold.inspection i ON f.license_number = i.license_number
      LEFT JOIN gold.inspection_outcome io ON i.inspection_id = io.inspection_id
      WHERE ${whereClause}
      ORDER BY f.license_number, i.inspection_date DESC NULLS LAST
      LIMIT $${paramCount} OFFSET $${paramCount + 1}
    `;
    params.push(limit, offset);
    
    const result = await pool.query(dataQuery, params);
    
    res.json({
      success: true,
      count: result.rows.length,
      total: total,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching facilities with latest inspection:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Search facilities by name
router.get('/search/name', async (req, res) => {
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
        f.license_number,
        f.dba_name,
        f.facility_type,
        fl.city,
        fl.state,
        fl.address
      FROM gold.facility f
      LEFT JOIN gold.facility_location fl ON f.license_number = fl.license_number
      WHERE f.dba_name ILIKE $1
      ORDER BY f.dba_name
      LIMIT $2
    `;
    
    const result = await pool.query(query, [`%${q}%`, limit]);
    
    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });
  } catch (error) {
    console.error('Error searching facilities:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

// GET facility by license number with full details
router.get('/:license_number', async (req, res) => {
  try {
    const { license_number } = req.params;
    
    const query = `
      SELECT 
        f.license_number,
        f.dba_name,
        f.facility_type,
        fl.address,
        fl.city,
        fl.state,
        fl.zip,
        fl.latitude,
        fl.longitude,
        fl.location
      FROM gold.facility f
      LEFT JOIN gold.facility_location fl ON f.license_number = fl.license_number
      WHERE f.license_number = $1
    `;
    
    const result = await pool.query(query, [license_number]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Facility not found'
      });
    }
    
    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching facility:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

// UPDATE facility by license number
router.put('/:license_number', async (req, res) => {
  try {
    const { license_number } = req.params;
    const { dba_name, facility_type, address, city, state, zip, risk } = req.body;
    
    // Update facility table
    const facilityQuery = `
      UPDATE gold.facility
      SET dba_name = COALESCE($1, dba_name),
          facility_type = COALESCE($2, facility_type)
      WHERE license_number = $3
      RETURNING license_number, dba_name, facility_type
    `;
    
    const facilityResult = await pool.query(facilityQuery, [dba_name, facility_type, license_number]);
    
    if (facilityResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Facility not found'
      });
    }
    
    // Update facility location table if provided
    if (address || city || state || zip) {
      const locationQuery = `
        UPDATE gold.facility_location
        SET address = COALESCE($1, address),
            city = COALESCE($2, city),
            state = COALESCE($3, state),
            zip = COALESCE($4, zip)
        WHERE license_number = $5
      `;
      
      await pool.query(locationQuery, [address, city, state, zip, license_number]);
    }
    
    // Update risk in the latest inspection outcome if provided
    if (risk) {
      const updateRiskQuery = `
        UPDATE gold.inspection_outcome io
        SET risk = $1
        WHERE io.inspection_id = (
          SELECT inspection_id FROM gold.inspection 
          WHERE license_number = $2 
          ORDER BY inspection_date DESC 
          LIMIT 1
        )
      `;
      
      await pool.query(updateRiskQuery, [risk, license_number]);
    }
    
    res.json({
      success: true,
      message: 'Facility updated successfully',
      data: facilityResult.rows[0]
    });
  } catch (error) {
    console.error('Error updating facility:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

// DELETE facility by license number
router.delete('/:license_number', async (req, res) => {
  try {
    const { license_number } = req.params;
    
    // Check if facility exists
    const checkQuery = `SELECT license_number FROM gold.facility WHERE license_number = $1`;
    const checkResult = await pool.query(checkQuery, [license_number]);
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Facility not found'
      });
    }
    
    // Delete from violation_narrative first (FK constraint)
    await pool.query(`
      DELETE FROM gold.violation_narrative 
      WHERE inspection_id IN (
        SELECT inspection_id FROM gold.inspection WHERE license_number = $1
      )
    `, [license_number]);
    
    // Delete from inspection_outcome
    await pool.query(`
      DELETE FROM gold.inspection_outcome 
      WHERE inspection_id IN (
        SELECT inspection_id FROM gold.inspection WHERE license_number = $1
      )
    `, [license_number]);
    
    // Delete from inspection
    await pool.query(`
      DELETE FROM gold.inspection WHERE license_number = $1
    `, [license_number]);
    
    // Delete from facility_location
    await pool.query(`
      DELETE FROM gold.facility_location WHERE license_number = $1
    `, [license_number]);
    
    // Delete from facility
    await pool.query(`
      DELETE FROM gold.facility WHERE license_number = $1
    `, [license_number]);
    
    res.json({
      success: true,
      message: 'Facility deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting facility:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

// GET facility inspection history
router.get('/:license_number/inspections', async (req, res) => {
  try {
    const { license_number } = req.params;
    const { limit = 50, offset = 0 } = req.query;
    
    const query = `
      SELECT 
        i.inspection_id,
        i.inspection_date,
        io.risk,
        io.inspection_type,
        io.results,
        vn.violations
      FROM gold.inspection i
      JOIN gold.inspection_outcome io ON i.inspection_id = io.inspection_id
      LEFT JOIN gold.violation_narrative vn ON i.inspection_id = vn.inspection_id
      WHERE i.license_number = $1
      ORDER BY i.inspection_date DESC
      LIMIT $2 OFFSET $3
    `;
    
    const result = await pool.query(query, [license_number, limit, offset]);
    
    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching facility inspections:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

// GET facilities by city
router.get('/city/:city', async (req, res) => {
  try {
    const { city } = req.params;
    const { limit = 100, offset = 0 } = req.query;
    
    const query = `
      SELECT 
        f.license_number,
        f.dba_name,
        f.facility_type,
        fl.address,
        fl.city,
        fl.state,
        fl.zip
      FROM gold.facility f
      JOIN gold.facility_location fl ON f.license_number = fl.license_number
      WHERE fl.city ILIKE $1
      ORDER BY f.dba_name
      LIMIT $2 OFFSET $3
    `;
    
    const result = await pool.query(query, [`%${city}%`, limit, offset]);
    
    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching facilities by city:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

module.exports = router;
