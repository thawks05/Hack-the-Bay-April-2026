'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { backendStatus, fetchUploads } from '@/lib/api';

const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/map', label: 'Map' },
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/recommendations', label: 'Recommendations' },
  { href: '/roadmap', label: 'Roadmap' },
  { href: '/chat', label: 'Chat' },
  { href: '/onboarding', label: 'Data Onboarding' },
];

export default function Navbar() {
  const pathname = usePathname();
  const [apiOnline, setApiOnline] = useState<boolean | null>(null);
  const [uploadCount, setUploadCount] = useState<number | null>(null);

  useEffect(() => {
    backendStatus().then(setApiOnline);
    fetchUploads().then((u) => setUploadCount(Object.keys(u).length));
    const interval = setInterval(() => {
      backendStatus().then(setApiOnline);
      fetchUploads().then((u) => setUploadCount(Object.keys(u).length));
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <nav
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '52px',
        backgroundColor: '#0D1526',
        borderBottom: '1px solid rgba(59,130,246,0.2)',
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 20px',
      }}
    >
      {/* Left — Logo */}
      <Link
        href="/"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          textDecoration: 'none',
          flexShrink: 0,
        }}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M13 2L3 14H12L11 22L21 10H12L13 2Z"
            fill="#3B82F6"
            stroke="#3B82F6"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span
          style={{
            fontSize: '13px',
            fontWeight: 700,
            color: '#F9FAFB',
            letterSpacing: '-0.01em',
            whiteSpace: 'nowrap',
          }}
        >
          Tampa Energy Intelligence
        </span>
      </Link>

      {/* Center — Nav Links */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '2px',
          position: 'absolute',
          left: '50%',
          transform: 'translateX(-50%)',
        }}
      >
        {NAV_LINKS.map((link) => {
          const isActive =
            link.href === '/'
              ? pathname === '/'
              : pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              style={{
                fontSize: '13px',
                fontWeight: isActive ? 600 : 400,
                color: isActive ? '#3B82F6' : '#9CA3AF',
                backgroundColor: isActive
                  ? 'rgba(59,130,246,0.1)'
                  : 'transparent',
                padding: '4px 12px',
                borderRadius: '6px',
                textDecoration: 'none',
                transition: 'color 0.15s ease, background-color 0.15s ease',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.color = '#D1D5DB';
                  e.currentTarget.style.backgroundColor =
                    'rgba(255,255,255,0.04)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.color = '#9CA3AF';
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              {link.label}
            </Link>
          );
        })}
      </div>

      {/* Right — Status Badges */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
        {/* API status pill */}
        {apiOnline !== null && (
          <span
            title={apiOnline ? 'Python API connected' : 'Python API offline — using static data'}
            style={{
              fontSize: '11px',
              fontWeight: 500,
              color: apiOnline ? '#14B8A6' : '#F59E0B',
              backgroundColor: apiOnline ? 'rgba(20,184,166,0.1)' : 'rgba(245,158,11,0.1)',
              border: `1px solid ${apiOnline ? 'rgba(20,184,166,0.25)' : 'rgba(245,158,11,0.25)'}`,
              padding: '2px 8px',
              borderRadius: '20px',
              whiteSpace: 'nowrap',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
            }}
          >
            <span
              style={{
                width: '5px',
                height: '5px',
                borderRadius: '50%',
                backgroundColor: apiOnline ? '#14B8A6' : '#F59E0B',
                display: 'inline-block',
                boxShadow: `0 0 5px ${apiOnline ? 'rgba(20,184,166,0.6)' : 'rgba(245,158,11,0.6)'}`,
              }}
            />
            API {apiOnline ? 'Online' : 'Offline'}
          </span>
        )}
        {/* Data loaded pill */}
        {uploadCount !== null && (
          <Link
            href="/onboarding"
            style={{ textDecoration: 'none' }}
            title={uploadCount > 0 ? `${uploadCount} file${uploadCount !== 1 ? 's' : ''} loaded` : 'No data loaded — click to upload'}
          >
            <span
              style={{
                fontSize: '11px',
                fontWeight: 500,
                color: uploadCount > 0 ? '#14B8A6' : '#F59E0B',
                backgroundColor: uploadCount > 0 ? 'rgba(20,184,166,0.12)' : 'rgba(245,158,11,0.1)',
                border: `1px solid ${uploadCount > 0 ? 'rgba(20,184,166,0.25)' : 'rgba(245,158,11,0.25)'}`,
                padding: '2px 8px',
                borderRadius: '20px',
                whiteSpace: 'nowrap',
                letterSpacing: '0.01em',
                cursor: 'pointer',
              }}
            >
              {uploadCount > 0
                ? `${uploadCount} file${uploadCount !== 1 ? 's' : ''} loaded`
                : 'No data — Upload'}
            </span>
          </Link>
        )}
      </div>
    </nav>
  );
}
