'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/map', label: 'Map' },
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/recommendations', label: 'Recommendations' },
  { href: '/roadmap', label: 'Roadmap' },
  { href: '/chat', label: 'Chat' },
];

export default function Navbar() {
  const pathname = usePathname();

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

      {/* Right — Status Badge */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          flexShrink: 0,
        }}
      >
        {/* Green dot */}
        <div
          style={{
            width: '5px',
            height: '5px',
            borderRadius: '50%',
            backgroundColor: '#14B8A6',
            boxShadow: '0 0 6px rgba(20,184,166,0.6)',
            flexShrink: 0,
          }}
        />
        {/* Teal pill badge */}
        <span
          style={{
            fontSize: '11px',
            fontWeight: 500,
            color: '#14B8A6',
            backgroundColor: 'rgba(20,184,166,0.12)',
            border: '1px solid rgba(20,184,166,0.25)',
            padding: '2px 8px',
            borderRadius: '20px',
            whiteSpace: 'nowrap',
            letterSpacing: '0.01em',
          }}
        >
          Downtown Tampa · Data Loaded
        </span>
      </div>
    </nav>
  );
}
