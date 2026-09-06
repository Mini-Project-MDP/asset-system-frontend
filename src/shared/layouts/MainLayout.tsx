import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router'
import { Input } from 'antd'
import { SearchOutlined } from '@ant-design/icons'

interface MainLayoutProps {
  children: React.ReactNode
}

export default function MainLayout({ children }: MainLayoutProps) {
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'light')
  }, [])

  const modules = [
    {
      key: '/',
      label: 'Dashboard',
      icon: (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <rect x="3" y="3" width="7" height="7" rx="1.5" />
          <rect x="14" y="3" width="7" height="7" rx="1.5" />
          <rect x="14" y="14" width="7" height="7" rx="1.5" />
          <rect x="3" y="14" width="7" height="7" rx="1.5" />
        </svg>
      ),
    },
    {
      key: '/requests',
      label: 'Requests',
      icon: (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
          <polyline points="14 2 14 8 20 8" />
        </svg>
      ),
    },
    {
      key: '/approvals',
      label: 'Approvals',
      badge: 3,
      icon: (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
      ),
    },
    {
      key: '/fulfillment',
      label: 'Fulfillment',
      icon: (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <rect x="1" y="3" width="15" height="13" rx="2" />
          <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
          <circle cx="5.5" cy="18.5" r="2.5" />
          <circle cx="18.5" cy="18.5" r="2.5" />
        </svg>
      ),
    },
    {
      key: '/settings',
      label: 'Settings',
      icon: (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
        </svg>
      ),
    },
  ]

  const getCurrentPageTitle = () => {
    switch (location.pathname) {
      case '/requests':
        return 'Requests'
      case '/approvals':
        return 'Approvals'
      case '/fulfillment':
        return 'Fulfillment'
      case '/settings':
        return 'Settings'
      default:
        return 'Dashboard'
    }
  }

  return (
    <div className="app">
      {/* Brand Corner */}
      <div className="brand">
        <div className="logo" />
        <div className="name">
          SYSTEM SUPPORT<small>Asset Management</small>
        </div>
      </div>

      {/* Topbar Header */}
      <header className="top">
        <div className="crumb">
          <b>{getCurrentPageTitle()}</b>
        </div>
        <div className="search">
          <Input
            placeholder="Cari REQ-ID, outlet, barcode…"
            prefix={<SearchOutlined style={{ color: 'var(--faint)' }} />}
            allowClear
          />
        </div>

        <div className="rolesw">
          <button>
            <span className="avatar">AD</span>
            <span className="rl">
              <b>Admin</b>
              <span>Full access</span>
            </span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--faint)" strokeWidth="2">
              <path d="M6 9l6 6 6-6" />
            </svg>
          </button>
        </div>
      </header>

      {/* Sidebar Nav */}
      <nav className="nav">
        <div className="lab eyebrow">Modules</div>
        {modules.map((m) => {
          const isActive = location.pathname === m.key
          return (
            <a
              key={m.key}
              href={m.key}
              className={isActive ? 'active' : ''}
              onClick={(e) => {
                e.preventDefault()
                navigate(m.key)
              }}
            >
              {m.icon}
              <span>{m.label}</span>
              {m.badge && <span className="badge">{m.badge}</span>}
            </a>
          )
        })}
        <div className="foot">
          Signed in as<br />
          <span className="mono">Admin</span><br />
          {new Date().toLocaleDateString('en-GB', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="main" id="main">
        {children}
      </main>
    </div>
  )
}
