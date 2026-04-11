'use client';

import { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts';

interface Milestone {
  year: number;
  title: string;
  desc: string;
  icon: string;
  color: string;
  renewable: number;
}

const MILESTONES: Milestone[] = [
  {
    year: 2025,
    title: 'Baseline Established',
    desc: 'Current state: 23% renewable, 18% waste. Platform launched.',
    icon: '📊',
    color: '#6B7280',
    renewable: 23,
  },
  {
    year: 2026,
    title: 'Solar Canopy Phase 1',
    desc: 'Downtown Core solar canopy network deployed. +42 MW capacity.',
    icon: '☀️',
    color: '#F59E0B',
    renewable: 29,
  },
  {
    year: 2027,
    title: 'LED Grid Rollout',
    desc: 'Smart LED streetlight grid citywide. -28 MW peak demand.',
    icon: '💡',
    color: '#14B8A6',
    renewable: 34,
  },
  {
    year: 2028,
    title: 'HVAC Retrofit Complete',
    desc: 'Westshore HVAC upgrade finished. -180 MWh/yr savings.',
    icon: '🏢',
    color: '#3B82F6',
    renewable: 40,
  },
  {
    year: 2030,
    title: 'EV Fleet Electrification',
    desc: 'City vehicle fleet fully electric. Wind micro-turbines online.',
    icon: '⚡',
    color: '#A78BFA',
    renewable: 51,
  },
  {
    year: 2032,
    title: 'Battery Storage Grid',
    desc: 'Channelside battery storage at scale. +34% renewable utilization.',
    icon: '🔋',
    color: '#14B8A6',
    renewable: 58,
  },
  {
    year: 2035,
    title: 'Offshore Wind Integration',
    desc: 'Gulf offshore wind feeds Tampa grid. Major renewable milestone.',
    icon: '🌬️',
    color: '#3B82F6',
    renewable: 68,
  },
  {
    year: 2040,
    title: 'Hydrogen Pilot Launch',
    desc: 'Green hydrogen pilots for heavy industry. Smart grid mesh complete.',
    icon: '🔬',
    color: '#F59E0B',
    renewable: 80,
  },
  {
    year: 2045,
    title: 'Net-Zero Buildings',
    desc: 'All new construction net-zero. Legacy retrofits 90% complete.',
    icon: '🏙️',
    color: '#14B8A6',
    renewable: 90,
  },
  {
    year: 2050,
    title: 'Full Grid Decarbonization',
    desc: 'Tampa grid fully decarbonized. Legacy fossil fuels retired.',
    icon: '🌿',
    color: '#14B8A6',
    renewable: 96,
  },
  {
    year: 2054,
    title: '100% Clean Energy',
    desc: 'Tampa reaches 100% renewable energy. Zero waste, full circularity.',
    icon: '🎯',
    color: '#14B8A6',
    renewable: 100,
  },
];

// Generate smooth projection data for the chart
function generateProjectionData() {
  const data: { year: number; renewable: number; projected: number }[] = [];
  for (let year = 2025; year <= 2054; year++) {
    const t = (year - 2025) / (2054 - 2025);
    // S-curve interpolation
    const eased = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    const projected = Math.round(23 + eased * (100 - 23));
    const isActual = year <= 2026;
    data.push({ year, renewable: isActual ? projected : 0, projected });
  }
  return data;
}

const PROJECTION_DATA = generateProjectionData();

function interpolateRenewable(year: number): number {
  const t = Math.max(0, Math.min(1, (year - 2025) / (2054 - 2025)));
  const eased = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  return Math.round(23 + eased * (100 - 23));
}

export default function RoadmapPage() {
  const [selectedYear, setSelectedYear] = useState(2030);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('roadmapYear');
      if (saved) setSelectedYear(parseInt(saved, 10));
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('roadmapYear', selectedYear.toString());
    } catch {}
  }, [selectedYear]);

  const renewableAtYear = interpolateRenewable(selectedYear);
  const progressPct = ((selectedYear - 2025) / (2054 - 2025)) * 100;

  const pastMilestones = MILESTONES.filter((m) => m.year <= selectedYear);
  const futureMilestones = MILESTONES.filter((m) => m.year > selectedYear);
  const nextMilestone = futureMilestones[0];

  return (
    <div style={{ padding: '28px 24px 60px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 800, margin: '0 0 4px', letterSpacing: '-0.02em', color: '#F9FAFB' }}>
          Clean Energy Roadmap
        </h1>
        <p style={{ fontSize: '13px', color: '#6B7280', margin: 0 }}>
          Tampa&apos;s pathway from 23% renewable (2025) to 100% clean energy by 2054
        </p>
      </div>

      {/* Year selector */}
      <div
        style={{
          backgroundColor: '#111827',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: '16px',
          padding: '22px 24px',
          marginBottom: '20px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ fontSize: '11px', color: '#6B7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
              Viewing Year
            </div>
            <div style={{ fontSize: '32px', fontWeight: 800, color: '#3B82F6', letterSpacing: '-0.03em', lineHeight: 1 }}>
              {selectedYear}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '11px', color: '#6B7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
              Projected Renewable
            </div>
            <div style={{ fontSize: '32px', fontWeight: 800, color: '#14B8A6', letterSpacing: '-0.03em', lineHeight: 1 }}>
              {renewableAtYear}%
            </div>
          </div>
        </div>

        {/* Slider */}
        <div style={{ marginBottom: '10px' }}>
          <input
            type="range"
            min={2025}
            max={2054}
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
            style={{ width: '100%', cursor: 'pointer', accentColor: '#3B82F6' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
            <span style={{ fontSize: '10px', color: '#6B7280' }}>2025</span>
            <span style={{ fontSize: '10px', color: '#6B7280' }}>2030</span>
            <span style={{ fontSize: '10px', color: '#6B7280' }}>2035</span>
            <span style={{ fontSize: '10px', color: '#6B7280' }}>2040</span>
            <span style={{ fontSize: '10px', color: '#6B7280' }}>2045</span>
            <span style={{ fontSize: '10px', color: '#6B7280' }}>2050</span>
            <span style={{ fontSize: '10px', color: '#6B7280' }}>2054</span>
          </div>
        </div>

        {/* Quick year buttons */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {[2025, 2028, 2030, 2035, 2040, 2045, 2050, 2054].map((y) => (
            <button
              key={y}
              onClick={() => setSelectedYear(y)}
              style={{
                padding: '4px 10px',
                borderRadius: '6px',
                border: selectedYear === y ? '1px solid rgba(59,130,246,0.4)' : '1px solid rgba(255,255,255,0.07)',
                backgroundColor: selectedYear === y ? 'rgba(59,130,246,0.12)' : 'transparent',
                color: selectedYear === y ? '#3B82F6' : '#9CA3AF',
                fontSize: '11px',
                fontWeight: selectedYear === y ? 700 : 400,
                cursor: 'pointer',
                transition: 'all 0.12s ease',
              }}
            >
              {y}
            </button>
          ))}
        </div>
      </div>

      {/* Progress + next milestone */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
        {/* Progress */}
        <div
          style={{
            backgroundColor: '#111827',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: '14px',
            padding: '18px 20px',
          }}
        >
          <div style={{ fontSize: '12px', fontWeight: 600, color: '#9CA3AF', marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Roadmap Progress
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { label: 'Journey Complete', value: progressPct, color: '#3B82F6' },
              { label: 'Renewable Energy', value: renewableAtYear, color: '#14B8A6' },
              { label: 'Waste Reduction', value: Math.min(100, Math.round(progressPct * 0.8)), color: '#F59E0B' },
              { label: 'Grid Modernization', value: Math.min(100, Math.round(progressPct * 0.9)), color: '#A78BFA' },
            ].map((bar) => (
              <div key={bar.label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontSize: '11.5px', color: '#9CA3AF' }}>{bar.label}</span>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: bar.color }}>{Math.round(bar.value)}%</span>
                </div>
                <div style={{ height: '6px', backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${bar.value}%`,
                      backgroundColor: bar.color,
                      borderRadius: '3px',
                      transition: 'width 0.4s ease',
                      boxShadow: `0 0 6px ${bar.color}40`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Next milestone */}
        <div
          style={{
            backgroundColor: '#111827',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: '14px',
            padding: '18px 20px',
          }}
        >
          <div style={{ fontSize: '12px', fontWeight: 600, color: '#9CA3AF', marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {nextMilestone ? 'Next Milestone' : 'Goal Achieved! 🎯'}
          </div>
          {nextMilestone ? (
            <>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', marginBottom: '16px' }}>
                <span style={{ fontSize: '28px' }}>{nextMilestone.icon}</span>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#F9FAFB', marginBottom: '4px' }}>
                    {nextMilestone.title}
                  </div>
                  <div style={{ fontSize: '11.5px', color: '#9CA3AF', lineHeight: 1.5 }}>
                    {nextMilestone.desc}
                  </div>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div
                  style={{
                    padding: '10px',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(59,130,246,0.08)',
                    border: '1px solid rgba(59,130,246,0.15)',
                  }}
                >
                  <div style={{ fontSize: '9px', color: '#6B7280', fontWeight: 600, marginBottom: '3px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Year</div>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: '#3B82F6' }}>{nextMilestone.year}</div>
                </div>
                <div
                  style={{
                    padding: '10px',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(20,184,166,0.08)',
                    border: '1px solid rgba(20,184,166,0.15)',
                  }}
                >
                  <div style={{ fontSize: '9px', color: '#6B7280', fontWeight: 600, marginBottom: '3px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Target</div>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: '#14B8A6' }}>{nextMilestone.renewable}%</div>
                </div>
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ fontSize: '40px', marginBottom: '8px' }}>🏆</div>
              <div style={{ fontSize: '13px', color: '#14B8A6', fontWeight: 600 }}>
                100% Clean Energy Achieved!
              </div>
              <div style={{ fontSize: '11.5px', color: '#6B7280', marginTop: '4px' }}>
                Tampa has completed its clean energy journey.
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Projection chart */}
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
            Renewable Energy Projection 2025–2054
          </div>
          <div style={{ fontSize: '11px', color: '#6B7280' }}>S-curve growth model · Target: 100% by 2054</div>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={PROJECTION_DATA} margin={{ top: 4, right: 20, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis
              dataKey="year"
              tick={{ fill: '#6B7280', fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              interval={4}
            />
            <YAxis
              tick={{ fill: '#6B7280', fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              domain={[0, 100]}
              tickFormatter={(v) => `${v}%`}
              width={36}
            />
            <Tooltip
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              formatter={(value: any) => [`${value}%`, 'Renewable']}
              labelFormatter={(l) => `Year: ${l}`}
              contentStyle={{
                backgroundColor: '#1F2937',
                border: '1px solid rgba(20,184,166,0.25)',
                borderRadius: '8px',
                fontSize: '12px',
                color: '#F9FAFB',
              }}
            />
            <ReferenceLine x={selectedYear} stroke="rgba(59,130,246,0.5)" strokeDasharray="4 4" label={{ value: `${selectedYear}`, fill: '#3B82F6', fontSize: 9 }} />
            <ReferenceLine y={50} stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
            <Line
              type="monotone"
              dataKey="projected"
              stroke="#14B8A6"
              strokeWidth={2}
              dot={false}
              strokeDasharray="5 3"
              opacity={0.5}
            />
            <Line
              type="monotone"
              dataKey="renewable"
              stroke="#3B82F6"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 4, fill: '#3B82F6', stroke: '#fff', strokeWidth: 1.5 }}
            />
          </LineChart>
        </ResponsiveContainer>
        <div style={{ display: 'flex', gap: '16px', marginTop: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '16px', height: '2.5px', backgroundColor: '#3B82F6' }} />
            <span style={{ fontSize: '10px', color: '#6B7280' }}>Actual / Near-term</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '16px', height: '2px', backgroundColor: '#14B8A6', opacity: 0.5 }} />
            <span style={{ fontSize: '10px', color: '#6B7280' }}>Projected trajectory</span>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div
        style={{
          backgroundColor: '#111827',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: '14px',
          padding: '18px 20px',
        }}
      >
        <div style={{ fontSize: '13px', fontWeight: 700, color: '#F9FAFB', marginBottom: '18px' }}>
          Milestone Timeline
        </div>
        <div style={{ position: 'relative' }}>
          {/* Vertical line */}
          <div
            style={{
              position: 'absolute',
              left: '16px',
              top: '8px',
              bottom: '8px',
              width: '1px',
              backgroundColor: 'rgba(255,255,255,0.06)',
            }}
          />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {MILESTONES.map((milestone) => {
              const isPast = milestone.year <= selectedYear;
              const isCurrent = pastMilestones[pastMilestones.length - 1]?.year === milestone.year;

              return (
                <div
                  key={milestone.year}
                  style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', paddingLeft: '0' }}
                >
                  {/* Dot */}
                  <div
                    style={{
                      width: '33px',
                      flexShrink: 0,
                      display: 'flex',
                      justifyContent: 'center',
                      paddingTop: '4px',
                      zIndex: 1,
                    }}
                  >
                    <div
                      style={{
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        backgroundColor: isPast ? milestone.color : 'rgba(255,255,255,0.1)',
                        border: isCurrent ? `2px solid ${milestone.color}` : 'none',
                        boxShadow: isCurrent ? `0 0 8px ${milestone.color}60` : 'none',
                        transition: 'all 0.3s ease',
                        flexShrink: 0,
                      }}
                    />
                  </div>

                  {/* Content */}
                  <div
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      borderRadius: '10px',
                      backgroundColor: isCurrent
                        ? `${milestone.color}12`
                        : isPast
                        ? 'rgba(255,255,255,0.03)'
                        : 'transparent',
                      border: isCurrent
                        ? `1px solid ${milestone.color}30`
                        : '1px solid transparent',
                      opacity: !isPast && !isCurrent ? 0.45 : 1,
                      transition: 'all 0.3s ease',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '14px' }}>{milestone.icon}</span>
                        <span style={{ fontSize: '12.5px', fontWeight: 700, color: isPast ? '#F9FAFB' : '#6B7280' }}>
                          {milestone.title}
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexShrink: 0 }}>
                        <span
                          style={{
                            fontSize: '10px',
                            fontWeight: 700,
                            color: milestone.color,
                            opacity: isPast ? 1 : 0.5,
                          }}
                        >
                          {milestone.renewable}%
                        </span>
                        <span
                          style={{
                            padding: '2px 7px',
                            borderRadius: '10px',
                            backgroundColor: 'rgba(255,255,255,0.05)',
                            fontSize: '10px',
                            fontWeight: 600,
                            color: isPast ? milestone.color : '#6B7280',
                          }}
                        >
                          {milestone.year}
                        </span>
                      </div>
                    </div>
                    <div style={{ fontSize: '11px', color: '#6B7280', lineHeight: 1.45 }}>
                      {milestone.desc}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
