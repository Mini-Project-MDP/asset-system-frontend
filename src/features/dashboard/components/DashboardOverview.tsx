import React from 'react'
import { useGetDashboardOverview } from '../hooks/useDashboard'
import StatCard from './StatCard'
import RequestsChart from './RequestsChart'
import RecentActivityList from './RecentActivityList'
import RequestsNeedingAttentionTable from './RequestsNeedingAttentionTable'

export default function DashboardOverview() {
  const { data, isLoading, isError, error } = useGetDashboardOverview()

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '56px 20px', color: 'var(--muted)' }}>
        <b>Memuat data Dashboard...</b>
      </div>
    )
  }

  if (isError || !data) {
    return (
      <div className="card card-pad" style={{ borderColor: 'var(--stop-line)', background: 'var(--stop-050)' }}>
        <b style={{ color: 'var(--stop)' }}>Gagal Memuat Data</b>
        <p style={{ color: 'var(--muted)', fontSize: '13px', marginTop: '4px' }}>
          {error?.message || 'Terjadi kesalahan saat memuat data dashboard.'}
        </p>
      </div>
    )
  }

  return (
    <>
      {/* Page Header */}
      <div className="page-head">
        <div className="ttl">
          <div className="eyebrow" style={{ marginBottom: '6px' }}>
            Overview
          </div>
          <h1>Dashboard</h1>
          <p>Ringkasan permintaan aset, approval, dan pemenuhan barcode.</p>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="stats">
        {data.stats.map((stat) => (
          <StatCard key={stat.id} data={stat} />
        ))}
      </div>

      {/* Grid: Chart & Activity Feed */}
      <div className="grid-2">
        <RequestsChart data={data.chartData} />
        <RecentActivityList activities={data.activities} />
      </div>

      {/* Table: Requests Needing Attention */}
      <RequestsNeedingAttentionTable requests={data.attentionRequests} />
    </>
  )
}
