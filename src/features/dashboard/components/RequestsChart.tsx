import { Select } from 'antd'
import type { MonthlyRequestData } from '../types'

interface RequestsChartProps {
  data: MonthlyRequestData[]
  /** The year the data covers. */
  year: number
  onYearChange: (year: number) => void
}

// How many years back the selector offers, counting the current one.
const YEARS_OFFERED = 4

export default function RequestsChart({ data, year, onYearChange }: RequestsChartProps) {
  const currentYear = new Date().getFullYear()
  const yearOptions = Array.from({ length: YEARS_OFFERED }, (_, i) => {
    const y = currentYear - i
    return { label: String(y), value: y }
  })
  const maxVal = Math.max(
    ...data.flatMap((d) => [d.barcode, d.android, d.server, d.mobilePrinter]),
    1
  )
  const niceMax = Math.ceil(maxVal / 4) * 4 || 4
  const yTicks = [4, 3, 2, 1, 0].map((f) => Math.round((niceMax * f) / 4))

  return (
    <div className="card chart-card">
      <div className="card-hd">
        <h3>Requests per month</h3>
        <div className="chart-legend">
          <span className="li">
            <i style={{ background: 'var(--brand)' }} />
            Barcode
          </span>
          <span className="li">
            <i style={{ background: 'var(--go)' }} />
            Android
          </span>
          <span className="li">
            <i style={{ background: 'var(--warn)' }} />
            Server
          </span>
          <span className="li">
            <i style={{ background: '#6366f1' }} />
            Mobile Printer
          </span>
        </div>
        <div className="r">
          <Select
            size="small"
            value={year}
            options={yearOptions}
            onChange={onYearChange}
            style={{ width: 84 }}
            aria-label="Tahun"
          />
        </div>
      </div>
      <div className="card-pad">
        <div className="chart-wrap">
          <div className="chart-yaxis">
            {yTicks.map((t, idx) => (
              <span key={idx}>{t}</span>
            ))}
          </div>
          <div className="chart-main">
            <div className="chart-plot">
              {data.map((d, idx) => (
                <div key={idx} className="grp">
                  <div className="bars">
                    <div className="bwrap">
                      <span className="val">{d.barcode}</span>
                      <div
                        className="b barcode"
                        style={{ height: `${Math.round((d.barcode / niceMax) * 100)}%` }}
                        title={`Barcode: ${d.barcode}`}
                      />
                    </div>
                    <div className="bwrap">
                      <span className="val">{d.android}</span>
                      <div
                        className="b android"
                        style={{ height: `${Math.round((d.android / niceMax) * 100)}%` }}
                        title={`Android: ${d.android}`}
                      />
                    </div>
                    <div className="bwrap">
                      <span className="val">{d.server}</span>
                      <div
                        className="b server"
                        style={{ height: `${Math.round((d.server / niceMax) * 100)}%` }}
                        title={`Server: ${d.server}`}
                      />
                    </div>
                    <div className="bwrap">
                      <span className="val">{d.mobilePrinter}</span>
                      <div
                        className="b printer"
                        style={{ height: `${Math.round((d.mobilePrinter / niceMax) * 100)}%` }}
                        title={`Mobile Printer: ${d.mobilePrinter}`}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="chart-xlabels">
              {data.map((d, i) => (
                <span key={i} className={i === data.length - 1 ? 'cur' : ''}>
                  {d.month}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
