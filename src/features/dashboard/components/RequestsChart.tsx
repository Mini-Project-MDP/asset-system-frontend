import type { MonthlyRequestData } from '../types'

interface RequestsChartProps {
  data: MonthlyRequestData[]
}

export default function RequestsChart({ data }: RequestsChartProps) {
  const maxVal = Math.max(
    ...data.flatMap((d) => [d.barcode, d.android, d.server]),
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
        </div>
        <div className="r">
          <span className="tag neutral">
            <span className="dot" />
            2026
          </span>
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
