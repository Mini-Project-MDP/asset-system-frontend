import React, { useState } from 'react'
import { useNavigate } from 'react-router'
import { Input, Select, Button, Spin } from 'antd'
import { SearchOutlined, CheckCircleOutlined, RightOutlined } from '@ant-design/icons'
import { useGetFulfillmentItems } from '@/features/fulfillment/hooks/useFulfillment'
import type { FulfillmentTab } from '@/features/fulfillment/types'
import type { RequestDetailItem, ApprovalChainStep } from '@/features/requests/types'

export default function FulfillmentPage() {
  const navigate = useNavigate()
  const [tab, setTab] = useState<FulfillmentTab>('pending')
  const [q, setQ] = useState('')
  const [typeFilter, setTypeFilter] = useState('All types')

  const { data, isLoading } = useGetFulfillmentItems({
    q,
    type: typeFilter,
  })

  const pendingList = data?.pending || []
  const historyList = data?.history || []
  const currentList = tab === 'pending' ? pendingList : historyList

  const renderChainMini = (chain: ApprovalChainStep[]) => {
    if (!chain || chain.length === 0) {
      return (
        <span className="tag neutral" style={{ height: '20px' }}>
          <span className="dot" />
          No approval
        </span>
      )
    }

    return (
      <span className="chain-mini">
        {chain.map((n, i) => {
          const seg =
            i > 0 ? (
              <span
                key={`seg-${i}`}
                className={`seg ${chain[i - 1].status === 'approved' ? 'done' : ''}`}
              />
            ) : null
          const cls = n.status === 'approved' ? 'done' : n.status
          return (
            <React.Fragment key={i}>
              {seg}
              <span className={`m ${cls}`} title={`${n.roleLabel || n.role}: ${n.status}`} />
            </React.Fragment>
          )
        })}
      </span>
    )
  }

  return (
    <>
      {/* Page Header */}
      <div className="page-head">
        <div className="ttl">
          <div className="eyebrow" style={{ marginBottom: '6px' }}>
            Asset Team queue
          </div>
          <h1>Fulfillment</h1>
          <p>Proses aset yang sudah lolos approval — dari processing sampai diterima.</p>
        </div>
      </div>

      {/* Pending Items Banner Callout */}
      {pendingList.length > 0 && (
        <div className="callout mb-6">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M1 6h13v10H1zM14 9h4l3 3v4h-7z" />
            <circle cx="6" cy="18" r="1.8" />
            <circle cx="17" cy="18" r="1.8" />
          </svg>
          <div>
            <b>{pendingList.length} request siap diproses.</b> Buka salah satu untuk lanjutkan tahap fulfillment.
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="tabs">
        <button
          type="button"
          className={tab === 'pending' ? 'on' : ''}
          onClick={() => setTab('pending')}
        >
          In progress · {pendingList.length}
        </button>
        <button
          type="button"
          className={tab === 'history' ? 'on' : ''}
          onClick={() => setTab('history')}
        >
          Completed · {historyList.length}
        </button>
      </div>

      {/* Card Table Container */}
      <div className="card">
        {/* Filter Bar */}
        <div className="fbar">
          <div style={{ flex: 1, minWidth: 240 }}>
            <Input
              placeholder="Cari ID, outlet, atau requester…"
              prefix={<SearchOutlined style={{ color: 'var(--faint)' }} />}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              allowClear
            />
          </div>

          <Select
            value={typeFilter}
            onChange={(val) => setTypeFilter(val)}
            style={{ width: 140 }}
            options={[
              { label: 'All types', value: 'All types' },
              { label: 'Barcode', value: 'Barcode' },
              { label: 'Android', value: 'Android' },
              { label: 'Server', value: 'Server' },
            ]}
          />
        </div>

        {/* Table Content */}
        {isLoading ? (
          <div className="py-16 text-center">
            <Spin size="large" />
          </div>
        ) : currentList.length > 0 ? (
          <table className="tbl">
            <thead>
              <tr>
                <th>Request</th>
                <th>Type</th>
                <th>Outlet</th>
                <th className="num">Qty</th>
                <th>Requested by</th>
                <th>Steps</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {currentList.map((r: RequestDetailItem) => (
                <tr
                  key={r.id}
                  className="clickable hover:bg-slate-50 transition-colors"
                  onClick={() => navigate(`/fulfillment/${r.id}`)}
                >
                  <td className="id font-semibold">{r.id}</td>
                  <td>{r.type}</td>
                  <td>{r.outlet}</td>
                  <td className="num font-mono">{r.qty}</td>
                  <td>{r.by}</td>
                  <td>{renderChainMini(r.chain)}</td>
                  <td className="text-right">
                    <Button
                      size="small"
                      type="default"
                      icon={<RightOutlined className="text-xs" />}
                      iconPosition="end"
                      onClick={(e) => {
                        e.stopPropagation()
                        navigate(`/fulfillment/${r.id}`)
                      }}
                      className="hover:!border-rose-500 hover:!text-rose-600 font-medium"
                    >
                      {tab === 'pending' ? 'Process' : 'Detail'}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="py-16 text-center text-slate-500 flex flex-col items-center justify-center">
            <CheckCircleOutlined className="text-4xl text-slate-300 mb-3" />
            <b className="text-slate-800 text-base">Tidak ada yang perlu diproses</b>
            <p className="text-xs text-slate-500 mt-1">
              {tab === 'pending'
                ? 'Belum ada request yang siap fulfillment.'
                : 'Belum ada request yang selesai.'}
            </p>
          </div>
        )}
      </div>
    </>
  )
}
