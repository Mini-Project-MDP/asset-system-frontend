export interface StatCardData {
  id: string
  title: string
  value: string | number
  subtitle: string
  category: 'total' | 'pending' | 'in_progress' | 'assets'
}

export interface MonthlyRequestData {
  month: string
  barcode: number
  android: number
  server: number
}

export interface ActivityLog {
  id: string
  title: string
  timeAgo: string
  type: 'approval' | 'request' | 'fulfillment' | 'warning'
}

export interface ApprovalChainStep {
  role: string
  roleLabel: string
  status: 'approved' | 'current' | 'pending' | 'rejected' | 'revision'
}

export interface AttentionRequestItem {
  id: string
  type: string
  outlet: string
  qty: number
  priority: 'normal' | 'high' | 'urgent'
  by: string
  byRole: string
  date: string
  step: number
  chain: ApprovalChainStep[]
  statusTag: {
    cls: 'go' | 'warn' | 'stop' | 'brand' | 'neutral'
    text: string
  }
}

export interface DashboardOverviewResponse {
  stats: StatCardData[]
  chartData: MonthlyRequestData[]
  activities: ActivityLog[]
  attentionRequests: AttentionRequestItem[]
}
