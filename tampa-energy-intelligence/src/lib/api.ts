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

export async function fetchRecommendations(): Promise<ScoredProject[]> {
  const data = await apiFetch<{ projects: ScoredProject[] }>(
    '/api/recommendations',
    { projects: STATIC_PROJECTS as unknown as ScoredProject[] }
  );
  return data.projects ?? [];
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
  file: File
): Promise<{ message: string; filename: string }> {
  const form = new FormData();
  form.append('file', file);
  try {
    const res = await fetch(`${BASE_URL}/api/upload`, {
      method: 'POST',
      body: form,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error('[API] upload failed', err);
    throw err;
  }
}

// ── Static helpers (KPIs, districts, alerts, trends) ────────────────────────

export async function fetchDistricts(): Promise<District[]> {
  return STATIC_DISTRICTS;
}

export async function fetchKpis(): Promise<CityKpis> {
  return STATIC_KPIS;
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
