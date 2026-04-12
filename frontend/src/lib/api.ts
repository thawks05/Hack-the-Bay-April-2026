/**
 * API client — calls Timothy's FastAPI backend (Tampa PowerIQ).
 * Falls back to static data in districts.ts if the backend is unreachable.
 *
 * Timothy's backend endpoints (main.py):
 *   POST /api/chat              → Gemma 4 agent response
 *   GET  /api/recommendations   → scored + ranked projects
 *   GET  /api/map               → GeoJSON map data from uploaded CSVs
 *   POST /api/roadmap           → phased energy roadmap
 *   GET  /api/health            → backend health + model info
 *   POST /api/upload            → upload a CSV for the agent to analyse
 */

import {
  District,
  Project,
  Alert,
  CityKpis,
  MonthlyPoint,
  HourlyPoint,
  DISTRICTS as STATIC_DISTRICTS,
  PROJECTS as STATIC_PROJECTS,
  ALERTS as STATIC_ALERTS,
  CITY_KPIS as STATIC_KPIS,
  MONTHLY_TREND as STATIC_MONTHLY,
  HOURLY_PEAK as STATIC_HOURLY,
} from './districts';

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// ── Generic fetch with static fallback ──────────────────────────────────────

async function apiFetch<T>(
  path: string,
  fallback: T,
  options?: RequestInit
): Promise<T> {
  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options?.headers ?? {}),
      },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return (await res.json()) as T;
  } catch (err) {
    console.warn(`[API] ${path} failed — using static fallback.`, err);
    return fallback;
  }
}

// ── Backend health ───────────────────────────────────────────────────────────

export async function backendStatus(): Promise<boolean> {
  try {
    const res = await fetch(`${BASE_URL}/api/health`, {
      signal: AbortSignal.timeout(2000),
    });
    return res.ok;
  } catch {
    return false;
  }
}

// ── Agent chat (Gemma 4 via Ollama) ─────────────────────────────────────────

export interface ScoredProject {
  id?: string;
  name: string;
  score: number;
  district?: string;
  type?: string;
  cost?: string;
  impact?: string;
  [key: string]: unknown;
}

export interface ChatResponse {
  response: string;
  recommendations?: ScoredProject[];
}

export async function sendChat(
  query: string,
  include_context = true
): Promise<ChatResponse> {
  return apiFetch<ChatResponse>(
    '/api/chat',
    { response: 'Backend offline — AI unavailable. Start the backend with: uvicorn main:app --reload' },
    { method: 'POST', body: JSON.stringify({ query, include_context }) }
  );
}

// ── Recommendations (scored by Timothy's backend) ────────────────────────────

export async function fetchRecommendations(): Promise<{ projects: ScoredProject[]; source: 'gemma' | 'mock'; ai_insight: string }> {
  const data = await apiFetch<{ projects: ScoredProject[]; source?: string; ai_insight?: string }>(
    '/api/recommendations',
    { projects: STATIC_PROJECTS as unknown as ScoredProject[], source: 'mock', ai_insight: '' }
  );
  return {
    projects: data.projects ?? [],
    source: data.source === 'gemma' ? 'gemma' : 'mock',
    ai_insight: data.ai_insight ?? '',
  };
}

// ── Map data (GeoJSON from uploaded CSVs) ───────────────────────────────────

export interface MapGeoJSON {
  type: string;
  features: unknown[];
  summary?: unknown;
}

export async function fetchMapData(): Promise<MapGeoJSON> {
  return apiFetch<MapGeoJSON>(
    '/api/map',
    { type: 'FeatureCollection', features: [] }
  );
}

// ── Roadmap (agent-generated) ────────────────────────────────────────────────

export interface RoadmapResponse {
  roadmap?: unknown;
  [key: string]: unknown;
}

export async function fetchRoadmap(
  horizons: number[] = [5, 10, 20]
): Promise<RoadmapResponse> {
  return apiFetch<RoadmapResponse>(
    '/api/roadmap',
    {},
    { method: 'POST', body: JSON.stringify({ horizons }) }
  );
}

// ── CSV upload ───────────────────────────────────────────────────────────────

export async function uploadCSV(
  file: File,
  fileType: 'utility' | 'timeseries' | 'event' = 'utility'
): Promise<{ message: string; filename: string; summary?: unknown }> {
  const form = new FormData();
  form.append('file', file);
  form.append('file_type', fileType);
  try {
    const res = await fetch(`${BASE_URL}/api/upload`, {
      method: 'POST',
      body: form,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    // Backend returns { uploads: [{ filename, file_type, summary }] }
    const first = data.uploads?.[0] ?? data;
    return {
      message: first.error ? `Error: ${first.error}` : `Uploaded ${first.filename}`,
      filename: first.filename ?? file.name,
      summary: first.summary,
    };
  } catch (err) {
    console.error('[API] upload failed', err);
    throw err;
  }
}

// ── Uploaded files status ─────────────────────────────────────────────────────

export interface UploadSummary {
  rows: number;
  file_type: string;
  zones: string[];
  source_types: string[];
  total_generation_mw: number | null;
  total_consumption_mw: number | null;
}

export async function fetchUploads(): Promise<Record<string, UploadSummary>> {
  try {
    const res = await fetch(`${BASE_URL}/api/uploads`, {
      signal: AbortSignal.timeout(3000),
    });
    if (!res.ok) return {};
    const data = await res.json();
    return data.uploads ?? {};
  } catch {
    return {};
  }
}

// ── Zone GeoJSON upload ───────────────────────────────────────────────────────

export async function uploadZoneGeoJSON(
  file: File,
  nameField: string,
  cityLabel: string,
): Promise<{ feature_count: number; name_field: string; city_label: string; sample_zones: string[] }> {
  const form = new FormData();
  form.append('file', file);
  form.append('name_field', nameField);
  form.append('city_label', cityLabel);
  const res = await fetch(`${BASE_URL}/api/zones/upload`, { method: 'POST', body: form });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail ?? 'Upload failed');
  }
  return res.json();
}

export async function fetchZonesConfig(): Promise<{ name_field: string; city_label: string; source: string }> {
  try {
    const res = await fetch(`${BASE_URL}/api/zones/config`, { signal: AbortSignal.timeout(3000) });
    if (!res.ok) throw new Error();
    return res.json();
  } catch {
    return { name_field: 'AssocLabel', city_label: 'Tampa, FL', source: 'default' };
  }
}

// ── Static helpers (KPIs, districts, alerts, trends) ────────────────────────

export async function fetchDistricts(): Promise<District[]> {
  try {
    const res = await fetch(`${BASE_URL}/api/districts`, {
      signal: AbortSignal.timeout(3000),
    });
    if (!res.ok) throw new Error();
    const data = await res.json();
    const live = (data.districts ?? []) as Partial<District>[];
    if (!live.length) return STATIC_DISTRICTS;
    // Overlay live stats onto static districts by name to preserve polygon coords
    const liveByName: Record<string, Partial<District>> = {};
    for (const d of live) {
      if (d.name) liveByName[d.name.toLowerCase()] = d;
    }
    return STATIC_DISTRICTS.map((d) => {
      const match = liveByName[d.name.toLowerCase()];
      return match ? { ...d, ...match, coords: d.coords } : d;
    });
  } catch {
    return STATIC_DISTRICTS;
  }
}

export function computeKpisFromDistricts(districts: District[]): CityKpis {
  if (!districts.length) return STATIC_KPIS;
  const totalMwh = Math.round(districts.reduce((s, d) => s + d.mwh, 0));
  const avgWaste = Math.round(districts.reduce((s, d) => s + d.waste, 0) / districts.length);
  const avgRenewable = Math.round(districts.reduce((s, d) => s + d.renewable, 0) / districts.length);
  const critical = districts.filter((d) => d.status === 'red').length;
  return {
    totalMwh,
    peakMw: Math.round(totalMwh * 0.08),
    wastePercent: avgWaste,
    renewablePercent: avgRenewable,
    gridStress: critical > 2 ? 'High' : critical > 0 ? 'Moderate' : 'Normal',
    gridCapacityPercent: Math.min(95, Math.round((totalMwh / 8000) * 100)),
    totalDemandMw: Math.round(totalMwh * 0.06),
    cleanEnergyPercent: avgRenewable,
  };
}

export async function fetchKpis(): Promise<CityKpis> {
  const districts = await fetchDistricts();
  return computeKpisFromDistricts(districts);
}

export async function fetchAlerts(): Promise<Alert[]> {
  return STATIC_ALERTS;
}

export async function fetchMonthlyTrend(): Promise<MonthlyPoint[]> {
  return STATIC_MONTHLY;
}

export async function fetchHourlyPeak(): Promise<HourlyPoint[]> {
  return STATIC_HOURLY;
}

export type { District, Project, Alert, CityKpis, MonthlyPoint, HourlyPoint };
