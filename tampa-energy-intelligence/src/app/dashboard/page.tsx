'use client';

import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import {
  CITY_KPIS,
  MONTHLY_TREND,
  HOURLY_PEAK,
  ALERTS,
  DISTRICTS,
} from '@/lib/districts';

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

const ALERT_BG: Record<string, string> = {
  red: 'rgba(239,68,68,0.08)',
  amber: 'rgba(245,158,11,0.08)',
};
const ALERT_BORDER: Record<string, string> = {
  red: 'rgba(239,68,68,0.25)',
  amber: 'rgba(245,158,11,0.25)',
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomTooltipMonthly = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div
        style={{
          backgroundColor: '#1F2937',
          border: '1px solid rgba(59,130,246,0.25)',
          borderRadius: '8px',
          padding: '8px 12px',
          fontSize: '12px',
          color: '#F9FAFB',
        }}
      >
        <div style={{ color: '#9CA3AF', marginBottom: '4px' }}>{label}</div>
        <div style={{ fontWeight: 700, color: '#3B82F6' }}>
          {payload[0].value.toLocaleString()} MWh
        </div>
      </div>
    );
  }
  return null;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomTooltipHourly = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div
        style={{
          backgroundColor: '#1F2937',
          border: '1px solid rgba(20,184,166,0.25)',
          borderRadius: '8px',
          padding: '8px 12px',
          fontSize: '12px',
          color: '#F9FAFB',
        }}
      >
        <div style={{ color: '#9CA3AF', marginBottom: '4px' }}>{label}</div>
        <div style={{ fontWeight: 700, color: '#14B8A6' }}>{payload[0].value} MW</div>
      </div>
    );
  }
  return null;
};

export default function DashboardPage() {
  const districtsByMwh = [...DISTRICTS].sort((a, b) => b.mwh - a.mwh);

  return (
    <div style={{ padding: '28px 24px 60px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 800, margin: '0 0 4px', letterSpacing: '-0.02em', color: '#F9FAFB' }}>
          Energy Dashboard
        </h1>
        <p style={{ fontSize: '13px', color: '#6B7280', margin: 0 }}>
          Real-time citywide metrics and trend analysis for Downtown Tampa
        </p>
      </div>

      {/* KPI Row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '12px',
          marginBottom: '24px',
        }}
      >
        {[
          { label: 'Total MWh', value: CITY_KPIS.totalMwh.toLocaleString(), unit: 'MWh', color: '#3B82F6', bg: 'rgba(59,130,246,0.08)', border: 'rgba(59,130,246,0.2)' },
          { label: 'Peak Demand', value: CITY_KPIS.peakMw, unit: 'MW', color: '#EF4444', bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.2)' },
          { label: 'Energy Waste', value: `${CITY_KPIS.wastePercent}%`, unit: '', color: '#F59E0B', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.2)' },
          { label: 'Renewable', value: `${CITY_KPIS.renewablePercent}%`, unit: '', color: '#14B8A6', bg: 'rgba(20,184,166,0.08)', border: 'rgba(20,184,166,0.2)' },
          { label: 'Grid Capacity', value: `${CITY_KPIS.gridCapacityPercent}%`, unit: '', color: '#A78BFA', bg: 'rgba(167,139,250,0.08)', border: 'rgba(167,139,250,0.2)' },
          { label: 'Clean Energy', value: `${CITY_KPIS.cleanEnergyPercent}%`, unit: '', color: '#14B8A6', bg: 'rgba(20,184,166,0.06)', border: 'rgba(20,184,166,0.15)' },
          { label: 'Demand', value: `${CITY_KPIS.totalDemandMw}`, unit: 'MW', color: '#F59E0B', bg: 'rgba(245,158,11,0.06)', border: 'rgba(245,158,11,0.15)' },
          { label: 'Grid Stress', value: CITY_KPIS.gridStress, unit: '', color: '#F59E0B', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.2)' },
        ].map((kpi) => (
          <div
            key={kpi.label}
            className="card-hover"
            style={{
              backgroundColor: kpi.bg,
              border: `1px solid ${kpi.border}`,
              borderRadius: '12px',
              padding: '14px 16px',
            }}
          >
            <div style={{ fontSize: '10px', color: '#6B7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
              {kpi.label}
            </div>
            <div style={{ fontSize: '22px', fontWeight: 800, color: kpi.color, letterSpacing: '-0.02em', lineHeight: 1 }}>
              {kpi.value}
              {kpi.unit && <span style={{ fontSize: '12px', fontWeight: 500, marginLeft: '3px', opacity: 0.7 }}>{kpi.unit}</span>}
            </div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
        {/* Monthly trend */}
        <div
          style={{
            backgroundColor: '#111827',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: '14px',
            padding: '18px 20px',
          }}
        >
          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#F9FAFB', marginBottom: '2px' }}>
              Monthly Consumption Trend
            </div>
            <div style={{ fontSize: '11px', color: '#6B7280' }}>MWh by month · current year</div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={MONTHLY_TREND} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis
                dataKey="month"
                tick={{ fill: '#6B7280', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: '#6B7280', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `${(v / 1000).toFixed(1)}k`}
                width={36}
              />
              <Tooltip content={<CustomTooltipMonthly />} />
              <ReferenceLine y={5000} stroke="rgba(239,68,68,0.3)" strokeDasharray="4 4" />
              <Line
                type="monotone"
                dataKey="mwh"
                stroke="#3B82F6"
                strokeWidth={2}
                dot={{ fill: '#3B82F6', r: 3, strokeWidth: 0 }}
                activeDot={{ r: 5, fill: '#3B82F6', stroke: '#fff', strokeWidth: 1.5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Hourly peak */}
        <div
          style={{
            backgroundColor: '#111827',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: '14px',
            padding: '18px 20px',
          }}
        >
          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#F9FAFB', marginBottom: '2px' }}>
              Hourly Peak Demand
            </div>
            <div style={{ fontSize: '11px', color: '#6B7280' }}>MW by hour · typical weekday</div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={HOURLY_PEAK} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="demandGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#14B8A6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#14B8A6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis
                dataKey="hour"
                tick={{ fill: '#6B7280', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                interval={2}
              />
              <YAxis
                tick={{ fill: '#6B7280', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                width={30}
              />
              <Tooltip content={<CustomTooltipHourly />} />
              <ReferenceLine y={300} stroke="rgba(239,68,68,0.4)" strokeDasharray="4 4" label={{ value: 'Peak', fill: '#EF4444', fontSize: 9 }} />
              <Area
                type="monotone"
                dataKey="mw"
                stroke="#14B8A6"
                strokeWidth={2}
                fill="url(#demandGrad)"
                dot={false}
                activeDot={{ r: 4, fill: '#14B8A6', stroke: '#fff', strokeWidth: 1.5 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* District comparison chart */}
      <div
        style={{
          backgroundColor: '#111827',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: '14px',
          padding: '18px 20px',
          marginBottom: '20px',
        }}
      >
        <div style={{ marginBottom: '16px' }}>
          <div style={{ fontSize: '13px', fontWeight: 700, color: '#F9FAFB', marginBottom: '2px' }}>
            District Consumption Comparison
          </div>
          <div style={{ fontSize: '11px', color: '#6B7280' }}>MWh — all 8 districts ranked</div>
        </div>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={districtsByMwh} layout="vertical" margin={{ top: 0, right: 20, bottom: 0, left: 80 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
            <XAxis
              type="number"
              tick={{ fill: '#6B7280', fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `${v}`}
            />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fill: '#9CA3AF', fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              width={78}
            />
            <Tooltip
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              formatter={(value: any) => [`${Number(value).toLocaleString()} MWh`, 'Consumption']}
              contentStyle={{ backgroundColor: '#1F2937', border: '1px solid rgba(59,130,246,0.2)', borderRadius: '8px', fontSize: '12px', color: '#F9FAFB' }}
            />
            <Bar
              dataKey="mwh"
              radius={[0, 4, 4, 0]}
              fill="#3B82F6"
              maxBarSize={14}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Bottom row: grid + alerts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        {/* Grid status */}
        <div
          style={{
            backgroundColor: '#111827',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: '14px',
            padding: '18px 20px',
          }}
        >
          <div style={{ fontSize: '13px', fontWeight: 700, color: '#F9FAFB', marginBottom: '16px' }}>
            Grid Status
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {[
              { label: 'Capacity Used', value: CITY_KPIS.gridCapacityPercent, color: '#F59E0B', max: 100 },
              { label: 'Renewable Share', value: CITY_KPIS.renewablePercent, color: '#14B8A6', max: 100 },
              { label: 'Clean Energy Mix', value: CITY_KPIS.cleanEnergyPercent, color: '#A78BFA', max: 100 },
            ].map((bar) => (
              <div key={bar.label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                  <span style={{ fontSize: '11.5px', color: '#9CA3AF' }}>{bar.label}</span>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: bar.color }}>{bar.value}%</span>
                </div>
                <div style={{ height: '6px', backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${(bar.value / bar.max) * 100}%`,
                      backgroundColor: bar.color,
                      borderRadius: '3px',
                      boxShadow: `0 0 8px ${bar.color}40`,
                    }}
                  />
                </div>
              </div>
            ))}
            <div
              style={{
                marginTop: '4px',
                padding: '10px 12px',
                borderRadius: '8px',
                backgroundColor: 'rgba(245,158,11,0.1)',
                border: '1px solid rgba(245,158,11,0.2)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <span style={{ fontSize: '12px', color: '#9CA3AF' }}>Grid Stress Level</span>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#F59E0B' }}>{CITY_KPIS.gridStress}</span>
            </div>
          </div>
        </div>

        {/* Alerts panel */}
        <div
          style={{
            backgroundColor: '#111827',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: '14px',
            padding: '18px 20px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#F9FAFB' }}>Active Alerts</div>
            <span
              style={{
                padding: '2px 8px',
                borderRadius: '12px',
                backgroundColor: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.2)',
                color: '#EF4444',
                fontSize: '11px',
                fontWeight: 600,
              }}
            >
              {ALERTS.length}
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {ALERTS.map((alert, i) => (
              <div
                key={i}
                style={{
                  backgroundColor: ALERT_BG[alert.level] ?? 'rgba(255,255,255,0.04)',
                  border: `1px solid ${ALERT_BORDER[alert.level] ?? 'rgba(255,255,255,0.07)'}`,
                  borderRadius: '10px',
                  padding: '10px 12px',
                  display: 'flex',
                  gap: '10px',
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
                    marginTop: '4px',
                    boxShadow: `0 0 5px ${STATUS_COLOR[alert.level]}55`,
                  }}
                />
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 600, color: STATUS_COLOR[alert.level], marginBottom: '3px' }}>
                    {alert.district}
                  </div>
                  <div style={{ fontSize: '11.5px', color: '#9CA3AF', lineHeight: 1.45 }}>{alert.message}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* District status table */}
      <div
        style={{
          backgroundColor: '#111827',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: '14px',
          padding: '18px 20px',
          marginTop: '16px',
        }}
      >
        <div style={{ fontSize: '13px', fontWeight: 700, color: '#F9FAFB', marginBottom: '14px' }}>
          District Overview
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
            <thead>
              <tr>
                {['District', 'MWh', 'Peak Time', 'Waste %', 'Renewable %', 'Status'].map((h) => (
                  <th
                    key={h}
                    style={{
                      textAlign: 'left',
                      padding: '6px 10px',
                      color: '#6B7280',
                      fontWeight: 600,
                      fontSize: '10px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      borderBottom: '1px solid rgba(255,255,255,0.06)',
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {districtsByMwh.map((d, i) => (
                <tr
                  key={d.id}
                  style={{
                    borderBottom: i < districtsByMwh.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                  }}
                >
                  <td style={{ padding: '8px 10px', color: '#F9FAFB', fontWeight: 500 }}>{d.name}</td>
                  <td style={{ padding: '8px 10px', color: '#3B82F6', fontWeight: 700 }}>{d.mwh.toLocaleString()}</td>
                  <td style={{ padding: '8px 10px', color: '#9CA3AF' }}>{d.peak}</td>
                  <td style={{ padding: '8px 10px' }}>
                    <span style={{ color: d.waste > 20 ? '#EF4444' : d.waste > 10 ? '#F59E0B' : '#14B8A6', fontWeight: 600 }}>
                      {d.waste}%
                    </span>
                  </td>
                  <td style={{ padding: '8px 10px' }}>
                    <span style={{ color: d.renewable > 30 ? '#14B8A6' : d.renewable > 15 ? '#F59E0B' : '#EF4444', fontWeight: 600 }}>
                      {d.renewable}%
                    </span>
                  </td>
                  <td style={{ padding: '8px 10px' }}>
                    <span
                      style={{
                        padding: '2px 8px',
                        borderRadius: '12px',
                        backgroundColor: `${STATUS_COLOR[d.status]}18`,
                        border: `1px solid ${STATUS_COLOR[d.status]}35`,
                        color: STATUS_COLOR[d.status],
                        fontSize: '10px',
                        fontWeight: 600,
                      }}
                    >
                      {STATUS_LABEL[d.status]}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
