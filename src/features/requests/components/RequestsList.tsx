import React, { useState } from 'react'
import { useNavigate } from 'react-router'
import { Input, Select, Button } from 'antd'
import { SearchOutlined, PlusOutlined } from '@ant-design/icons'
import { useGetRequests } from '../hooks/useRequests'
import type { RequestDetailItem, ApprovalChainStep } from '../types'

export default function RequestsList() {
  const navigate = useNavigate()
  const [q, setQ] = useState('')
  const [typeFilter, setTypeFilter] = useState('All types')
  const [statusFilter, setStatusFilter] = useState('All status')

  const { data: requests = [], isLoading } = useGetRequests({
    q,
    type: typeFilter,
    status: statusFilter,
  })

  const isFiltered = !!(q || typeFilter !== 'All types' || statusFilter !== 'All status')

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
            Asset workflow
          </div>
          <h1>Requests</h1>
          <p>Ajukan dan telusuri permintaan aset — barcode, smartphone, dan server.</p>
        </div>
        <div className="actions">
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate('/requests/new')}
            size="large"
            className="!font-semibold shadow-md"
          >
            New request
          </Button>
        </div>
      </div>

      {/* Card Table Container */}
      <div className="card">
        {/* Filter Bar */}
        <div className="fbar flex flex-wrap items-center gap-3 pt-6 pb-4 px-6 border-b border-slate-200">
          <div className="flex-1 min-w-[240px]">
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
            className="w-36"
            options={[
              { label: 'All types', value: 'All types' },
              { label: 'Barcode', value: 'Barcode' },
              { label: 'Android', value: 'Android' },
              { label: 'Server', value: 'Server' },
            ]}
          />

          <Select
            value={statusFilter}
            onChange={(val) => setStatusFilter(val)}
            className="w-36"
            options={[
              { label: 'All status', value: 'All status' },
              { label: 'Waiting', value: 'Waiting' },
              { label: 'In progress', value: 'In progress' },
              { label: 'Completed', value: 'Completed' },
            ]}
          />
        </div>

        {/* Table Content */}
        {isLoading ? (
          <div className="empty">
            <b>Memuat data request...</b>
          </div>
        ) : !requests.length ? (
          <div className="empty">
            <b>{isFiltered ? 'Tidak ada hasil' : 'Belum ada request'}</b>
            {isFiltered ? 'Coba ubah kata kunci atau filter.' : 'Ajukan request pertama untuk memulai.'}
          </div>
        ) : (
          <table className="tbl">
            <thead>
              <tr>
                <th>Request</th>
                <th>Type</th>
                <th>Outlet</th>
                <th className="num">Qty</th>
                <th>Priority</th>
                <th>Steps</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((r: RequestDetailItem) => (
                <tr key={r.id} className="clickable" onClick={() => navigate(`/requests/${r.id}`)}>
                  <td className="id">{r.id}</td>
                  <td>{r.type}</td>
                  <td>{r.outlet}</td>
                  <td className="num">{r.qty}</td>
                  <td>
                    <span className={`pri ${r.pri}`}>{r.pri}</span>
                  </td>
                  <td>{renderChainMini(r.chain)}</td>
                  <td>
                    <span className={`tag ${r.statusTag.cls}`}>
                      <span className="dot" />
                      {r.statusTag.text}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  )
}
