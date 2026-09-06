import { InfoCircleOutlined } from '@ant-design/icons'
import { useGetSettingsFlow } from '../hooks/useSettings'

export default function SettingsFlow() {
  const { data: flowData, isLoading } = useGetSettingsFlow()

  if (isLoading || !flowData) {
    return <div className="p-8 text-center text-slate-400 text-xs">Loading approval flow…</div>
  }

  const { hierarchy, roleLabels } = flowData

  const renderHierarchyColumn = (title: string, roles: string[]) => (
    <div className="card card-pad h-full">
      <div className="eyebrow" style={{ marginBottom: '16px' }}>
        {title}
      </div>
      <div className="space-y-0">
        {roles.map((role, idx) => (
          <div
            key={role}
            className="flex items-center gap-3.5 py-3 border-b border-slate-100 last:border-b-0"
          >
            <span
              className="mono text-xs font-bold w-6 h-6 rounded-md bg-rose-50 text-rose-700 grid place-items-center flex-none"
            >
              {idx + 1}
            </span>
            <span className="font-semibold text-slate-800 flex-1 text-xs">{roleLabels[role] || role}</span>
            <span className="tag neutral">
              <span className="dot" />
              {role}
            </span>
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <div className="flex flex-col gap-4">
      <div className="callout">
        <InfoCircleOutlined className="text-brand flex-none mt-0.5" />
        <div>
          Rute approval sekarang <b>dinamis</b> — dihitung otomatis dari kategori request dan Requester
          Role yang dipilih. Berikut hierarki lengkap per kategori (dari level terendah ke tertinggi).
        </div>
      </div>

      <div className="grid-2">
        {renderHierarchyColumn('Barcode', hierarchy.Barcode)}
        {renderHierarchyColumn('Android & Server', hierarchy.Android)}
      </div>

      <div className="card card-pad">
        <div className="eyebrow" style={{ marginBottom: '10px' }}>
          Cara kerja rute dinamis
        </div>
        <p className="text-xs text-slate-600 leading-relaxed">
          Approval chain untuk tiap request = semua level di atas Requester Role yang dipilih. Contoh:
          request Barcode dengan Requester Role <b>RSM</b> hanya perlu approval{' '}
          <b>GRSM → NSM → SD</b> (level SA/SS dilewati karena di bawah requester). Kalau Requester
          Role sudah di level tertinggi (SD), request otomatis disetujui dan langsung masuk ke{' '}
          <b>Fulfillment</b> tanpa approval.
        </p>
      </div>
    </div>
  )
}
