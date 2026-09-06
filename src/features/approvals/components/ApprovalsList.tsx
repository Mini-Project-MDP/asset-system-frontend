import React, { useState } from 'react'
import { useNavigate } from 'react-router'
import { Input, Select, Button, Spin } from 'antd'
import { SearchOutlined, CheckCircleOutlined, RightOutlined } from '@ant-design/icons'
import { useGetApprovals } from '../hooks/useApprovals'
import type { ApprovalTab } from '../types'
import type { RequestDetailItem, ApprovalChainStep } from '@/features/requests/types'

export default function ApprovalsList() {
  const navigate = useNavigate()
  const [tab, setTab] = useState<ApprovalTab>('pending')
  const [q, setQ] = useState('')
  const [typeFilter, setTypeFilter] = useState('All types')

  const { data, isLoading } = useGetApprovals({
    q,
    type: typeFilter,
    role: 'admin',
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
            Admin queue
          </div>
          <h1>Approvals</h1>
          <p>Setujui, tolak, atau minta revisi — rantai approval terlihat penuh.</p>
        </div>
      </div>

      {/* Pending Items Banner Callout */}
      {pendingList.length > 0 && (
        <div className="callout mb-6">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 8v4l3 2" />
            <circle cx="12" cy="12" r="9" />
          </svg>
          <div>
            <b>{pendingList.length} request menunggu keputusanmu.</b> Buka salah satu untuk melihat detail & bertindak.
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
          Your turn · {pendingList.length}
        </button>
        <button
          type="button"
          className={tab === 'history' ? 'on' : ''}
          onClick={() => setTab('history')}
        >
          History · {historyList.length}
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
                  onClick={() => navigate(`/approvals/${r.id}`)}
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
                        navigate(`/approvals/${r.id}`)
                      }}
                      className="hover:!border-rose-500 hover:!text-rose-600 font-medium"
                    >
                      {tab === 'pending' ? 'Review' : 'Detail'}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="py-16 text-center text-slate-500 flex flex-col items-center justify-center">
            <CheckCircleOutlined className="text-4xl text-slate-300 mb-3" />
            <b className="text-slate-800 text-base">Tidak ada yang perlu ditinjau</b>
            <p className="text-xs text-slate-500 mt-1">
              {tab === 'pending'
                ? 'Belum ada request yang sampai ke giliranmu.'
                : 'Belum ada riwayat approval.'}
            </p>
          </div>
        )}
      </div>
    </>
  )
}
