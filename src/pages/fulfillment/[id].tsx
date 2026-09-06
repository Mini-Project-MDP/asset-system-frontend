import React from 'react'
import { useParams, useNavigate } from 'react-router'
import { Button, Spin, message, Modal } from 'antd'
import { ArrowLeftOutlined, CheckOutlined } from '@ant-design/icons'
import {
  useGetFulfillmentDetail,
  useSaveFulfillmentData,
  useAdvanceFulfillmentStage,
} from '@/features/fulfillment/hooks/useFulfillment'
import FulfillChainTrack from '@/features/fulfillment/components/FulfillChainTrack'
import FulfillDataSummary from '@/features/fulfillment/components/FulfillDataSummary'
import FulfillDataForm from '@/features/fulfillment/components/FulfillDataForm'
import { ROLE_LABELS, FULFILL_STAGES } from '@/features/requests/services/requestService'
import type { HistoryItem } from '@/features/requests/types'

export default function FulfillmentDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const { data: request, isLoading } = useGetFulfillmentDetail(id || '')
  const saveMutation = useSaveFulfillmentData()
  const advanceMutation = useAdvanceFulfillmentStage()

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
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/fulfillment')}>
          Kembali ke Fulfillment
        </Button>
      </div>
    )
  }

  const fulfillStep = request.fulfillStep != null ? request.fulfillStep : 0
  const isDone = fulfillStep >= FULFILL_STAGES.length
  const nextLabel = FULFILL_STAGES[fulfillStep + 1] || 'Completed'

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

  const handleSaveData = async (fulfillData: any) => {
    try {
      await saveMutation.mutateAsync({ id: request.id, fulfillData })
      message.success('Data aset disimpan — berhasil lanjut ke tahap Shipped')
    } catch {
      message.error('Gagal menyimpan data aset')
    }
  }

  const handleAdvanceStage = async () => {
    Modal.confirm({
      title: `Lanjut ke Tahap ${nextLabel}`,
      content: `Apakah Anda yakin ingin memajukan status fulfillment ke '${nextLabel}'?`,
      okText: 'Lanjutkan',
      cancelText: 'Batal',
      onOk: async () => {
        try {
          await advanceMutation.mutateAsync(request.id)
          message.success(`Status berhasil diperbarui ke ${nextLabel}`)
        } catch {
          message.error('Gagal memperbarui tahap fulfillment')
        }
      },
    })
  }

  return (
    <>
      {/* Page Header */}
      <div className="page-head">
        <div className="ttl">
          <div className="eyebrow" style={{ marginBottom: '6px' }}>
            Fulfillment · {request.type}
          </div>
          <h1 className="mono" style={{ fontSize: '20px' }}>
            {request.id}
          </h1>
          <p>
            {request.outlet} · <span className="mono">{request.qty} pcs</span>
          </p>
        </div>
        <div className="actions">
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/fulfillment')}>
            ← Back
          </button>
        </div>
      </div>

      {/* Visual Stage Tracker Card */}
      <div className="card card-pad">
        <div className="eyebrow" style={{ marginBottom: '16px' }}>
          Fulfillment stage
        </div>
        <FulfillChainTrack fulfillStep={fulfillStep} />
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

            <FulfillDataSummary category={request.type} fulfillData={request.fulfillData} />

            <div className="mt5" style={{ borderTop: '1px solid var(--line)', paddingTop: '20px' }}>
              <div className="eyebrow" style={{ marginBottom: '12px' }}>
                Approval history
              </div>
              {renderTimeline(request.hist)}
            </div>
          </div>
        </div>

        {/* Right Card: Fulfillment Action */}
        <div className="card" style={{ alignSelf: 'start' }}>
          <div className="card-hd">
            <h3>Fulfillment action</h3>
          </div>
          <div className="card-pad">
            {isDone ? (
              <div className="callout" style={{ background: 'var(--go-050)', borderColor: 'var(--go-line)' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--go)' }}>
                  <path d="M20 6L9 17l-5-5" />
                </svg>
                <div>Fulfillment selesai — aset sudah diterima.</div>
              </div>
            ) : fulfillStep === 0 && !request.fulfillData ? (
              <>
                <div className="callout" style={{ marginBottom: '16px' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 8v4l3 2" />
                    <circle cx="12" cy="12" r="9" />
                  </svg>
                  <div>Lengkapi pencatatan data aset sebelum lanjut ke <b>Shipped</b>.</div>
                </div>
                <FulfillDataForm
                  category={request.type}
                  qty={request.qty}
                  onSave={handleSaveData}
                />
              </>
            ) : (
              <>
                <div className="callout" style={{ marginBottom: '16px' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 8v4l3 2" />
                    <circle cx="12" cy="12" r="9" />
                  </svg>
                  <div>Tahap saat ini: <b>{FULFILL_STAGES[fulfillStep]}</b>.</div>
                </div>
                <button
                  type="button"
                  className="btn btn-go"
                  style={{ width: '100%' }}
                  onClick={handleAdvanceStage}
                >
                  <CheckOutlined /> Advance to {nextLabel}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
