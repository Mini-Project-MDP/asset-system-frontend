import React from 'react'
import { FULFILL_STAGES } from '@/features/requests/services/requestService'

interface FulfillChainTrackProps {
  fulfillStep: number
}

export default function FulfillChainTrack({ fulfillStep }: FulfillChainTrackProps) {
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
  }

  return (
    <div className="chain">
      {FULFILL_STAGES.map((stageLabel, i) => {
        let status = 'pending'
        if (i < fulfillStep) status = 'approved'
        else if (i === fulfillStep) status = 'current'

        const prevDone = i > 0 && i - 1 < fulfillStep
        const cls = status === 'approved' ? 'done' : status
        const statusText = status === 'approved' ? 'Done' : status === 'current' ? 'Active' : 'Pending'

        return (
          <div key={i} className={`node ${cls}`}>
            <div className={`conn ${prevDone ? 'done' : ''}`} />
            <div className="dot">{icons[status] || icons.pending}</div>
            <div className="lbl">{stageLabel}</div>
            <div className="st">{statusText}</div>
          </div>
        )
      })}
    </div>
  )
}
