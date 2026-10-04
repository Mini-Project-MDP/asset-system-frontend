import React, { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router'
import { Input, Dropdown, Tag } from 'antd'
import type { MenuProps } from 'antd'
import { SearchOutlined, LogoutOutlined, UserOutlined, CrownOutlined, SettingOutlined } from '@ant-design/icons'
import { useAuth } from '@/shared/context/AuthContext'
import { useModuleAccess } from '@/shared/hooks/useModuleAccess'
import { useNavigationBadges } from '@/shared/hooks/useNavigationBadges'
import { buildBreadcrumb } from '@/shared/navigation/breadcrumb'
import { findModule, type ModuleKey } from '@/shared/navigation/modules'

interface MainLayoutProps {
  children: React.ReactNode
}

export default function MainLayout({ children }: MainLayoutProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout, isAuthenticated } = useAuth()
  const { allowed, canOpen } = useModuleAccess()
  const { data: badges } = useNavigationBadges(isAuthenticated)

  const [searchText, setSearchText] = useState('')

  // Only the light theme exists: the stylesheet has no dark palette yet.
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'light')
  }, [])

  const badgeFor = (key: ModuleKey): number | undefined => {
    if (key === 'approvals') return badges?.approvals
    if (key === 'fulfillment') return badges?.fulfillment
    return undefined
  }

  const activeModule = findModule(location.pathname)
  const crumbs = buildBreadcrumb(location.pathname, location.search)

  // The search looks through requests, so it is offered to those who can open them.
  const canSearch = canOpen('requests')
  const submitSearch = (value: string) => {
    const text = value.trim()
    navigate(text ? `/requests?q=${encodeURIComponent(text)}` : '/requests')
  }

  const primaryRole = user?.roles?.[0]?.name || (user?.is_master ? 'Master Admin' : 'User')
  const userInitials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'US'

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: (
        <div>
          <div className="font-semibold text-slate-800">{user?.name}</div>
          <div className="text-xs text-slate-500">{user?.email}</div>
        </div>
      ),
    },
    ...(canOpen('settings')
      ? [
          { type: 'divider' as const },
          {
            key: 'settings',
            icon: <SettingOutlined />,
            label: 'Account & Settings',
            onClick: () => navigate('/settings'),
          },
        ]
      : []),
    { type: 'divider' },
    {
      key: 'logout',
      icon: <LogoutOutlined className="text-red-500" />,
      label: <span className="text-red-600 font-medium">Sign Out</span>,
      onClick: () => {
        logout()
        navigate('/login')
      },
    },
  ]

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
        <nav className="crumb" aria-label="Breadcrumb">
          {crumbs.map((crumb, i) => (
            <React.Fragment key={i}>
              {i > 0 && (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M9 6l6 6-6 6" />
                </svg>
              )}
              {crumb.to ? (
                <a
                  href={crumb.to}
                  onClick={(e) => {
                    e.preventDefault()
                    navigate(crumb.to as string)
                  }}
                >
                  {crumb.label}
                </a>
              ) : (
                <b>{crumb.label}</b>
              )}
            </React.Fragment>
          ))}
        </nav>
        {canSearch && (
          <div className="search">
            <Input
              placeholder="Search REQ-ID, outlet, barcode…"
              prefix={<SearchOutlined style={{ color: 'var(--faint)' }} />}
              allowClear
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onPressEnter={() => submitSearch(searchText)}
            />
          </div>
        )}

        <div className="rolesw">
          <Dropdown menu={{ items: userMenuItems }} trigger={['click']} placement="bottomRight">
            <button className="flex items-center gap-2 border-none bg-transparent cursor-pointer">
              <span className="avatar bg-blue-600 text-white font-bold">{userInitials}</span>
              <span className="rl text-left">
                <b className="flex items-center gap-1">
                  {user?.name || 'User'}
                  {user?.is_master && (
                    <Tag color="gold" className="m-0 text-[10px] px-1 py-0 border-none">
                      <CrownOutlined /> MASTER
                    </Tag>
                  )}
                </b>
                <span>{primaryRole}</span>
              </span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--faint)" strokeWidth="2">
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>
          </Dropdown>
        </div>
      </header>

      {/* Sidebar Nav: only the modules this user may open */}
      <nav className="nav">
        <div className="lab eyebrow">Modules</div>
        {allowed.map((m) => {
          const badge = badgeFor(m.key)
          return (
            <a
              key={m.key}
              href={m.path}
              className={activeModule?.key === m.key ? 'active' : ''}
              onClick={(e) => {
                e.preventDefault()
                navigate(m.path)
              }}
            >
              {m.icon}
              <span>{m.label}</span>
              {badge !== undefined && badge > 0 && <span className="badge">{badge}</span>}
            </a>
          )
        })}
        <div className="foot">
          Signed in as<br />
          <span className="mono font-semibold">{user?.email || 'User'}</span><br />
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
