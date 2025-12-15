Dataset link: https://catalog.data.gov/dataset/food-inspections

**NOTE:** The complete dataset is not included in this repository due to file size constraints. It is publicly available and can be downloaded from the link above.

`filled_null_values.csv` contains the missing location fields (city, state, zip, latitude, longitude, location) filled using a Python pipeline with the Google Maps API. Since the address field was present for all records, it was used to geocode and populate any missing location attributes (for example, empty zip codes or cities).


## Data Architecture

**Bronze (raw ingest)**  
- Schema: `bronze`  
- Table: `bronze.food_inspections`  
- Stores CSV rows as-is (minimal typing only), preserving source fidelity.

**Silver (clean + validated)**  
- Schema: `silver`  
- Table: `silver.food_inspections`  
- Applies trimming, required-field validation, null handling, and de-duplication logic (primary key on `inspection_id`).  
- Also enriches missing location values using a Python-produced CSV (`filled_null_values.csv`).

**Gold (analytics model, normalized)**  
- Schema: `gold`  
- Tables:
  - `gold.facility` (one row per facility, keyed by `license_number`)
  - `gold.facility_location` (one row per facility location, FK to `facility`)
  - `gold.inspection` (one row per inspection, FK to `facility`)
  - `gold.inspection_outcome` (inspection outcome attributes, FK to `inspection`)
  - `gold.violation_narrative` (violations text, FK to `inspection`)

This separation improves data quality while maintaining full traceability back to the original CSV in Bronze.

## How to run

1. Update the file paths in the `COPY` commands to match your machine (Postgres server-side paths).
2. Execute procedures in this order:

```sql
CALL bronze.create_tables();
CALL bronze.load_bronze();

CALL silver.create_tables();
CALL silver.load_silver();

CALL gold.create_tables();
CALL gold.load_gold(true);
