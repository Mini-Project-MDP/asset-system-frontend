import type { ReactNode } from 'react'

export type ModuleKey = 'dashboard' | 'requests' | 'approvals' | 'fulfillment' | 'settings'

/** Answers "does the signed-in user hold this permission?". */
export type PermissionCheck = (code: string) => boolean

export interface AppModule {
  key: ModuleKey
  path: string
  label: string
  icon: ReactNode
  /**
   * Who may open the module, by permission (never by role name): the backend
   * grants these permissions per the access matrix of the requirement document
   * and enforces the same ones on its endpoints.
   */
  isAllowed: (can: PermissionCheck) => boolean
}

const svgProps = { width: 17, height: 17, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8 } as const

export const APP_MODULES: AppModule[] = [
  {
    key: 'dashboard',
    path: '/',
    label: 'Dashboard',
    isAllowed: (can) => can('dashboard:read'),
    icon: (
      <svg {...svgProps}>
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
      </svg>
    ),
  },
  {
    key: 'requests',
    path: '/requests',
    label: 'Requests',
    isAllowed: (can) => can('request:read'),
    icon: (
      <svg {...svgProps}>
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
        <polyline points="14 2 14 8 20 8" />
      </svg>
    ),
  },
  {
    key: 'approvals',
    path: '/approvals',
    label: 'Approvals',
    isAllowed: (can) => can('approvals:read'),
    icon: (
      <svg {...svgProps}>
        <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    ),
  },
  {
    key: 'fulfillment',
    path: '/fulfillment',
    label: 'Fulfillment',
    isAllowed: (can) => can('fulfillment:read'),
    icon: (
      <svg {...svgProps}>
        <rect x="1" y="3" width="15" height="13" rx="2" />
        <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
        <circle cx="5.5" cy="18.5" r="2.5" />
        <circle cx="18.5" cy="18.5" r="2.5" />
      </svg>
    ),
  },
  {
    key: 'settings',
    path: '/settings',
    label: 'Settings',
    // Settings holds several areas, each with its own permission; the module opens for any of them.
    // Managing users and roles is the Admin's (reading the user list is not enough).
    isAllowed: (can) =>
      can('settings:manage') || can('masterdata:manage') || can('user:write') || can('role:manage'),
    icon: (
      <svg {...svgProps}>
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
      </svg>
    ),
  },
]

/** The module a path belongs to ("/" is the Dashboard only, the others own their sub-paths). */
export function findModule(pathname: string): AppModule | undefined {
  if (pathname === '/') return APP_MODULES[0]
  return APP_MODULES.find((m) => m.path !== '/' && (pathname === m.path || pathname.startsWith(m.path + '/')))
}
