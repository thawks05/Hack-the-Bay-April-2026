'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Polygon, Tooltip, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { DISTRICTS, District } from '@/lib/districts';
import { fetchMapData } from '@/lib/api';

const STATUS_FILL: Record<string, string> = {
  red: '#EF4444',
  amber: '#F59E0B',
  green: '#14B8A6',
};

type Layer = 'energy' | 'renewable' | 'waste';

interface FacilityPin {
  lat: number;
  lon: number;
  name: string;
  source_type: string;
  generation_mw: number;
  consumption_mw: number;
}

interface Props {
  selectedId: string | null;
  onSelect: (id: string) => void;
  activeLayer: Layer;
  districts?: District[];
}

function getLayerValue(d: District, layer: Layer): number {
  if (layer === 'energy') return d.mwh;
  if (layer === 'renewable') return d.renewable;
  if (layer === 'waste') return d.waste;
  return 0;
}

function getLayerColor(d: District, layer: Layer): string {
  if (layer === 'energy') {
    const norm = d.mwh / 1240;
    const r = Math.round(59 + norm * (239 - 59));
    const g = Math.round(130 - norm * 130);
    const b = Math.round(246 - norm * 246 + 68 * norm);
    return `rgb(${r},${g},${b})`;
  }
  if (layer === 'renewable') {
    const norm = d.renewable / 41;
    const r = Math.round(239 - norm * (239 - 20));
    const g = Math.round(68 + norm * (184 - 68));
    const b = Math.round(68 + norm * (166 - 68));
    return `rgb(${r},${g},${b})`;
  }
  if (layer === 'waste') {
    const norm = d.waste / 28;
    const r = Math.round(20 + norm * (239 - 20));
    const g = Math.round(184 - norm * (184 - 68));
    const b = Math.round(166 - norm * (166 - 68));
    return `rgb(${r},${g},${b})`;
  }
  return STATUS_FILL[d.status];
}

function getLayerUnit(layer: Layer): string {
  if (layer === 'energy') return 'MWh';
  if (layer === 'renewable') return '%';
  if (layer === 'waste') return '%';
  return '';
}

// Fit map to all district bounds on mount
function MapFitter({ districts }: { districts: District[] }) {
  const map = useMap();
  useEffect(() => {
    const allCoords = districts.flatMap((d) => d.coords);
    if (allCoords.length) {
      const lats = allCoords.map((c) => c[0]);
      const lngs = allCoords.map((c) => c[1]);
      map.fitBounds([
        [Math.min(...lats) - 0.005, Math.min(...lngs) - 0.005],
        [Math.max(...lats) + 0.005, Math.max(...lngs) + 0.005],
      ]);
    }
  }, [map, districts]);
  return null;
}

function substationIcon() {
  return L.divIcon({
    className: '',
    iconSize: [18, 18],
    iconAnchor: [9, 9],
    html: `<svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
      <polygon points="9,2 16,15 2,15" fill="#F59E0B" stroke="#fff" stroke-width="1.5" stroke-linejoin="round"/>
    </svg>`,
  });
}

function generatorIcon() {
  return L.divIcon({
    className: '',
    iconSize: [16, 16],
    iconAnchor: [8, 8],
    html: `<svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="2" width="12" height="12" fill="#3B82F6" stroke="#fff" stroke-width="1.5" rx="1"/>
    </svg>`,
  });
}

export default function MapClient({ selectedId, onSelect, activeLayer, districts: propDistricts }: Props) {
  const [isMounted, setIsMounted] = useState(false);
  const [pins, setPins] = useState<FacilityPin[]>([]);
  const districts = propDistricts ?? DISTRICTS;

  useEffect(() => {
    setIsMounted(true);
    fetchMapData().then((geo) => {
      const facilityPins: FacilityPin[] = (geo.features as unknown[])
        .filter((f: unknown) => {
          const feat = f as { geometry?: { type?: string }; properties?: { source_type?: string } };
          return feat.geometry?.type === 'Point' &&
            ['substation', 'generator', 'solar', 'wind', 'storage'].includes(
              feat.properties?.source_type ?? ''
            );
        })
        .map((f: unknown) => {
          const feat = f as { geometry: { coordinates: number[] }; properties: Record<string, unknown> };
          return {
            lon: feat.geometry.coordinates[0],
            lat: feat.geometry.coordinates[1],
            name: String(feat.properties.name ?? ''),
            source_type: String(feat.properties.source_type ?? 'generator'),
            generation_mw: Number(feat.properties.generation_mw ?? 0),
            consumption_mw: Number(feat.properties.consumption_mw ?? 0),
          };
        });
      setPins(facilityPins);
    });
  }, []);

  if (!isMounted) {
    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0A0F1E',
          color: '#9CA3AF',
          fontSize: '13px',
        }}
      >
        Loading map…
      </div>
    );
  }

  return (
    <MapContainer
      center={[27.948, -82.462]}
      zoom={13}
      style={{ width: '100%', height: '100%', background: '#0A0F1E' }}
      zoomControl={true}
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapFitter districts={districts} />
      {districts.map((district) => {
        const isSelected = selectedId === district.id;
        const color = getLayerColor(district, activeLayer);
        const layerVal = getLayerValue(district, activeLayer);
        const unit = getLayerUnit(activeLayer);

        return (
          <Polygon
            key={district.id}
            positions={district.coords}
            pathOptions={{
              color: isSelected ? '#FFFFFF' : color,
              fillColor: color,
              fillOpacity: isSelected ? 0.55 : 0.32,
              weight: isSelected ? 2.5 : 1.5,
              opacity: isSelected ? 1 : 0.85,
            }}
            eventHandlers={{
              click: () => onSelect(district.id),
              mouseover: (e) => {
                e.target.setStyle({ fillOpacity: 0.6 });
              },
              mouseout: (e) => {
                e.target.setStyle({ fillOpacity: isSelected ? 0.55 : 0.32 });
              },
            }}
          >
            <Tooltip
              permanent={false}
              direction="center"
              sticky
            >
              <div style={{ fontFamily: 'Inter, sans-serif', minWidth: '140px' }}>
                <div style={{ fontWeight: 700, marginBottom: '4px', color: '#F9FAFB', fontSize: '13px' }}>
                  {district.name}
                </div>
                <div style={{ fontSize: '11px', color: '#9CA3AF', lineHeight: 1.6 }}>
                  {activeLayer === 'energy' && `Consumption: ${layerVal.toLocaleString()} ${unit}`}
                  {activeLayer === 'renewable' && `Renewable: ${layerVal}${unit}`}
                  {activeLayer === 'waste' && `Waste: ${layerVal}${unit}`}
                  <br />
                  Status:{' '}
                  <span
                    style={{
                      color: STATUS_FILL[district.status],
                      fontWeight: 600,
                      textTransform: 'capitalize',
                    }}
                  >
                    {district.status === 'red' ? 'Critical' : district.status === 'amber' ? 'Moderate' : 'Efficient'}
                  </span>
                  <br />
                  Peak: {district.peak}
                </div>
              </div>
            </Tooltip>
          </Polygon>
        );
      })}

      {/* Facility markers: triangle = substation, square = generator/solar/wind/storage */}
      {pins.map((pin, i) => (
        <Marker
          key={i}
          position={[pin.lat, pin.lon]}
          icon={pin.source_type === 'substation' ? substationIcon() : generatorIcon()}
        >
          <Tooltip direction="top" sticky>
            <div style={{ fontFamily: 'Inter, sans-serif', minWidth: '160px' }}>
              <div style={{ fontWeight: 700, fontSize: '12px', marginBottom: '4px' }}>{pin.name}</div>
              <div style={{ fontSize: '11px', color: '#6B7280', lineHeight: 1.6 }}>
                {pin.source_type}<br />
                {pin.generation_mw > 0 && <>Gen: {pin.generation_mw} MW<br /></>}
              </div>
            </div>
          </Tooltip>
        </Marker>
      ))}
    </MapContainer>
  );
}
