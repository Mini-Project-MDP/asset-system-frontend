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

// What the New Request form offers, as served by GET /api/v1/requests/form-options.
export interface FormOutletRef {
  id: string
  name: string
}

export interface FormDistributor {
  id: string
  name: string
  outlets: FormOutletRef[]
}

export interface RequesterRoleOption {
  code: string
  label: string
}

export interface RequestFormOptions {
  categories: CategoryType[]
  distributors: FormDistributor[]
  /** Every outlet; offered when the distributor is typed in by hand. */
  outlets: FormOutletRef[]
  salesDivisions: string[]
  requestTypes: string[]
  priorities: PriorityType[]
  requesterRoles: Record<string, RequesterRoleOption[]>
}

/** The Distributor select value that means "type the distributor in by hand". */
export const MANUAL_DISTRIBUTOR = '__other__'

// Zod Schema for New Request Form Validation (React Hook Form). The server checks
// the same rules again (and against master data), so these only give quick feedback.
export const createRequestSchema = z
  .object({
    category: z.enum(['Barcode', 'Android', 'Server']),
    distributor: z.string().min(1, 'Distributor wajib diisi.'),
    distributorManual: z.string().optional(),
    outlet: z.string().min(1, 'Outlet wajib dipilih.'),
    salesDivision: z.string().min(1, 'Sales Division wajib dipilih.'),
    reqType: z.string().optional(),
    requesterRole: z.string().min(1, 'Requester Role wajib dipilih.'),
    requesterName: z.string().trim().min(1, 'Nama requester wajib diisi.'),
    qty: z.number().int('Quantity harus bilangan bulat.').min(1, 'Quantity minimal 1.'),
    priority: z.enum(['normal', 'high', 'urgent']),
    revisedFromId: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.category === 'Android' && !data.reqType) {
      ctx.addIssue({ code: 'custom', message: 'Request Type wajib dipilih untuk kategori Android.', path: ['reqType'] })
    }
    if (data.distributor === MANUAL_DISTRIBUTOR && !data.distributorManual?.trim()) {
      ctx.addIssue({ code: 'custom', message: 'Nama distributor wajib diisi.', path: ['distributorManual'] })
    }
  })

export type CreateRequestFormInput = z.infer<typeof createRequestSchema>
