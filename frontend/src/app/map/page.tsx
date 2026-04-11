'use client';

import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';
import { DISTRICTS, District } from '@/lib/districts';

const MapClient = dynamic(() => import('@/components/MapClient'), { ssr: false });

type Layer = 'energy' | 'renewable' | 'waste';

const LAYER_OPTIONS: { id: Layer; label: string; color: string }[] = [
  { id: 'energy', label: 'Energy Use', color: '#3B82F6' },
  { id: 'renewable', label: 'Renewable %', color: '#14B8A6' },
  { id: 'waste', label: 'Waste %', color: '#F59E0B' },
];

const STATUS_COLOR: Record<string, string> = {
  red: '#EF4444',
  amber: '#F59E0B',
  green: '#14B8A6',
};

const STATUS_LABEL: Record<string, string> = {
  red: 'Critical',
  amber: 'Moderate',
  green: 'Efficient',
};

export default function MapPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeLayer, setActiveLayer] = useState<Layer>('energy');

  const selectedDistrict: District | null =
    DISTRICTS.find((d) => d.id === selectedId) ?? null;

  // Persist to localStorage for AI context
  useEffect(() => {
    try {
      localStorage.setItem('selectedDistrict', selectedDistrict?.name ?? 'None');
      localStorage.setItem('activeLayer', activeLayer);
    } catch {}
  }, [selectedDistrict, activeLayer]);

  const handleSelect = (id: string) => {
    setSelectedId((prev) => (prev === id ? null : id));
  };

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 52px)', overflow: 'hidden' }}>
      {/* Sidebar */}
      <div
        style={{
          width: '280px',
          flexShrink: 0,
          backgroundColor: '#111827',
          borderRight: '1px solid rgba(255,255,255,0.07)',
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'auto',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '16px',
            borderBottom: '1px solid rgba(255,255,255,0.07)',
            flexShrink: 0,
          }}
        >
          <h1 style={{ fontSize: '14px', fontWeight: 700, color: '#F9FAFB', margin: '0 0 4px' }}>
            District Map
          </h1>
          <p style={{ fontSize: '11.5px', color: '#6B7280', margin: 0 }}>
            Click a district polygon to inspect
          </p>
        </div>

        {/* Layer switcher */}
        <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.07)', flexShrink: 0 }}>
          <div style={{ fontSize: '10px', color: '#6B7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>
            Data Layer
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {LAYER_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                onClick={() => setActiveLayer(opt.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '7px 10px',
                  borderRadius: '8px',
                  border: activeLayer === opt.id ? `1px solid ${opt.color}40` : '1px solid transparent',
                  backgroundColor: activeLayer === opt.id ? `${opt.color}12` : 'transparent',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease',
                }}
              >
                <span
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: opt.color,
                    flexShrink: 0,
                  }}
                />
                <span
                  style={{
                    fontSize: '12px',
                    fontWeight: activeLayer === opt.id ? 600 : 400,
                    color: activeLayer === opt.id ? opt.color : '#9CA3AF',
                  }}
                >
                  {opt.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Selected district detail */}
        {selectedDistrict ? (
          <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.07)', flexShrink: 0 }}>
            <div style={{ fontSize: '10px', color: '#6B7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px' }}>
              Selected District
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#F9FAFB' }}>
                {selectedDistrict.name}
              </div>
              <span
                style={{
                  padding: '2px 8px',
                  borderRadius: '12px',
                  backgroundColor: `${STATUS_COLOR[selectedDistrict.status]}18`,
                  border: `1px solid ${STATUS_COLOR[selectedDistrict.status]}35`,
                  color: STATUS_COLOR[selectedDistrict.status],
                  fontSize: '10px',
                  fontWeight: 600,
                }}
              >
                {STATUS_LABEL[selectedDistrict.status]}
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {[
                { label: 'Consumption', value: `${selectedDistrict.mwh.toLocaleString()} MWh`, accent: '#3B82F6' },
                { label: 'Renewable', value: `${selectedDistrict.renewable}%`, accent: '#14B8A6' },
                { label: 'Waste', value: `${selectedDistrict.waste}%`, accent: '#F59E0B' },
                { label: 'Peak Time', value: selectedDistrict.peak, accent: '#A78BFA' },
              ].map((stat) => (
                <div
                  key={stat.label}
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.04)',
                    borderRadius: '8px',
                    padding: '8px',
                    border: '1px solid rgba(255,255,255,0.06)',
                  }}
                >
                  <div style={{ fontSize: '10px', color: '#6B7280', marginBottom: '3px' }}>{stat.label}</div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: stat.accent }}>{stat.value}</div>
                </div>
              ))}
            </div>

            {/* Progress bars */}
            <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                { label: 'Renewable', value: selectedDistrict.renewable, color: '#14B8A6', max: 100 },
                { label: 'Waste', value: selectedDistrict.waste, color: '#EF4444', max: 35 },
              ].map((bar) => (
                <div key={bar.label}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '10px', color: '#9CA3AF' }}>{bar.label}</span>
                    <span style={{ fontSize: '10px', color: '#F9FAFB', fontWeight: 600 }}>{bar.value}%</span>
                  </div>
                  <div style={{ height: '4px', backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: '2px', overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${(bar.value / bar.max) * 100}%`,
                        backgroundColor: bar.color,
                        borderRadius: '2px',
                        transition: 'width 0.4s ease',
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div
            style={{
              padding: '14px 16px',
              borderBottom: '1px solid rgba(255,255,255,0.07)',
              flexShrink: 0,
            }}
          >
            <div
              style={{
                padding: '14px',
                borderRadius: '8px',
                backgroundColor: 'rgba(255,255,255,0.03)',
                border: '1px dashed rgba(255,255,255,0.1)',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '18px', marginBottom: '6px' }}>🗺️</div>
              <div style={{ fontSize: '11.5px', color: '#6B7280', lineHeight: 1.5 }}>
                Click a district on the map to view details
              </div>
            </div>
          </div>
        )}

        {/* District list */}
        <div style={{ padding: '12px 16px', flex: 1 }}>
          <div style={{ fontSize: '10px', color: '#6B7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>
            All Districts
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {DISTRICTS.sort((a, b) => b.mwh - a.mwh).map((district) => (
              <button
                key={district.id}
                onClick={() => handleSelect(district.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '7px 8px',
                  borderRadius: '8px',
                  border: selectedId === district.id ? '1px solid rgba(59,130,246,0.3)' : '1px solid transparent',
                  backgroundColor: selectedId === district.id ? 'rgba(59,130,246,0.08)' : 'transparent',
                  cursor: 'pointer',
                  textAlign: 'left',
                  width: '100%',
                  transition: 'all 0.12s ease',
                }}
              >
                <span
                  style={{
                    width: '7px',
                    height: '7px',
                    borderRadius: '50%',
                    backgroundColor: STATUS_COLOR[district.status],
                    flexShrink: 0,
                  }}
                />
                <span style={{ flex: 1, fontSize: '12px', color: '#D1D5DB', fontWeight: selectedId === district.id ? 600 : 400 }}>
                  {district.name}
                </span>
                <span style={{ fontSize: '11px', color: '#6B7280' }}>
                  {activeLayer === 'energy' && `${district.mwh}`}
                  {activeLayer === 'renewable' && `${district.renewable}%`}
                  {activeLayer === 'waste' && `${district.waste}%`}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div
          style={{
            padding: '12px 16px',
            borderTop: '1px solid rgba(255,255,255,0.07)',
            flexShrink: 0,
          }}
        >
          <div style={{ fontSize: '10px', color: '#6B7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>
            Status Legend
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            {[
              { color: '#EF4444', label: 'Critical — High waste, low renewable' },
              { color: '#F59E0B', label: 'Moderate — Improving metrics' },
              { color: '#14B8A6', label: 'Efficient — Renewable-first' },
            ].map((item) => (
              <div key={item.color} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span
                  style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '2px',
                    backgroundColor: item.color,
                    flexShrink: 0,
                  }}
                />
                <span style={{ fontSize: '10.5px', color: '#9CA3AF' }}>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Map */}
      <div style={{ flex: 1, position: 'relative' }}>
        <MapClient
          selectedId={selectedId}
          onSelect={handleSelect}
          activeLayer={activeLayer}
        />
      </div>
    </div>
  );
}
