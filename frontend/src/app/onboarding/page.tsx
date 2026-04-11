'use client';

import { useState, useEffect, useRef } from 'react';
import {
  uploadCSV,
  uploadZoneGeoJSON,
  fetchUploads,
  fetchZonesConfig,
  UploadSummary,
} from '@/lib/api';

const SECTION: React.CSSProperties = {
  backgroundColor: '#111827',
  border: '1px solid rgba(59,130,246,0.15)',
  borderRadius: '12px',
  padding: '24px',
  marginBottom: '20px',
};

const LABEL: React.CSSProperties = {
  fontSize: '11px',
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  color: '#60A5FA',
  marginBottom: '14px',
};

const INPUT: React.CSSProperties = {
  width: '100%',
  padding: '9px 13px',
  backgroundColor: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '8px',
  color: '#F9FAFB',
  fontSize: '13px',
  outline: 'none',
  boxSizing: 'border-box',
};

const BTN_PRIMARY: React.CSSProperties = {
  padding: '9px 20px',
  backgroundColor: '#2563EB',
  color: '#fff',
  border: 'none',
  borderRadius: '8px',
  fontSize: '13px',
  fontWeight: 600,
  cursor: 'pointer',
};

const BTN_GHOST: React.CSSProperties = {
  padding: '9px 20px',
  backgroundColor: 'transparent',
  color: '#9CA3AF',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '8px',
  fontSize: '13px',
  cursor: 'pointer',
};

type FileType = 'utility' | 'timeseries' | 'event';

export default function OnboardingPage() {
  /* ── Zone GeoJSON state ── */
  const [geoFile, setGeoFile]         = useState<File | null>(null);
  const [nameField, setNameField]     = useState('NAME');
  const [cityLabel, setCityLabel]     = useState('');
  const [geoStatus, setGeoStatus]     = useState<string>('');
  const [geoError, setGeoError]       = useState<string>('');
  const [geoUploading, setGeoUploading] = useState(false);
  const [currentCity, setCurrentCity] = useState('Tampa, FL (default)');

  /* ── CSV state ── */
  const [csvFile, setCsvFile]         = useState<File | null>(null);
  const [csvType, setCsvType]         = useState<FileType>('utility');
  const [csvUploading, setCsvUploading] = useState(false);
  const [csvStatus, setCsvStatus]     = useState<string>('');
  const [csvError, setCsvError]       = useState<string>('');

  /* ── Uploaded files ── */
  const [uploads, setUploads]         = useState<Record<string, UploadSummary>>({});

  const geoInputRef = useRef<HTMLInputElement>(null);
  const csvInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchUploads().then(setUploads);
    fetchZonesConfig().then((cfg) => {
      setCurrentCity(cfg.city_label);
      setNameField(cfg.name_field);
    });
  }, []);

  /* ── Zone GeoJSON upload ── */
  async function handleGeoUpload() {
    if (!geoFile) return;
    setGeoUploading(true);
    setGeoError('');
    setGeoStatus('');
    try {
      const result = await uploadZoneGeoJSON(geoFile, nameField, cityLabel || geoFile.name);
      setGeoStatus(`✓ ${result.feature_count} zones loaded for ${result.city_label}`);
      setCurrentCity(result.city_label);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Upload failed';
      setGeoError(
        msg.includes('fetch') || msg.includes('network') || msg.includes('Failed')
          ? 'Cannot reach backend — run: uvicorn main:app --reload'
          : msg
      );
    } finally {
      setGeoUploading(false);
    }
  }

  /* ── CSV upload ── */
  async function handleCsvUpload() {
    if (!csvFile) return;
    setCsvUploading(true);
    setCsvError('');
    setCsvStatus('');
    try {
      const result = await uploadCSV(csvFile, csvType);
      setCsvStatus(`✓ ${result.filename} uploaded`);
      const updated = await fetchUploads();
      setUploads(updated);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Upload failed';
      setCsvError(
        msg.includes('fetch') || msg.includes('network') || msg.includes('Failed')
          ? 'Cannot reach backend — run: uvicorn main:app --reload'
          : msg
      );
    } finally {
      setCsvUploading(false);
    }
  }

  const uploadCount = Object.keys(uploads).length;

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#0A0F1E',
        color: '#F9FAFB',
        paddingTop: '72px',
        paddingBottom: '40px',
        fontFamily: 'Inter, system-ui, sans-serif',
      }}
    >
      <div style={{ maxWidth: '760px', margin: '0 auto', padding: '0 24px' }}>

        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '22px', fontWeight: 700, margin: '0 0 6px', color: '#F9FAFB' }}>
            Data Onboarding
          </h1>
          <p style={{ fontSize: '13px', color: '#6B7280', margin: 0 }}>
            Upload your zone boundaries and energy CSV files. All pages update automatically once data is loaded.
          </p>
        </div>

        {/* Status banner */}
        {uploadCount > 0 && (
          <div
            style={{
              marginBottom: '20px',
              padding: '12px 16px',
              backgroundColor: 'rgba(20,184,166,0.08)',
              border: '1px solid rgba(20,184,166,0.25)',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <span style={{ color: '#14B8A6', fontSize: '18px' }}>✓</span>
            <span style={{ fontSize: '13px', color: '#D1FAE5' }}>
              <b>{uploadCount}</b> file{uploadCount !== 1 ? 's' : ''} loaded — dashboard, map, and recommendations are live.
            </span>
          </div>
        )}

        {/* ── Step 1: Zone Boundaries ── */}
        <div style={SECTION}>
          <div style={LABEL}>Step 1 — Zone Boundaries (Optional)</div>

          <div style={{ fontSize: '12.5px', color: '#9CA3AF', marginBottom: '16px', lineHeight: 1.6 }}>
            Upload a GeoJSON file with your city&apos;s neighborhood or district polygons. The map will color each zone by energy flow.
            Skip this step to use the built-in Tampa neighborhoods.
          </div>

          <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '12px', color: '#6B7280' }}>Current:</span>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 500,
                color: '#60A5FA',
                backgroundColor: 'rgba(59,130,246,0.1)',
                border: '1px solid rgba(59,130,246,0.2)',
                padding: '2px 9px',
                borderRadius: '20px',
              }}
            >
              {currentCity}
            </span>
          </div>

          {/* File picker */}
          <div
            onClick={() => geoInputRef.current?.click()}
            style={{
              border: '1px dashed rgba(255,255,255,0.15)',
              borderRadius: '8px',
              padding: '18px',
              textAlign: 'center',
              cursor: 'pointer',
              marginBottom: '12px',
              transition: 'border-color 0.15s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'rgba(59,130,246,0.5)')}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)')}
          >
            <div style={{ fontSize: '22px', marginBottom: '4px' }}>🗺</div>
            <div style={{ fontSize: '12.5px', color: '#9CA3AF' }}>
              {geoFile ? geoFile.name : 'Click to choose a .geojson file'}
            </div>
            <input
              ref={geoInputRef}
              type="file"
              accept=".geojson,.json"
              style={{ display: 'none' }}
              onChange={(e) => setGeoFile(e.target.files?.[0] ?? null)}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
            <div>
              <div style={{ fontSize: '11px', color: '#6B7280', marginBottom: '5px' }}>Zone name field in GeoJSON</div>
              <input
                style={INPUT}
                value={nameField}
                onChange={(e) => setNameField(e.target.value)}
                placeholder="e.g. NAME, district, AssocLabel"
              />
            </div>
            <div>
              <div style={{ fontSize: '11px', color: '#6B7280', marginBottom: '5px' }}>City label</div>
              <input
                style={INPUT}
                value={cityLabel}
                onChange={(e) => setCityLabel(e.target.value)}
                placeholder="e.g. Orlando, FL"
              />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              style={{ ...BTN_PRIMARY, opacity: !geoFile || geoUploading ? 0.5 : 1 }}
              disabled={!geoFile || geoUploading}
              onClick={handleGeoUpload}
            >
              {geoUploading ? 'Uploading…' : 'Upload zone boundaries'}
            </button>
            {geoStatus && <span style={{ fontSize: '12px', color: '#14B8A6' }}>{geoStatus}</span>}
            {geoError  && <span style={{ fontSize: '12px', color: '#EF4444' }}>{geoError}</span>}
          </div>
        </div>

        {/* ── Step 2: Energy CSV Files ── */}
        <div style={SECTION}>
          <div style={LABEL}>Step 2 — Energy Data (CSV)</div>

          <div style={{ fontSize: '12.5px', color: '#9CA3AF', marginBottom: '16px', lineHeight: 1.6 }}>
            Upload CSV files exported from your utility system. All files share the same column schema.
            Upload multiple files — one per type.
          </div>

          {/* CSV schema reference */}
          <div
            style={{
              backgroundColor: 'rgba(0,0,0,0.3)',
              borderRadius: '8px',
              padding: '12px 14px',
              marginBottom: '16px',
              fontFamily: 'monospace',
              fontSize: '11px',
              color: '#6B7280',
              lineHeight: 1.7,
            }}
          >
            <span style={{ color: '#9CA3AF' }}>Required columns:</span>{' '}
            timestamp, facility_id, facility_name, lat, lon, zone_id,
            source_type, fuel_type, capacity_mw, generation_mw,
            consumption_mw, import_mw, export_mw, co2_lbs_per_mwh,
            operating_status
            <br />
            <span style={{ color: '#9CA3AF' }}>Optional:</span>{' '}
            allocation_pct, outage_risk, last_outage_date, outage_duration, notes
          </div>

          {/* File type selector */}
          <div style={{ marginBottom: '12px' }}>
            <div style={{ fontSize: '11px', color: '#6B7280', marginBottom: '6px' }}>File type</div>
            <div style={{ display: 'flex', gap: '8px' }}>
              {(['utility', 'timeseries', 'event'] as FileType[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setCsvType(t)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: csvType === t ? 600 : 400,
                    cursor: 'pointer',
                    border: csvType === t ? '1px solid rgba(59,130,246,0.5)' : '1px solid rgba(255,255,255,0.1)',
                    backgroundColor: csvType === t ? 'rgba(59,130,246,0.15)' : 'transparent',
                    color: csvType === t ? '#60A5FA' : '#9CA3AF',
                  }}
                >
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
            <div style={{ fontSize: '11px', color: '#6B7280', marginTop: '6px' }}>
              {csvType === 'utility'    && 'Facility/zip data — used for map pins and zone aggregation'}
              {csvType === 'timeseries' && 'Time-stamped readings — used for trend charts'}
              {csvType === 'event'      && 'Special demand events (Gasparilla, concerts, etc.)'}
            </div>
          </div>

          {/* File picker */}
          <div
            onClick={() => csvInputRef.current?.click()}
            style={{
              border: '1px dashed rgba(255,255,255,0.15)',
              borderRadius: '8px',
              padding: '18px',
              textAlign: 'center',
              cursor: 'pointer',
              marginBottom: '12px',
              transition: 'border-color 0.15s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'rgba(59,130,246,0.5)')}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)')}
          >
            <div style={{ fontSize: '22px', marginBottom: '4px' }}>📂</div>
            <div style={{ fontSize: '12.5px', color: '#9CA3AF' }}>
              {csvFile ? csvFile.name : 'Click to choose a .csv file'}
            </div>
            <input
              ref={csvInputRef}
              type="file"
              accept=".csv"
              style={{ display: 'none' }}
              onChange={(e) => setCsvFile(e.target.files?.[0] ?? null)}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              style={{ ...BTN_PRIMARY, opacity: !csvFile || csvUploading ? 0.5 : 1 }}
              disabled={!csvFile || csvUploading}
              onClick={handleCsvUpload}
            >
              {csvUploading ? 'Uploading…' : 'Upload CSV'}
            </button>
            {csvStatus && <span style={{ fontSize: '12px', color: '#14B8A6' }}>{csvStatus}</span>}
            {csvError  && <span style={{ fontSize: '12px', color: '#EF4444' }}>{csvError}</span>}
          </div>
        </div>

        {/* ── Uploaded files list ── */}
        {uploadCount > 0 && (
          <div style={SECTION}>
            <div style={LABEL}>Loaded Files ({uploadCount})</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {Object.entries(uploads).map(([filename, summary]) => (
                <div
                  key={filename}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '10px 14px',
                    backgroundColor: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.07)',
                    borderRadius: '8px',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '13px', color: '#F9FAFB', fontWeight: 500 }}>{filename}</div>
                    <div style={{ fontSize: '11px', color: '#6B7280', marginTop: '2px' }}>
                      {summary.file_type} · {summary.rows} rows
                      {summary.total_generation_mw != null && ` · ${summary.total_generation_mw} MW generated`}
                      {summary.zones.length > 0 && ` · ${summary.zones.length} zones`}
                    </div>
                  </div>
                  <span
                    style={{
                      fontSize: '10px',
                      fontWeight: 600,
                      color: '#14B8A6',
                      backgroundColor: 'rgba(20,184,166,0.1)',
                      border: '1px solid rgba(20,184,166,0.2)',
                      padding: '2px 8px',
                      borderRadius: '20px',
                    }}
                  >
                    LOADED
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
