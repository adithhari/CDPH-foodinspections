/*
Purpose: Create the Bronze Layer, and create the table 
*/

CREATE OR REPLACE PROCEDURE bronze.create_tables()
LANGUAGE plpgsql
AS $$
BEGIN

	CREATE SCHEMA IF NOT EXISTS bronze;

	CREATE TABLE IF NOT EXISTS bronze.food_inspections (
	  inspection_id    BIGINT,                  
	  dba_name         TEXT,                    
	  aka_name         TEXT,                    
	  license_number   BIGINT,                   
	  facility_type    TEXT,                    
	  risk             TEXT,                    
	  address          TEXT,                   
	  city             TEXT,                    
	  state            CHAR(2),                 
	  zip              INTEGER,                    
	  inspection_date  DATE,                    
	  inspection_type  TEXT,                    
	  results          TEXT,                    
	  violations       TEXT,                    
	  latitude         DOUBLE PRECISION,        
	  longitude        DOUBLE PRECISION,        
	  location         TEXT						
	  );

END;
$$;

/*
Purpose: Load data into the bronze layer
*/


CREATE OR REPLACE PROCEDURE bronze.load_bronze()
LANGUAGE plpgsql
AS $$
BEGIN
  TRUNCATE TABLE bronze.food_inspections;

  -- server-side COPY: path must be on the DB server and readable by postgres OS user
  EXECUTE format(
    'COPY bronze.food_inspections
     FROM %L
     WITH (FORMAT csv, HEADER true, DELIMITER '','')',
    '/Users/humaid/Documents/University/Sem 3/ADT/Final Project/Food_Inspections.csv'
  );
END;
$$;

/*
Purpose: create the silver schema and tables
*/

CREATE OR REPLACE PROCEDURE silver.create_tables()
LANGUAGE plpgsql
AS $$
BEGIN

	CREATE SCHEMA IF NOT EXISTS silver;

	CREATE TABLE IF NOT EXISTS silver.food_inspections (
	  inspection_id    BIGINT,                  
	  dba_name         TEXT,                    
	  aka_name         TEXT,                    
	  license_number   BIGINT,                    
	  facility_type    TEXT,                    
	  risk             TEXT,                    
	  address          TEXT,                   
	  city             TEXT,                    
	  state            CHAR(2),                    
	  zip              INTEGER,                    
	  inspection_date  DATE,                    
	  inspection_type  TEXT,                   
	  results          TEXT,                    
	  violations       TEXT,                    
	  latitude         DOUBLE PRECISION,        
	  longitude        DOUBLE PRECISION,        
	  location         TEXT	,					
	  dwh_create_date  DATE DEFAULT CURRENT_DATE 
	  );
	END;
$$;

/*
Purpose: Load data into silver layer
*/

CREATE OR REPLACE PROCEDURE silver.load_silver()
LANGUAGE plpgsql
AS $$
BEGIN
	TRUNCATE TABLE silver.food_inspections;

	-- 0) add inspection_id as the primary key
	BEGIN
		ALTER TABLE silver.food_inspections DROP CONSTRAINT IF EXISTS food_inspections_pk;
		
		ALTER TABLE silver.food_inspections
		  ADD CONSTRAINT food_inspections_pk PRIMARY KEY (inspection_id);
	END;
	
	-- 1) Base essentials 
	INSERT INTO silver.food_inspections
	(inspection_id, dba_name, inspection_date, results, address, license_number)
	SELECT inspection_id, TRIM(dba_name), inspection_date, results, address, license_number
	FROM bronze.food_inspections
	WHERE inspection_id IS NOT NULL
	  AND license_number IS NOT NULL
	  AND license_number <> 0 
	  AND dba_name IS NOT NULL
	  AND inspection_date IS NOT NULL
	  AND results IS NOT NULL
	  AND address IS NOT NULL
	ON CONFLICT (inspection_id) DO NOTHING;
	
	
	-- 2a) Load locational values from bronze
	
	UPDATE silver.food_inspections s
	SET
	  address   = b.address,
	  city      = TRIM(b.city),
	  state     = b.state,
	  zip       = b.zip,
	  latitude  = b.latitude,
	  longitude = b.longitude,
	  location  = b.location
	FROM bronze.food_inspections b
	WHERE b.inspection_id = s.inspection_id
	  AND b.inspection_id IS NOT NULL
	  AND b.inspection_id <> 0
	  AND b.address   IS NOT NULL
	  AND b.latitude  IS NOT NULL
	  AND b.longitude IS NOT NULL
	  AND b.location  IS NOT NULL
	  AND b.city      IS NOT NULL
	  AND b.state     IS NOT NULL
	  AND b.zip       IS NOT NULL;
		
	-- 2b) Load cleaned nulls from python
	CREATE TEMP TABLE IF NOT EXISTS stage_loc(
	  inspection_id BIGINT, 
	  address TEXT, 
	  latitude DOUBLE PRECISION, 
	  longitude DOUBLE PRECISION, 
	  location TEXT, 
	  city TEXT, 
	  state TEXT,
	  zip INTEGER 
	);

	TRUNCATE stage_loc;
	
	COPY stage_loc (inspection_id,address,latitude,longitude,location,city,state,zip)
	FROM '/Users/humaid/Documents/University/Sem 3/ADT/Final Project/filled_null_values.csv'
	WITH (FORMAT csv, HEADER true);
	
	
	UPDATE silver.food_inspections s
	SET
	  address   = sl.address,
	  latitude  = sl.latitude,
	  longitude = sl.longitude,
	  location  = sl.location,
	  city      = sl.city,
	  state     = sl.state,
	  zip       = sl.zip
	FROM stage_loc sl
	WHERE sl.inspection_id = s.inspection_id;

	-- Delete the location columns still null
	DELETE FROM silver.food_inspections
	WHERE city IS NULL
	  AND state IS NULL
	  AND zip IS NULL
	  AND location IS NULL
	  AND latitude IS NULL
	  AND longitude IS NULL;


	-- 3) inspection_type, risk, facility_type, violations from bronze (keep NULLs)
	UPDATE silver.food_inspections s
	SET inspection_type = COALESCE(NULLIF(TRIM(b.inspection_type), ''), s.inspection_type),
	    risk            = COALESCE(NULLIF(TRIM(b.risk), ''),            s.risk),
	    facility_type   = COALESCE(NULLIF(TRIM(b.facility_type), ''),   s.facility_type),
	    violations      = COALESCE(NULLIF(TRIM(b.violations), ''),      s.violations)
	FROM bronze.food_inspections b
	WHERE b.inspection_id = s.inspection_id;
END;
$$;

/*
Purpose: Create gold layer and tables
*/

CREATE OR REPLACE PROCEDURE gold.create_tables()
LANGUAGE plpgsql
AS $$
BEGIN

	CREATE SCHEMA IF NOT EXISTS gold;
	
	-- One row per facility (latest descriptive attrs)
	
	CREATE TABLE IF NOT EXISTS gold.facility (
	  license_number  TEXT PRIMARY KEY,
	  dba_name        TEXT,
	  facility_type   TEXT NOT NULL DEFAULT 'Facility Type not Mentioned'
	);
	
	-- One row per facility (latest location attrs)
	CREATE TABLE IF NOT EXISTS gold.facility_location (
	  license_number  TEXT PRIMARY KEY
	                  REFERENCES gold.facility(license_number) ON DELETE CASCADE,
	  address         TEXT,
	  city            TEXT,
	  state           CHAR(2),
	  zip             INTEGER,
	  latitude        DOUBLE PRECISION,
	  longitude       DOUBLE PRECISION,
	  location        TEXT
	);
	
	-- One row per inspection
	CREATE TABLE IF NOT EXISTS gold.inspection (
	  inspection_id   BIGINT PRIMARY KEY,
	  license_number  TEXT NOT NULL
	                  REFERENCES gold.facility(license_number) ON DELETE RESTRICT,
	  inspection_date DATE
	);
	CREATE INDEX IF NOT EXISTS idx_gold_inspection_license ON gold.inspection(license_number);
	
	-- Outcome
	CREATE TABLE IF NOT EXISTS gold.inspection_outcome (
	  inspection_id   BIGINT PRIMARY KEY
	                  REFERENCES gold.inspection(inspection_id) ON DELETE CASCADE,
	  risk            TEXT NOT NULL DEFAULT 'Risk Not Mentioned',
	  inspection_type TEXT NOT NULL DEFAULT 'Inspection Type Not Mentioned',
	  results         TEXT NOT NULL DEFAULT 'Results not Published'
	);
	
	-- Violations/narrative
	CREATE TABLE IF NOT EXISTS gold.violation_narrative (
	  inspection_id   BIGINT PRIMARY KEY
	                  REFERENCES gold.inspection(inspection_id) ON DELETE CASCADE,
	  violations      TEXT NOT NULL DEFAULT 'Violations not Stated'
	);
END;
$$;

/*
Purpose: Load data into the gold layer
*/

CREATE OR REPLACE PROCEDURE gold.load_gold(p_full_refresh boolean DEFAULT true)
LANGUAGE plpgsql
AS $$
BEGIN
	
	IF p_full_refresh THEN
	-- wipe Gold in FK-safe order
	TRUNCATE TABLE
	  gold.violation_narrative,
	  gold.inspection_outcome,
	  gold.inspection,
	  gold.facility_location,
	  gold.facility;
	END IF;
	
	-- 1) Load Facility
	
	INSERT INTO gold.facility AS g (license_number, dba_name, facility_type)
	SELECT DISTINCT ON (s.license_number)
	  s.license_number,
	  s.dba_name,
	  COALESCE(s.facility_type, 'Facility Type not Mentioned') AS facility_type
	FROM silver.food_inspections s
	WHERE s.license_number IS NOT NULL AND s.license_number <> '0'
	ORDER BY s.license_number, s.inspection_date DESC NULLS LAST
	ON CONFLICT (license_number) DO UPDATE
	SET dba_name      = EXCLUDED.dba_name,
	    facility_type = EXCLUDED.facility_type;
	
	
	-- 2) Load Facility Location
	INSERT INTO gold.facility_location AS gl
	  (license_number, address, city, state, zip, latitude, longitude, location)
	SELECT DISTINCT ON (s.license_number)
	  s.license_number, s.address, s.city, s.state, s.zip, s.latitude, s.longitude, s.location
	FROM silver.food_inspections s
	WHERE s.license_number IS NOT NULL AND s.address IS NOT NULL
	ORDER BY s.license_number, s.inspection_date DESC NULLS LAST
	ON CONFLICT (license_number) DO UPDATE
	SET address   = EXCLUDED.address,
	    city      = EXCLUDED.city,
	    state     = EXCLUDED.state,
	    zip       = EXCLUDED.zip,
	    latitude  = EXCLUDED.latitude,
	    longitude = EXCLUDED.longitude,
	    location  = EXCLUDED.location;
	
	-- 3) Load Inspection
	
	INSERT INTO gold.inspection AS gi (inspection_id, license_number, inspection_date)
	SELECT s.inspection_id, s.license_number, s.inspection_date
	FROM silver.food_inspections s
	WHERE s.inspection_id IS NOT NULL AND s.license_number IS NOT NULL
	ON CONFLICT (inspection_id) DO UPDATE
	SET license_number  = EXCLUDED.license_number,
	    inspection_date = EXCLUDED.inspection_date;
	
	-- 4) Load inspection_outcome
	
	INSERT INTO gold.inspection_outcome AS go
	  (inspection_id, risk, inspection_type, results)
	SELECT
	  s.inspection_id,
	  COALESCE(s.risk, 'Risk Not Mentioned'),
	  COALESCE(s.inspection_type, 'Inspection Type Not Mentioned'),
	  COALESCE(s.results, 'Results not Published')
	FROM silver.food_inspections s
	WHERE s.inspection_id IS NOT NULL
	ON CONFLICT (inspection_id) DO UPDATE
	SET risk            = EXCLUDED.risk,
	    inspection_type = EXCLUDED.inspection_type,
	    results         = EXCLUDED.results;
	
	-- 5) Load Violation Narrative
	
	INSERT INTO gold.violation_narrative AS gv (inspection_id, violations)
	SELECT s.inspection_id, COALESCE(s.violations, 'Violations not Stated')
	FROM silver.food_inspections s
	WHERE s.inspection_id IS NOT NULL
	ON CONFLICT (inspection_id) DO UPDATE
	SET violations = EXCLUDED.violations;

END;
$$;


/*
Now call all the Procedures in order to create the entire database
*/

CALL bronze.create_tables();
CALL bronze.load_bronze();
CALL silver.create_tables()
CALL silver.load_silver();
CALL gold.create_tables()
CALL gold.load_gold()

/* 
Sample Queries
*/

-- Zip codes with highest fail rates
SELECT fl.zip,
       COUNT(*) AS inspections,
       COUNT(*) FILTER (WHERE o.results IN ('Fail','Pass w/ Conditions')) AS not_pass,
       ROUND(100.0 * COUNT(*) FILTER (WHERE o.results IN ('Fail','Pass w/ Conditions')) / COUNT(*), 1) AS not_pass_pct
FROM gold.inspection i
JOIN gold.inspection_outcome o ON o.inspection_id = i.inspection_id
JOIN gold.facility_location fl ON fl.license_number = i.license_number
GROUP BY fl.zip
HAVING COUNT(*) >= 50
ORDER BY not_pass_pct DESC, inspections DESC
LIMIT 20;

-- rodent based violations
SELECT i.inspection_date, f.dba_name, fl.city, fl.state, v.violations
FROM gold.violation_narrative v
JOIN gold.inspection i  ON i.inspection_id = v.inspection_id
JOIN gold.facility f    ON f.license_number = i.license_number
LEFT JOIN gold.facility_location fl ON fl.license_number = f.license_number
WHERE v.violations ILIKE '%rodent%'
ORDER BY i.inspection_date DESC
LIMIT 100;

-- Maximum inspection types because of complaints
SELECT f.license_number, f.dba_name, fl.city, fl.state,
       COUNT(*) AS complaints_12m,
       MAX(i.inspection_date) AS last_complaint
FROM gold.inspection i
JOIN gold.inspection_outcome o ON o.inspection_id = i.inspection_id
JOIN gold.facility f           ON f.license_number = i.license_number
LEFT JOIN gold.facility_location fl ON fl.license_number = i.license_number
WHERE o.inspection_type ILIKE '%complaint%'
  AND i.inspection_date >= CURRENT_DATE - INTERVAL '12 months'
GROUP BY f.license_number, f.dba_name, fl.city, fl.state
ORDER BY complaints_12m DESC, last_complaint DESC
LIMIT 5;
