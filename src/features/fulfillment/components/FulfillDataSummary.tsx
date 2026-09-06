import type { CategoryType } from '@/features/requests/types'

interface FulfillDataSummaryProps {
  category: CategoryType
  fulfillData: any
}

export default function FulfillDataSummary({ category, fulfillData }: FulfillDataSummaryProps) {
  if (!fulfillData) return null

  if (category === 'Barcode' && Array.isArray(fulfillData.codes)) {
    return (
      <div className="mt5" style={{ borderTop: '1px solid var(--line)', paddingTop: '20px' }}>
        <div className="eyebrow" style={{ marginBottom: '12px' }}>
          Kode barcode tercatat ({fulfillData.codes.length} pcs)
        </div>
        <div
          className="mono"
          style={{ fontSize: '12.5px', lineHeight: '1.9', maxHeight: '160px', overflowY: 'auto' }}
        >
          {fulfillData.codes.map((code: string, idx: number) => (
            <div key={idx}>{code}</div>
          ))}
        </div>
      </div>
    )
  }

  if (category === 'Android' && Array.isArray(fulfillData.units)) {
    return (
      <div className="mt5" style={{ borderTop: '1px solid var(--line)', paddingTop: '20px' }}>
        <div className="eyebrow" style={{ marginBottom: '12px' }}>
          Data unit tercatat ({fulfillData.units.length} pcs)
        </div>
        <div style={{ maxHeight: '220px', overflowY: 'auto' }}>
          <table className="tbl">
            <thead>
              <tr>
                <th>IMEI</th>
                <th>Merk</th>
                <th>Jenis</th>
                <th>Rilis</th>
                <th>Registrasi</th>
              </tr>
            </thead>
            <tbody>
              {fulfillData.units.map((u: any, idx: number) => (
                <tr key={idx}>
                  <td className="mono">{u.imei}</td>
                  <td>{u.brand}</td>
                  <td>{u.model}</td>
                  <td className="mono">{u.releaseYear}</td>
                  <td className="mono">{u.regYear}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  if (category === 'Server' && fulfillData.specs) {
    return (
      <div className="mt5" style={{ borderTop: '1px solid var(--line)', paddingTop: '20px' }}>
        <div className="eyebrow" style={{ marginBottom: '12px' }}>
          Spesifikasi tercatat
        </div>
        <p style={{ fontSize: '13px', color: 'var(--ink-2)', whiteSpace: 'pre-line' }}>
          {fulfillData.specs}
        </p>
      </div>
    )
  }

  return null
}
