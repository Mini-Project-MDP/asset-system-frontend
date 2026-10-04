import { findModule } from './modules'

export interface Crumb {
  label: string
  /** Where the crumb links to; absent for the current page. */
  to?: string
}

const SETTINGS_TABS: Record<string, string> = {
  outlets: 'Outlets',
  distributors: 'Distributors',
  types: 'Asset types',
  flow: 'Approval flow',
  users: 'Users & roles',
}

/**
 * The breadcrumb for a location: the module, then the sub-page when there is
 * one (a request id, "New request", or the active Settings tab).
 */
export function buildBreadcrumb(pathname: string, search: string): Crumb[] {
  const module = findModule(pathname)
  if (!module) return [{ label: 'Dashboard' }]

  const rest = pathname === module.path ? '' : pathname.slice(module.path.length + 1)
  if (module.key === 'settings') {
    const tab = new URLSearchParams(search).get('tab')
    const tabLabel = tab ? SETTINGS_TABS[tab] : undefined
    return tabLabel ? [{ label: module.label, to: module.path }, { label: tabLabel }] : [{ label: module.label }]
  }
  if (!rest) return [{ label: module.label }]
  return [{ label: module.label, to: module.path }, { label: rest === 'new' ? 'New request' : decodeURIComponent(rest) }]
}
