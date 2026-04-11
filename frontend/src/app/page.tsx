'use client';

import Link from 'next/link';
import { CITY_KPIS, ALERTS, DISTRICTS } from '@/lib/districts';

const STATUS_COLOR: Record<string, string> = {
  red: '#EF4444',
  amber: '#F59E0B',
  green: '#14B8A6',
};

const ALERT_BG: Record<string, string> = {
  red: 'rgba(239,68,68,0.08)',
  amber: 'rgba(245,158,11,0.08)',
  green: 'rgba(20,184,166,0.08)',
};
const ALERT_BORDER: Record<string, string> = {
  red: 'rgba(239,68,68,0.25)',
  amber: 'rgba(245,158,11,0.25)',
  green: 'rgba(20,184,166,0.25)',
};

const NAV_TILES = [
  {
    href: '/map',
    label: 'District Map',
    desc: 'Visualize energy zones across Tampa',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <polygon
          points="1,6 1,22 8,18 16,22 23,18 23,2 16,6 8,2"
          stroke="#3B82F6"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <line x1="8" y1="2" x2="8" y2="18" stroke="#3B82F6" strokeWidth="2" />
        <line x1="16" y1="6" x2="16" y2="22" stroke="#3B82F6" strokeWidth="2" />
      </svg>
    ),
    accent: '#3B82F6',
  },
  {
    href: '/dashboard',
    label: 'Dashboard',
    desc: 'Live KPIs, charts, and trend analysis',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="3" width="7" height="7" rx="1" stroke="#14B8A6" strokeWidth="2" />
        <rect x="14" y="3" width="7" height="7" rx="1" stroke="#14B8A6" strokeWidth="2" />
        <rect x="3" y="14" width="7" height="7" rx="1" stroke="#14B8A6" strokeWidth="2" />
        <rect x="14" y="14" width="7" height="7" rx="1" stroke="#14B8A6" strokeWidth="2" />
      </svg>
    ),
    accent: '#14B8A6',
  },
  {
    href: '/recommendations',
    label: 'Recommendations',
    desc: 'AI-scored optimization projects',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path
          d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
          stroke="#F59E0B"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    accent: '#F59E0B',
  },
  {
    href: '/roadmap',
    label: 'Roadmap',
    desc: '2025–2054 clean energy pathway',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M3 12h18M3 6h18M3 18h12" stroke="#A78BFA" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
    accent: '#A78BFA',
  },
  {
    href: '/chat',
    label: 'AI Chat',
    desc: 'Deep-dive with the energy AI assistant',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path
          d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"
          stroke="#3B82F6"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    accent: '#3B82F6',
  },
];

const KPI_CARDS = [
  {
    label: 'Total Consumption',
    value: CITY_KPIS.totalMwh.toLocaleString(),
    unit: 'MWh',
    accent: '#3B82F6',
    bg: 'rgba(59,130,246,0.08)',
    border: 'rgba(59,130,246,0.2)',
    sub: 'Monthly citywide total',
  },
  {
    label: 'Peak Demand',
    value: CITY_KPIS.peakMw,
    unit: 'MW',
    accent: '#EF4444',
    bg: 'rgba(239,68,68,0.08)',
    border: 'rgba(239,68,68,0.2)',
    sub: 'Recorded this cycle',
  },
  {
    label: 'Energy Waste',
    value: `${CITY_KPIS.wastePercent}%`,
    unit: '',
    accent: '#F59E0B',
    bg: 'rgba(245,158,11,0.08)',
    border: 'rgba(245,158,11,0.2)',
    sub: 'Avg across all districts',
  },
  {
    label: 'Renewable Share',
    value: `${CITY_KPIS.renewablePercent}%`,
    unit: '',
    accent: '#14B8A6',
    bg: 'rgba(20,184,166,0.08)',
    border: 'rgba(20,184,166,0.2)',
    sub: 'Of total generation',
  },
];

export default function HomePage() {
  return (
    <div style={{ padding: '32px 24px 60px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Hero */}
      <div style={{ marginBottom: '36px' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: 'rgba(59,130,246,0.1)',
            border: '1px solid rgba(59,130,246,0.2)',
            borderRadius: '20px',
            padding: '4px 12px',
            marginBottom: '16px',
          }}
        >
          <span
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: '#14B8A6',
              display: 'inline-block',
              boxShadow: '0 0 6px rgba(20,184,166,0.6)',
            }}
          />
          <span style={{ fontSize: '11px', color: '#93C5FD', fontWeight: 500 }}>
            Live · Downtown Tampa Grid · {DISTRICTS.length} Districts
          </span>
        </div>
        <h1
          style={{
            fontSize: '36px',
            fontWeight: 800,
            margin: '0 0 10px',
            letterSpacing: '-0.03em',
            lineHeight: 1.2,
          }}
        >
          <span className="gradient-text">Tampa Energy</span>
          <br />
          <span style={{ color: '#F9FAFB' }}>Intelligence Platform</span>
        </h1>
        <p
          style={{
            fontSize: '14.5px',
            color: '#9CA3AF',
            margin: 0,
            maxWidth: '520px',
            lineHeight: 1.65,
          }}
        >
          AI-powered smart city energy optimization across {DISTRICTS.length} downtown districts.
          Monitor consumption, reduce waste, and accelerate Tampa&apos;s clean energy transition.
        </p>
      </div>

      {/* KPI Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: '12px',
          marginBottom: '36px',
        }}
      >
        {KPI_CARDS.map((kpi) => (
          <div
            key={kpi.label}
            className="card-hover"
            style={{
              backgroundColor: kpi.bg,
              border: `1px solid ${kpi.border}`,
              borderRadius: '14px',
              padding: '18px 20px',
            }}
          >
            <div
              style={{
                fontSize: '26px',
                fontWeight: 800,
                color: kpi.accent,
                letterSpacing: '-0.02em',
                lineHeight: 1,
                marginBottom: '5px',
              }}
            >
              {kpi.value}
              {kpi.unit && (
                <span style={{ fontSize: '13px', fontWeight: 500, marginLeft: '4px', opacity: 0.7 }}>
                  {kpi.unit}
                </span>
              )}
            </div>
            <div style={{ fontSize: '12.5px', fontWeight: 600, color: '#F9FAFB', marginBottom: '2px' }}>
              {kpi.label}
            </div>
            <div style={{ fontSize: '11px', color: '#6B7280' }}>{kpi.sub}</div>
          </div>
        ))}
      </div>

      {/* Grid status bar */}
      <div
        style={{
          backgroundColor: '#111827',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: '14px',
          padding: '16px 22px',
          marginBottom: '32px',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '24px',
          alignItems: 'center',
        }}
      >
        <div>
          <div style={{ fontSize: '10px', color: '#6B7280', marginBottom: '4px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Grid Stress
          </div>
          <span
            style={{
              padding: '3px 10px',
              borderRadius: '20px',
              backgroundColor: 'rgba(245,158,11,0.15)',
              border: '1px solid rgba(245,158,11,0.3)',
              color: '#F59E0B',
              fontSize: '12px',
              fontWeight: 600,
            }}
          >
            {CITY_KPIS.gridStress}
          </span>
        </div>
        <div style={{ flex: 1, minWidth: '180px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
            <span style={{ fontSize: '10px', color: '#6B7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Capacity Used
            </span>
            <span style={{ fontSize: '12px', color: '#F9FAFB', fontWeight: 600 }}>
              {CITY_KPIS.gridCapacityPercent}%
            </span>
          </div>
          <div style={{ height: '5px', backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: '3px', overflow: 'hidden' }}>
            <div
              style={{
                height: '100%',
                width: `${CITY_KPIS.gridCapacityPercent}%`,
                backgroundColor: '#F59E0B',
                borderRadius: '3px',
                boxShadow: '0 0 8px rgba(245,158,11,0.4)',
              }}
            />
          </div>
        </div>
        <div>
          <div style={{ fontSize: '10px', color: '#6B7280', marginBottom: '4px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Demand
          </div>
          <div style={{ fontSize: '16px', fontWeight: 700, color: '#F9FAFB' }}>
            {CITY_KPIS.totalDemandMw} <span style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: 400 }}>MW</span>
          </div>
        </div>
        <div>
          <div style={{ fontSize: '10px', color: '#6B7280', marginBottom: '4px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Clean Energy
          </div>
          <div style={{ fontSize: '16px', fontWeight: 700, color: '#14B8A6' }}>
            {CITY_KPIS.cleanEnergyPercent}%
          </div>
        </div>
      </div>

      {/* Nav tiles */}
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '11px', fontWeight: 600, color: '#6B7280', margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
          Explore Modules
        </h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
            gap: '10px',
          }}
        >
          {NAV_TILES.map((tile) => (
            <Link
              key={tile.href}
              href={tile.href}
              className="card-hover"
              style={{
                backgroundColor: '#111827',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: '12px',
                padding: '14px 16px',
                textDecoration: 'none',
                display: 'block',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = `${tile.accent}40`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)';
              }}
            >
              <div style={{ marginBottom: '8px' }}>{tile.icon}</div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#F9FAFB', marginBottom: '3px' }}>
                {tile.label}
              </div>
              <div style={{ fontSize: '11.5px', color: '#6B7280', lineHeight: 1.45 }}>{tile.desc}</div>
            </Link>
          ))}
        </div>
      </div>

      {/* Alerts */}
      <div>
        <h2 style={{ fontSize: '11px', fontWeight: 600, color: '#6B7280', margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
          Active Alerts
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {ALERTS.map((alert, i) => (
            <div
              key={i}
              style={{
                backgroundColor: ALERT_BG[alert.level],
                border: `1px solid ${ALERT_BORDER[alert.level]}`,
                borderRadius: '10px',
                padding: '12px 16px',
                display: 'flex',
                gap: '12px',
                alignItems: 'flex-start',
              }}
            >
              <span
                style={{
                  width: '7px',
                  height: '7px',
                  borderRadius: '50%',
                  backgroundColor: STATUS_COLOR[alert.level],
                  display: 'inline-block',
                  flexShrink: 0,
                  marginTop: '5px',
                  boxShadow: `0 0 5px ${STATUS_COLOR[alert.level]}60`,
                }}
              />
              <div>
                <div style={{ fontSize: '11.5px', fontWeight: 600, color: STATUS_COLOR[alert.level], marginBottom: '3px' }}>
                  {alert.district}
                </div>
                <div style={{ fontSize: '12.5px', color: '#D1D5DB', lineHeight: 1.45 }}>
                  {alert.message}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
