import React from 'react'
import type { StatCardData } from '../types'

interface StatCardProps {
  data: StatCardData
}

export default function StatCard({ data }: StatCardProps) {
  const getIconAndColors = () => {
    switch (data.category) {
      case 'total':
        return {
          col: 'var(--brand)',
          bg: 'var(--brand-050)',
          icon: (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
          ),
        }
      case 'pending':
        return {
          col: 'var(--warn)',
          bg: 'var(--warn-050)',
          icon: (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          ),
        }
      case 'in_progress':
        return {
          col: 'var(--brand)',
          bg: 'var(--brand-050)',
          icon: (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="1" y="3" width="15" height="13" rx="2" />
              <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
              <circle cx="5.5" cy="18.5" r="2.5" />
              <circle cx="18.5" cy="18.5" r="2.5" />
            </svg>
          ),
        }
      case 'assets':
      default:
        return {
          col: 'var(--go)',
          bg: 'var(--go-050)',
          icon: (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
            </svg>
          ),
        }
    }
  }

  const { col, bg, icon } = getIconAndColors()

  return (
    <div className="stat">
      <div className="k">
        <span className="ic" style={{ background: bg, color: col }}>
          {icon}
        </span>
        {data.title}
      </div>
      <div className="v">{data.value}</div>
      <div className="sub">{data.subtitle}</div>
    </div>
  )
}
