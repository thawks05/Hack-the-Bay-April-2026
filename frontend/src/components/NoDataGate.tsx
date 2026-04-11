'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { fetchUploads } from '@/lib/api';

/**
 * Wraps page content and shows an upload prompt if no CSV files have been loaded.
 * Once files are uploaded, renders children normally.
 */
export default function NoDataGate({ children }: { children: React.ReactNode }) {
  const [checked, setChecked] = useState(false);
  const [hasData, setHasData] = useState(false);

  useEffect(() => {
    fetchUploads().then((uploads) => {
      setHasData(Object.keys(uploads).length > 0);
      setChecked(true);
    });
  }, []);

  if (!checked) {
    // Brief loading state — avoid flash
    return (
      <div
        style={{
          minHeight: '100vh',
          backgroundColor: '#0A0F1E',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      />
    );
  }

  if (!hasData) {
    return (
      <div
        style={{
          minHeight: '100vh',
          backgroundColor: '#0A0F1E',
          color: '#F9FAFB',
          fontFamily: 'Inter, system-ui, sans-serif',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          paddingTop: '52px',
        }}
      >
        <div style={{ textAlign: 'center', maxWidth: '400px', padding: '0 24px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📂</div>
          <h2
            style={{
              fontSize: '20px',
              fontWeight: 700,
              color: '#F9FAFB',
              margin: '0 0 10px',
            }}
          >
            No data loaded yet
          </h2>
          <p
            style={{
              fontSize: '13px',
              color: '#6B7280',
              lineHeight: 1.6,
              margin: '0 0 24px',
            }}
          >
            Upload your energy CSV files and zone boundaries first.
            This page will populate automatically once data is loaded.
          </p>
          <Link
            href="/onboarding"
            style={{
              display: 'inline-block',
              padding: '10px 24px',
              backgroundColor: '#2563EB',
              color: '#fff',
              borderRadius: '8px',
              textDecoration: 'none',
              fontSize: '13px',
              fontWeight: 600,
            }}
          >
            Go to Data Onboarding
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
