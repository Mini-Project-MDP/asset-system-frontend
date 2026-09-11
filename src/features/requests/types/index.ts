import { z } from 'zod'

export type CategoryType = 'Barcode' | 'Android' | 'Server'
export type PriorityType = 'normal' | 'high' | 'urgent'
export type StepStatus = 'approved' | 'current' | 'pending' | 'rejected' | 'revision'

export interface ApprovalChainStep {
  role: string
  roleLabel: string
  status: StepStatus
}

export interface HistoryItem {
  role: string
  action: string
  date: string
  type: 'go' | 'warn' | 'stop'
  comment?: string | null
}

export interface RequestDetailItem {
  id: string
  type: CategoryType
  outlet: string
  qty: number
  pri: PriorityType
  distributor: string
  salesDivision: string
  reqType?: string | null
  by: string
  byRole: string
  date: string
  step: number
  chain: ApprovalChainStep[]
  hist: HistoryItem[]
  statusTag: {
    cls: 'go' | 'warn' | 'stop' | 'brand' | 'neutral'
    text: string
  }
  fulfillStep?: number
  fulfillData?: Record<string, unknown> | null
  revisedFromId?: string | null
  approvalStatus?: string
  currentStepName?: string | null
}

export interface RequestFilter {
  q?: string
  type?: string
  status?: string
}

// Zod Schema for New Request Form Validation (React Hook Form)
export const createRequestSchema = z.object({
  category: z.enum(['Barcode', 'Android', 'Server']),
  distributor: z.string().min(1, 'Distributor wajib diisi.'),
  distributorManual: z.string().optional(),
  outlet: z.string().min(1, 'Outlet wajib dipilih.'),
  salesDivision: z.string().min(1, 'Sales Division wajib dipilih.'),
  reqType: z.string().optional(),
  requesterRole: z.string().min(1, 'Requester Role wajib dipilih.'),
  requesterName: z.string().min(1, 'Nama requester wajib diisi.'),
  qty: z.number().min(1, 'Quantity wajib diisi dengan angka.'),
  priority: z.enum(['normal', 'high', 'urgent']),
  revisedFromId: z.string().optional(),
}).refine(
  (data) => {
    if (data.category === 'Android' && !data.reqType) {
      return false
    }
    return true
  },
  {
    message: 'Request Type wajib dipilih untuk kategori Android.',
    path: ['reqType'],
  }
)

export type CreateRequestFormInput = z.infer<typeof createRequestSchema>
