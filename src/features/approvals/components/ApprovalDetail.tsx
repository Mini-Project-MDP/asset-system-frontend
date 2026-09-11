import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router'
import { Button, Spin, message, Modal, Input, Alert } from 'antd'
import { ArrowLeftOutlined } from '@ant-design/icons'
import { useGetApprovalDetail, useActOnApproval } from '../hooks/useApprovals'
import { ROLE_LABELS } from '@/features/requests/services/requestService'
import type { ApprovalChainStep, HistoryItem } from '@/features/requests/types'
import type { ApprovalActionType } from '../types'

export default function ApprovalDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const userRole = 'admin'

  const { data: request, isLoading } = useGetApprovalDetail(id || '')
  const actMutation = useActOnApproval()

  if (isLoading) {
    return (
      <div className="py-24 text-center">
        <Spin size="large" />
      </div>
    )
  }

  if (!request) {
    return (
      <div className="card card-pad text-center py-16">
        <h2 className="text-xl font-bold text-slate-800 mb-2">Request Not Found</h2>
        <p className="text-slate-500 mb-6">Request ID {id} tidak ditemukan dalam sistem.</p>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/approvals')}>
          Kembali ke Approvals
        </Button>
      </div>
    )
  }

  const isMyTurn =
    userRole === 'admin'
      ? request.step >= 0 && request.step < request.chain.length
      : request.chain.some((x) => x.role === userRole && x.status === 'current')

  const [modalAction, setModalAction] = useState<ApprovalActionType | null>(null)
  const [actionComment, setActionComment] = useState('')
  const [actionSubmitting, setActionSubmitting] = useState(false)

  const openActionModal = (action: ApprovalActionType) => {
    setModalAction(action)
    setActionComment('')
  }

  const handleConfirmAction = async () => {
    if (!modalAction) return
    if (modalAction === 'revision' && !actionComment.trim()) {
      message.error('Komentar wajib diisi ketika meminta revisi')
      return
    }

    try {
      setActionSubmitting(true)
      await actMutation.mutateAsync({
        requestId: request.id,
        action: modalAction,
        comment: actionComment.trim() || undefined,
        userRole,
      })
      if (modalAction === 'approve') {
        message.success(`Request ${request.id} berhasil disetujui`)
      } else if (modalAction === 'revision') {
        message.warning(`Request ${request.id} ditolak dengan catatan revisi. Requester diminta mengajukan ulang.`)
      } else {
        message.error(`Request ${request.id} ditolak`)
      }
      setModalAction(null)
    } catch (err: any) {
      const status = err?.response?.status
      const errorMsg = err?.response?.data?.error || err?.message
      if (status === 409) {
        message.error('Request sedang dalam proses sinkronisasi dengan Approval Engine. Mohon tunggu beberapa saat dan coba kembali.')
      } else if (status === 502) {
        message.error(`Approval Engine error: ${errorMsg}`)
      } else if (errorMsg) {
        message.error(errorMsg)
      } else {
        message.error('Gagal memperbarui status approval')
      }
    } finally {
      setActionSubmitting(false)
    }
  }

  const renderStatusTag = () => {
    const { cls, text } = request.statusTag
    return (
      <span className={`tag ${cls}`}>
        <span className="dot" />
        {text}
      </span>
    )
  }

  const renderPriorityTag = (p: string) => {
    return <span className={`pri ${p}`}>{p}</span>
  }

  const renderChainFull = (chain: ApprovalChainStep[]) => {
    if (!chain || chain.length === 0) {
      return (
        <div className="empty" style={{ padding: '28px 20px' }}>
          <b>Tidak ada approval</b>
          <p className="text-xs">Requester sudah level tertinggi — langsung ke Fulfillment.</p>
        </div>
      )
    }

    const icons: Record<string, React.ReactNode> = {
      approved: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ),
      current: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <circle cx="12" cy="12" r="4" />
        </svg>
      ),
      pending: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <circle cx="12" cy="12" r="9" />
        </svg>
      ),
      rejected: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      ),
      revision: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <polyline points="1 4 1 10 7 10" />
          <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
        </svg>
      ),
    }

    return (
      <div className="chain">
        {chain.map((n, i) => {
          const prevDone = i > 0 && chain[i - 1].status === 'approved'
          const cls = n.status === 'approved' ? 'done' : n.status
          const statusText =
            n.status === 'approved'
              ? 'Approved'
              : n.status === 'current'
              ? 'Reviewing'
              : n.status === 'pending'
              ? 'Pending'
              : n.status === 'rejected'
              ? 'Rejected'
              : 'Revision'

          return (
            <div key={i} className={`node ${cls}`}>
              <div className={`conn ${prevDone ? 'done' : ''}`} />
              <div className="dot">{icons[n.status] || icons.pending}</div>
              <div className="lbl">{n.roleLabel || ROLE_LABELS[n.role] || n.role}</div>
              <div className="st">{statusText}</div>
            </div>
          )
        })}
      </div>
    )
  }

  const renderTimeline = (hist: HistoryItem[]) => {
    const icons: Record<string, React.ReactNode> = {
      go: (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M20 6L9 17l-5-5" />
        </svg>
      ),
      warn: (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <polyline points="1 4 1 10 7 10" />
          <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
        </svg>
      ),
      stop: (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      ),
    }

    return (
      <div className="timeline">
        {hist.map((item, idx) => (
          <div key={idx} className={`ev ${item.type}`}>
            <div className="mk">{icons[item.type] || icons.go}</div>
            <div className="tx">
              <b>
                {item.role} <span>— {item.action}</span>
              </b>
              <div className="t">{item.date}</div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <>
      {/* Page Header */}
      <div className="page-head">
        <div className="ttl">
          <div className="eyebrow" style={{ marginBottom: '6px' }}>
            Approval · {request.type}
          </div>
          <h1 className="mono" style={{ fontSize: '20px' }}>
            {request.id}
          </h1>
          <p>
            {request.outlet} · <span className="mono">{request.qty} pcs</span>
          </p>
        </div>
        <div className="actions">
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/approvals')}>
            ← Back
          </button>
        </div>
      </div>

      {/* Full Approval Chain Visual Card */}
      <div className="card card-pad">
        <div className="eyebrow" style={{ marginBottom: '16px' }}>
          Approval chain
        </div>
        {renderChainFull(request.chain)}
      </div>

      {/* Main Detail Grid */}
      <div className="detail mt4">
        {/* Left Card: Request Details */}
        <div className="card">
          <div className="card-hd">
            <h3>Request details</h3>
            <div className="r">{renderStatusTag()}</div>
          </div>
          <div className="card-pad">
            <dl className="kv">
              <dt>Request ID</dt>
              <dd className="mono">{request.id}</dd>

              <dt>Category</dt>
              <dd>{request.type}</dd>

              <dt>Outlet</dt>
              <dd>{request.outlet}</dd>

              <dt>Distributor</dt>
              <dd>{request.distributor}</dd>

              <dt>Sales Division</dt>
              <dd>{request.salesDivision}</dd>

              <dt>Quantity</dt>
              <dd className="mono">{request.qty} pcs</dd>

              <dt>Priority</dt>
              <dd>{renderPriorityTag(request.pri)}</dd>

              {request.reqType && (
                <>
                  <dt>Request Type</dt>
                  <dd>{request.reqType}</dd>
                </>
              )}

              <dt>Requested by</dt>
              <dd>
                {request.by} · {ROLE_LABELS[request.byRole] || request.byRole}
              </dd>

              <dt>Submitted</dt>
              <dd className="mono">{request.date}</dd>
            </dl>

            <div className="mt5" style={{ borderTop: '1px solid var(--line)', paddingTop: '20px' }}>
              <div className="eyebrow" style={{ marginBottom: '12px' }}>
                Approval history
              </div>
              {renderTimeline(request.hist)}
            </div>
          </div>
        </div>

        {/* Right Card: Approval Action */}
        <div className="card" style={{ alignSelf: 'start' }}>
          <div className="card-hd">
            <h3>Approval action</h3>
          </div>
          <div className="card-pad">
            {isMyTurn ? (
              <>
                <div className="callout" style={{ marginBottom: '16px' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                  <div>
                    Menunggu keputusanmu sebagai <b>{ROLE_LABELS[userRole] || 'Admin'}</b>.
                  </div>
                </div>

                <button
                  type="button"
                  className="btn btn-go"
                  style={{ width: '100%', marginBottom: '8px' }}
                  onClick={() => openActionModal('approve')}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                  Approve
                </button>

                <button
                  type="button"
                  className="btn btn-warn"
                  style={{ width: '100%', marginBottom: '8px' }}
                  onClick={() => openActionModal('revision')}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <path d="M3 12a9 9 0 019-9 9 9 0 016.7 3M21 3v6h-6" />
                  </svg>
                  Tolak & Minta Revisi
                </button>

                <button
                  type="button"
                  className="btn btn-stop"
                  style={{ width: '100%' }}
                  onClick={() => openActionModal('reject')}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                  Reject
                </button>
              </>
            ) : (
              <div className="callout warn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 8v4M12 16h.01" />
                  <circle cx="12" cy="12" r="9" />
                </svg>
                <div>
                  Bukan giliranmu. Request ini sedang di{' '}
                  <b>
                    {request.step >= 0 && request.step < request.chain.length
                      ? request.chain[request.step]?.roleLabel || request.chain[request.step]?.role
                      : '—'}
                  </b>
                  . Kamu bisa melihat, tapi belum bisa bertindak.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <Modal
        title={
          modalAction === 'approve'
            ? 'Konfirmasi Approval'
            : modalAction === 'revision'
            ? 'Tolak & Minta Revisi (Ajukan Ulang)'
            : 'Konfirmasi Reject'
        }
        open={modalAction !== null}
        onCancel={() => !actionSubmitting && setModalAction(null)}
        footer={[
          <Button key="cancel" onClick={() => setModalAction(null)} disabled={actionSubmitting}>
            Batal
          </Button>,
          <Button
            key="submit"
            type="primary"
            danger={modalAction === 'reject'}
            loading={actionSubmitting}
            disabled={modalAction === 'revision' && !actionComment.trim()}
            onClick={handleConfirmAction}
            className={modalAction === 'revision' ? '!bg-amber-500 hover:!bg-amber-600 !border-amber-500' : ''}
          >
            {modalAction === 'approve'
              ? 'Ya, Approve'
              : modalAction === 'revision'
              ? 'Tolak & Minta Revisi'
              : 'Ya, Tolak Request'}
          </Button>,
        ]}
      >
        {modalAction === 'approve' && (
          <p className="text-slate-600 my-4">
            Apakah Anda yakin ingin menyetujui request <b>{request.id}</b> ({request.type} - {request.outlet})?
          </p>
        )}

        {modalAction === 'revision' && (
          <div className="flex flex-col gap-3 my-4">
            <Alert
              type="warning"
              showIcon
              message="Perhatian: Alur Revisi"
              description="Sesuai aturan Approval Engine, permintaan revisi akan menolak request ini. Requester wajib membuat request baru (Ajukan Ulang) yang memuat catatan perbaikan Anda."
            />
            <label className="text-sm font-semibold text-slate-700">
              Catatan / Alasan Revisi <span className="text-rose-500">* (Wajib diisi)</span>
            </label>
            <Input.TextArea
              rows={4}
              placeholder="Jelaskan bagian yang perlu direvisi (misal: quantity disesuaikan, cabang distributor salah, dll)..."
              value={actionComment}
              onChange={(e) => setActionComment(e.target.value)}
            />
          </div>
        )}

        {modalAction === 'reject' && (
          <div className="flex flex-col gap-3 my-4">
            <p className="text-slate-600">
              Apakah Anda yakin ingin menolak request <b>{request.id}</b> secara permanen?
            </p>
            <label className="text-sm font-semibold text-slate-700">Alasan Penolakan (Opsional)</label>
            <Input.TextArea
              rows={3}
              placeholder="Tuliskan alasan penolakan bila ada..."
              value={actionComment}
              onChange={(e) => setActionComment(e.target.value)}
            />
          </div>
        )}
      </Modal>
    </>
  )
}
