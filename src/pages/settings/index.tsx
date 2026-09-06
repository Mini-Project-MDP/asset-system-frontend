import { useSearchParams } from 'react-router'
import SettingsOutlets from '@/features/settings/components/SettingsOutlets'
import SettingsDistributors from '@/features/settings/components/SettingsDistributors'
import SettingsTypes from '@/features/settings/components/SettingsTypes'
import SettingsFlow from '@/features/settings/components/SettingsFlow'
import SettingsUsers from '@/features/settings/components/SettingsUsers'
import type { SettingsTab } from '@/features/settings/types'

export default function SettingsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const currentTab = (searchParams.get('tab') as SettingsTab) || 'outlets'

  const handleTabChange = (tabKey: SettingsTab) => {
    setSearchParams({ tab: tabKey })
  }

  const tabs: { key: SettingsTab; label: string }[] = [
    { key: 'outlets', label: 'Outlets' },
    { key: 'distributors', label: 'Distributors' },
    { key: 'types', label: 'Asset types' },
    { key: 'flow', label: 'Approval flow' },
    { key: 'users', label: 'Users & roles' },
  ]

  const renderTabContent = () => {
    switch (currentTab) {
      case 'distributors':
        return <SettingsDistributors />
      case 'types':
        return <SettingsTypes />
      case 'flow':
        return <SettingsFlow />
      case 'users':
        return <SettingsUsers />
      case 'outlets':
      default:
        return <SettingsOutlets />
    }
  }

  return (
    <>
      <div className="page-head">
        <div className="ttl">
          <div className="eyebrow" style={{ marginBottom: '6px' }}>
            Configuration
          </div>
          <h1>Settings</h1>
          <p>
            Master data &amp; pemetaan awal yang dipakai seluruh alur — outlet, distributor, tipe aset,
            rute approval, dan peran user.
          </p>
        </div>
      </div>

      <div className="tabs">
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            className={currentTab === t.key ? 'on' : ''}
            onClick={() => handleTabChange(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {renderTabContent()}
    </>
  )
}
