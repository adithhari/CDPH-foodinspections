import { api } from "./client";
import type { Facility, Inspection } from "../types";

export async function fetchFacilities(params: {
  q?: string; page?: number; pageSize?: number;
  risk?: string; result?: string;
}) {
  const { data } = await api.get("/facilities", { params });
  return data as { items: Facility[]; total: number };
}

export async function fetchFacility(license: string) {
  const { data } = await api.get(`/facilities/${license}`);
  return data as Facility;
}

export async function createFacility(facility: Facility) {
  const { data } = await api.post("/facilities", facility);
  return data;
}

export async function updateFacility(license: string, facility: Partial<Facility>) {
  const { data } = await api.put(`/facilities/${license}`, facility);
  return data;
}

export async function deleteFacility(license: string) {
  const { data } = await api.delete(`/facilities/${license}`);
  return data;
}

export async function fetchFacilityInspections(license: string) {
  const { data } = await api.get(`/facilities/${license}/inspections`);
  return data as Inspection[];
}

export async function fetchFacilitiesWithLatestInspection(limit: number = 25, offset: number = 0) {
  const { data } = await api.get("/facilities/with-latest-inspection", { params: { limit, offset } });
  return data;
}
