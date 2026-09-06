import { httpClient } from '@/shared/services/httpClient'
import type { DashboardOverviewResponse } from '../types'

export const dashboardService = {
  getOverview: async (): Promise<DashboardOverviewResponse> => {
    try {
      const response = await httpClient.get<DashboardOverviewResponse>('/api/dashboard/overview')
      return response.data
    } catch {
      // Fallback mock data matching prototype index.html
      return {
        stats: [
          {
            id: '1',
            title: 'Total Requests',
            value: 12,
            subtitle: 'periode — Juli',
            category: 'total',
          },
          {
            id: '2',
            title: 'Pending Approval',
            value: 3,
            subtitle: 'menunggu approval',
            category: 'pending',
          },
          {
            id: '3',
            title: 'In Progress',
            value: 4,
            subtitle: 'proses & fulfillment',
            category: 'in_progress',
          },
          {
            id: '4',
            title: 'Assets Registered',
            value: '1,247',
            subtitle: 'total terdaftar',
            category: 'assets',
          },
        ],
        chartData: [
          { month: 'Jan', barcode: 6, android: 5, server: 3 },
          { month: 'Feb', barcode: 8, android: 7, server: 3 },
          { month: 'Mar', barcode: 10, android: 8, server: 4 },
          { month: 'Apr', barcode: 7, android: 7, server: 3 },
          { month: 'May', barcode: 12, android: 10, server: 4 },
          { month: 'Jun', barcode: 11, android: 9, server: 4 },
          { month: 'Jul', barcode: 9, android: 8, server: 3 },
          { month: 'Aug', barcode: 3, android: 3, server: 1 },
        ],
        activities: [
          {
            id: 'act-1',
            title: 'REQ-2091 approved by RSM',
            timeAgo: '2h',
            type: 'approval',
          },
          {
            id: 'act-2',
            title: 'New request from Laras P.',
            timeAgo: '3h',
            type: 'request',
          },
          {
            id: 'act-3',
            title: 'REQ-2085 shipped to Medan',
            timeAgo: '5h',
            type: 'fulfillment',
          },
          {
            id: 'act-4',
            title: 'REQ-2081 delivered & installed',
            timeAgo: '1d',
            type: 'approval',
          },
          {
            id: 'act-5',
            title: 'REQ-2078 revision requested',
            timeAgo: '1d',
            type: 'warning',
          },
        ],
        attentionRequests: [
          {
            id: 'REQ-2093',
            type: 'Barcode',
            outlet: 'Cirebon Kota',
            qty: 6,
            priority: 'high',
            by: 'Laras P.',
            byRole: 'SA',
            date: '12 Jul 2026',
            step: 0,
            chain: [
              { role: 'SA', roleLabel: 'Sales Admin', status: 'current' },
              { role: 'SS', roleLabel: 'Sales Supervisor', status: 'pending' },
              { role: 'RSM', roleLabel: 'Regional Sales Manager', status: 'pending' },
              { role: 'GRSM', roleLabel: 'Group Regional Sales Manager', status: 'pending' },
              { role: 'NSM', roleLabel: 'National Sales Manager', status: 'pending' },
              { role: 'SD', roleLabel: 'Sales Director', status: 'pending' },
            ],
            statusTag: { cls: 'warn', text: 'Waiting — Sales Admin' },
          },
          {
            id: 'REQ-2091',
            type: 'Barcode',
            outlet: 'Bandung Kota',
            qty: 4,
            priority: 'high',
            by: 'Dimas W.',
            byRole: 'SS',
            date: '12 Jul 2026',
            step: 0,
            chain: [
              { role: 'SS', roleLabel: 'Sales Supervisor', status: 'current' },
              { role: 'RSM', roleLabel: 'Regional Sales Manager', status: 'pending' },
              { role: 'GRSM', roleLabel: 'Group Regional Sales Manager', status: 'pending' },
              { role: 'NSM', roleLabel: 'National Sales Manager', status: 'pending' },
              { role: 'SD', roleLabel: 'Sales Director', status: 'pending' },
            ],
            statusTag: { cls: 'warn', text: 'Waiting — Sales Supervisor' },
          },
          {
            id: 'REQ-2089',
            type: 'Barcode',
            outlet: 'Depok Tengah',
            qty: 5,
            priority: 'normal',
            by: 'Eka P.',
            byRole: 'RSM',
            date: '11 Jul 2026',
            step: 0,
            chain: [
              { role: 'RSM', roleLabel: 'Regional Sales Manager', status: 'current' },
              { role: 'GRSM', roleLabel: 'Group Regional Sales Manager', status: 'pending' },
              { role: 'NSM', roleLabel: 'National Sales Manager', status: 'pending' },
              { role: 'SD', roleLabel: 'Sales Director', status: 'pending' },
            ],
            statusTag: { cls: 'warn', text: 'Waiting — Regional Sales Manager' },
          },
          {
            id: 'REQ-2090',
            type: 'Server',
            outlet: 'Cirebon Kota',
            qty: 6,
            priority: 'high',
            by: 'Fajar S.',
            byRole: 'Cabang',
            date: '12 Jul 2026',
            step: 0,
            chain: [
              { role: 'Cabang', roleLabel: 'Cabang / Distributor', status: 'current' },
              { role: 'GRSM', roleLabel: 'Group Regional Sales Manager', status: 'pending' },
              { role: 'NSM', roleLabel: 'National Sales Manager', status: 'pending' },
              { role: 'SD', roleLabel: 'Sales Director', status: 'pending' },
            ],
            statusTag: { cls: 'warn', text: 'Waiting — Cabang / Distributor' },
          },
          {
            id: 'REQ-2088',
            type: 'Android',
            outlet: 'Surabaya Timur',
            qty: 8,
            priority: 'normal',
            by: 'Rani S.',
            byRole: 'Cabang',
            date: '11 Jul 2026',
            step: 1,
            chain: [
              { role: 'Cabang', roleLabel: 'Cabang / Distributor', status: 'approved' },
              { role: 'GRSM', roleLabel: 'Group Regional Sales Manager', status: 'current' },
              { role: 'NSM', roleLabel: 'National Sales Manager', status: 'pending' },
              { role: 'SD', roleLabel: 'Sales Director', status: 'pending' },
            ],
            statusTag: { cls: 'warn', text: 'Waiting — Group Regional Sales Manager' },
          },
        ],
      }
    }
  },
}
