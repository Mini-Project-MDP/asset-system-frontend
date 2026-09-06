import React from 'react'
import { useNavigate } from 'react-router'
import type { AttentionRequestItem, ApprovalChainStep } from '../types'

interface RequestsNeedingAttentionTableProps {
  requests: AttentionRequestItem[]
}

export default function RequestsNeedingAttentionTable({
  requests,
}: RequestsNeedingAttentionTableProps) {
  const navigate = useNavigate()

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

  const renderPriTag = (priority: AttentionRequestItem['priority']) => {
    return <span className={`pri ${priority}`}>{priority}</span>
  }

  const renderStatusTag = (statusTag: AttentionRequestItem['statusTag']) => {
    return (
      <span className={`tag ${statusTag.cls}`}>
        <span className="dot" />
        {statusTag.text}
      </span>
    )
  }

  return (
    <div className="card mt4">
      <div className="card-hd">
        <h3>Requests needing attention</h3>
        <div className="r">
          <button className="btn btn-secondary btn-sm" onClick={() => navigate('/requests')}>
            View all
          </button>
        </div>
      </div>

      {!requests.length ? (
        <div className="empty">
          <b>Belum ada request</b>
          Ajukan request pertama untuk memulai.
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
            {requests.map((r) => (
              <tr
                key={r.id}
                className="clickable"
                onClick={() => navigate(`/requests?id=${r.id}`)}
              >
                <td className="id">{r.id}</td>
                <td>{r.type}</td>
                <td>{r.outlet}</td>
                <td className="num">{r.qty}</td>
                <td>{renderPriTag(r.priority)}</td>
                <td>{renderChainMini(r.chain)}</td>
                <td>{renderStatusTag(r.statusTag)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
