// Facility Type Definition
export type Facility = {
  license_number: string;
  dba_name: string;
  aka_name?: string;
  facility_type?: string;
  address: string;
  city?: string;
  state?: string;
  zip?: string;
  latitude?: number;
  longitude?: number;
  latest_result?: "Pass" | "Fail" | "Pass w/ Conditions" | "Out of Business" | string;
  risk?: "Risk 1 (High)" | "Risk 2 (Medium)" | "Risk 3 (Low)" | string;
};

// Inspection Type Definition
export type Inspection = {
  inspection_id: string;
  license_number: string;
  inspection_date: string; // ISO date format
  inspection_type?: string;
  result?: string;
  risk?: string;
  violations?: string | null;
};
