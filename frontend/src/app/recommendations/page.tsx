'use client';

import { useState } from 'react';
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { PROJECTS, DISTRICTS, Project } from '@/lib/districts';
import NoDataGate from '@/components/NoDataGate';

type SortKey = 'score' | 'costScore' | 'speed' | 'efficiency';
type FilterType = 'all' | 'solar' | 'efficiency' | 'wind' | 'storage' | 'grid';

const TYPE_COLOR: Record<string, string> = {
  solar: '#F59E0B',
  efficiency: '#14B8A6',
  wind: '#3B82F6',
  storage: '#A78BFA',
  grid: '#6B7280',
};

const TYPE_ICON: Record<string, string> = {
  solar: '☀️',
  efficiency: '💡',
  wind: '🌬️',
  storage: '🔋',
  grid: '🔌',
};

function ScoreBadge({ score }: { score: number }) {
  const color = score >= 90 ? '#14B8A6' : score >= 80 ? '#3B82F6' : '#F59E0B';
  return (
    <div
      style={{
        width: '48px',
        height: '48px',
        borderRadius: '12px',
        backgroundColor: `${color}18`,
        border: `2px solid ${color}40`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        flexShrink: 0,
      }}
    >
      <span style={{ fontSize: '16px', fontWeight: 800, color, lineHeight: 1 }}>{score}</span>
      <span style={{ fontSize: '8px', color: '#6B7280', fontWeight: 500 }}>SCORE</span>
    </div>
  );
}

function RadarCard({ project }: { project: Project }) {
  const data = [
    { metric: 'Efficiency', value: project.efficiency },
    { metric: 'Cost', value: project.costScore },
    { metric: 'Speed', value: project.speed },
    { metric: 'Overall', value: project.score },
  ];
  const color = TYPE_COLOR[project.type];

  return (
    <ResponsiveContainer width="100%" height={160}>
      <RadarChart data={data} margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
        <PolarGrid stroke="rgba(255,255,255,0.08)" />
        <PolarAngleAxis
          dataKey="metric"
          tick={{ fill: '#6B7280', fontSize: 9 }}
        />
        <Radar
          name={project.name}
          dataKey="value"
          stroke={color}
          fill={color}
          fillOpacity={0.18}
          strokeWidth={1.5}
        />
        <Tooltip
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          formatter={(v: any) => [`${v}/100`]}
          contentStyle={{
            backgroundColor: '#1F2937',
            border: `1px solid ${color}40`,
            borderRadius: '8px',
            fontSize: '11px',
            color: '#F9FAFB',
          }}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}

export default function RecommendationsPage() {
  const [sortKey, setSortKey] = useState<SortKey>('score');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filtered = PROJECTS
    .filter((p) => filterType === 'all' || p.type === filterType)
    .sort((a, b) => b[sortKey] - a[sortKey]);

  const totalCost = PROJECTS.reduce((acc, p) => {
    const match = p.cost.match(/\$([\d.]+)M/);
    return acc + (match ? parseFloat(match[1]) : 0);
  }, 0);

  const getDistrictName = (id: string) =>
    DISTRICTS.find((d) => d.id === id)?.name ?? id;

  return (
    <NoDataGate>
    <div style={{ padding: '28px 24px 60px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 800, margin: '0 0 4px', letterSpacing: '-0.02em', color: '#F9FAFB' }}>
          Optimization Recommendations
        </h1>
        <p style={{ fontSize: '13px', color: '#6B7280', margin: 0 }}>
          AI-scored projects ranked by impact, cost efficiency, and implementation speed
        </p>
      </div>

      {/* Summary cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: '12px',
          marginBottom: '24px',
        }}
      >
        {[
          { label: 'Total Projects', value: PROJECTS.length, unit: '', color: '#3B82F6', bg: 'rgba(59,130,246,0.08)', border: 'rgba(59,130,246,0.2)' },
          { label: 'Total Investment', value: `$${totalCost.toFixed(1)}M`, unit: '', color: '#F59E0B', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.2)' },
          { label: 'Avg Score', value: Math.round(PROJECTS.reduce((a, p) => a + p.score, 0) / PROJECTS.length), unit: '/100', color: '#14B8A6', bg: 'rgba(20,184,166,0.08)', border: 'rgba(20,184,166,0.2)' },
          { label: 'Top Score', value: Math.max(...PROJECTS.map((p) => p.score)), unit: '/100', color: '#A78BFA', bg: 'rgba(167,139,250,0.08)', border: 'rgba(167,139,250,0.2)' },
        ].map((card) => (
          <div
            key={card.label}
            style={{
              backgroundColor: card.bg,
              border: `1px solid ${card.border}`,
              borderRadius: '12px',
              padding: '14px 16px',
            }}
          >
            <div style={{ fontSize: '10px', color: '#6B7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '5px' }}>
              {card.label}
            </div>
            <div style={{ fontSize: '22px', fontWeight: 800, color: card.color, letterSpacing: '-0.02em' }}>
              {card.value}
              {card.unit && <span style={{ fontSize: '12px', fontWeight: 500, opacity: 0.7 }}>{card.unit}</span>}
            </div>
          </div>
        ))}
      </div>

      {/* Filters & sort */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '10px',
          marginBottom: '20px',
          alignItems: 'center',
        }}
      >
        {/* Type filter */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {(['all', 'solar', 'efficiency', 'wind', 'storage', 'grid'] as FilterType[]).map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              style={{
                padding: '5px 12px',
                borderRadius: '20px',
                border: filterType === t
                  ? `1px solid ${t === 'all' ? '#3B82F6' : TYPE_COLOR[t]}60`
                  : '1px solid rgba(255,255,255,0.07)',
                backgroundColor: filterType === t
                  ? t === 'all' ? 'rgba(59,130,246,0.12)' : `${TYPE_COLOR[t]}15`
                  : 'transparent',
                color: filterType === t
                  ? t === 'all' ? '#3B82F6' : TYPE_COLOR[t]
                  : '#9CA3AF',
                fontSize: '11.5px',
                fontWeight: filterType === t ? 600 : 400,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                textTransform: 'capitalize',
              }}
            >
              {t === 'all' ? 'All Types' : `${TYPE_ICON[t]} ${t}`}
            </button>
          ))}
        </div>

        {/* Sort */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginLeft: 'auto' }}>
          <span style={{ fontSize: '11px', color: '#6B7280' }}>Sort by</span>
          {([
            { key: 'score', label: 'Score' },
            { key: 'efficiency', label: 'Efficiency' },
            { key: 'costScore', label: 'Cost' },
            { key: 'speed', label: 'Speed' },
          ] as { key: SortKey; label: string }[]).map((opt) => (
            <button
              key={opt.key}
              onClick={() => setSortKey(opt.key)}
              style={{
                padding: '4px 10px',
                borderRadius: '6px',
                border: sortKey === opt.key ? '1px solid rgba(59,130,246,0.3)' : '1px solid rgba(255,255,255,0.07)',
                backgroundColor: sortKey === opt.key ? 'rgba(59,130,246,0.1)' : 'transparent',
                color: sortKey === opt.key ? '#3B82F6' : '#9CA3AF',
                fontSize: '11px',
                fontWeight: sortKey === opt.key ? 600 : 400,
                cursor: 'pointer',
                transition: 'all 0.12s ease',
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Project cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {filtered.map((project, rank) => {
          const isSelected = selectedId === project.id;
          const typeColor = TYPE_COLOR[project.type];

          return (
            <div
              key={project.id}
              className="card-hover"
              style={{
                backgroundColor: '#111827',
                border: isSelected
                  ? `1px solid ${typeColor}40`
                  : '1px solid rgba(255,255,255,0.07)',
                borderRadius: '14px',
                overflow: 'hidden',
                cursor: 'pointer',
                transition: 'border-color 0.15s ease',
              }}
              onClick={() => setSelectedId(isSelected ? null : project.id)}
            >
              {/* Card header */}
              <div style={{ padding: '16px 20px', display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                {/* Rank + score */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
                  <div style={{ fontSize: '10px', color: '#6B7280', fontWeight: 600 }}>#{rank + 1}</div>
                  <ScoreBadge score={project.score} />
                </div>

                {/* Main content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '14px', fontWeight: 700, color: '#F9FAFB' }}>
                      {project.name}
                    </span>
                    <span
                      style={{
                        padding: '2px 8px',
                        borderRadius: '12px',
                        backgroundColor: `${typeColor}18`,
                        border: `1px solid ${typeColor}35`,
                        color: typeColor,
                        fontSize: '10px',
                        fontWeight: 600,
                        textTransform: 'capitalize',
                        flexShrink: 0,
                      }}
                    >
                      {TYPE_ICON[project.type]} {project.type}
                    </span>
                  </div>

                  <div style={{ fontSize: '11px', color: '#6B7280', marginBottom: '10px' }}>
                    📍 {getDistrictName(project.districtId)}
                  </div>

                  {/* Stats row */}
                  <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                    {[
                      { label: 'Cost', value: project.cost, color: '#F59E0B' },
                      { label: 'Timeline', value: project.time, color: '#A78BFA' },
                      { label: 'Impact', value: project.impact, color: typeColor },
                    ].map((stat) => (
                      <div key={stat.label}>
                        <div style={{ fontSize: '9px', color: '#6B7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '2px' }}>
                          {stat.label}
                        </div>
                        <div style={{ fontSize: '12.5px', fontWeight: 700, color: stat.color }}>
                          {stat.value}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Score bars */}
                <div style={{ width: '120px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {[
                    { label: 'Efficiency', value: project.efficiency, color: typeColor },
                    { label: 'Cost', value: project.costScore, color: '#F59E0B' },
                    { label: 'Speed', value: project.speed, color: '#A78BFA' },
                  ].map((bar) => (
                    <div key={bar.label}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                        <span style={{ fontSize: '9px', color: '#6B7280' }}>{bar.label}</span>
                        <span style={{ fontSize: '9px', color: '#9CA3AF', fontWeight: 600 }}>{bar.value}</span>
                      </div>
                      <div style={{ height: '3px', backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: '2px', overflow: 'hidden' }}>
                        <div
                          style={{
                            height: '100%',
                            width: `${bar.value}%`,
                            backgroundColor: bar.color,
                            borderRadius: '2px',
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Expand chevron */}
                <div
                  style={{
                    fontSize: '12px',
                    color: '#6B7280',
                    transform: isSelected ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s ease',
                    flexShrink: 0,
                    marginTop: '4px',
                  }}
                >
                  ▾
                </div>
              </div>

              {/* Expanded radar */}
              {isSelected && (
                <div
                  style={{
                    borderTop: `1px solid rgba(255,255,255,0.06)`,
                    padding: '16px 20px',
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '20px',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '11px', fontWeight: 600, color: '#9CA3AF', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Performance Radar
                    </div>
                    <RadarCard project={project} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '10px' }}>
                    <div style={{ fontSize: '11px', fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
                      Implementation Details
                    </div>
                    {[
                      { label: 'District', value: getDistrictName(project.districtId) },
                      { label: 'Project Type', value: `${TYPE_ICON[project.type]} ${project.type}`, capitalize: true },
                      { label: 'Estimated Cost', value: project.cost },
                      { label: 'Timeline', value: project.time },
                      { label: 'Expected Impact', value: project.impact },
                    ].map((row) => (
                      <div
                        key={row.label}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '7px 10px',
                          borderRadius: '7px',
                          backgroundColor: 'rgba(255,255,255,0.03)',
                          border: '1px solid rgba(255,255,255,0.05)',
                        }}
                      >
                        <span style={{ fontSize: '11px', color: '#6B7280' }}>{row.label}</span>
                        <span
                          style={{
                            fontSize: '11.5px',
                            fontWeight: 600,
                            color: '#F9FAFB',
                            textTransform: row.capitalize ? 'capitalize' : 'none',
                          }}
                        >
                          {row.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
    </NoDataGate>
  );
}
