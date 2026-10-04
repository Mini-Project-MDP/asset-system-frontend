import { useEffect, useState, useMemo } from 'react'
import { useForm, Controller, type FieldErrors } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate, useLocation } from 'react-router'
import {
  Form,
  Input,
  Select,
  InputNumber,
  Segmented,
  Button,
  Card,
  Alert,
  Spin,
  Steps,
  Typography,
  message,
} from 'antd'
import { ArrowLeftOutlined, CheckCircleOutlined } from '@ant-design/icons'
import { getApiErrorField, getApiErrorMessage } from '@/shared/utils/apiError'
import {
  createRequestSchema,
  MANUAL_DISTRIBUTOR,
  type CreateRequestFormInput,
  type CategoryType,
  type RequestDetailItem,
  type RequestFormOptions,
} from '../types'
import { ROLE_LABELS, computeChain } from '../services/requestService'
import { useCreateRequest, useRequestFormOptions } from '../hooks/useRequests'

const { Title, Paragraph, Text } = Typography

// The fields in the order they appear on the form: the first invalid one gets the focus.
const FIELD_ORDER: (keyof CreateRequestFormInput)[] = [
  'category',
  'distributor',
  'distributorManual',
  'outlet',
  'salesDivision',
  'reqType',
  'requesterRole',
  'requesterName',
  'qty',
  'priority',
]

/** Scrolls to a field and puts the cursor in it. */
function focusField(name: string) {
  const root = document.getElementById(`field-${name}`)
  if (!root) return
  root.scrollIntoView({ behavior: 'smooth', block: 'center' })
  root.querySelector<HTMLElement>('input, textarea, button')?.focus({ preventScroll: true })
}

/** Wraps a form item so focusField can find it. */
function Field({ name, children }: { name: string; children: React.ReactNode }) {
  return <div id={`field-${name}`}>{children}</div>
}

const priorityLabel = (p: string) => p.charAt(0).toUpperCase() + p.slice(1)

export default function NewRequestForm() {
  const { data: options, isLoading, isError, error } = useRequestFormOptions()

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Spin size="large" />
      </div>
    )
  }
  if (isError || !options) {
    return (
      <Alert
        type="error"
        showIcon
        message="Form tidak dapat dimuat"
        description={getApiErrorMessage(error, 'Data master untuk form request tidak dapat dimuat. Coba muat ulang halaman.')}
        className="rounded-xl"
      />
    )
  }
  return <NewRequestFormBody options={options} />
}

function NewRequestFormBody({ options }: { options: RequestFormOptions }) {
  const navigate = useNavigate()
  const location = useLocation()
  const state = location.state as { prefill?: RequestDetailItem; revisedFromId?: string } | undefined
  const prefill = state?.prefill
  const revisedFromId = state?.revisedFromId || prefill?.id

  // A resubmission is prefilled; a distributor that is no longer in master data is carried over as typed text.
  const isDistributorKnown = prefill?.distributor
    ? options.distributors.some((d) => d.name === prefill.distributor)
    : true

  const { mutateAsync: createRequest, isPending } = useCreateRequest()
  const [submitError, setSubmitError] = useState<string | null>(null)

  const {
    handleSubmit,
    watch,
    setValue,
    setError,
    control,
    formState: { errors },
  } = useForm<CreateRequestFormInput>({
    resolver: zodResolver(createRequestSchema),
    // Focus is decided by onInvalid, in the order of the form: RHF's own pick would be
    // whichever invalid field happens to hold a ref (only the plain inputs do, not the selects).
    shouldFocusError: false,
    defaultValues: {
      category: (prefill?.type as CategoryType) || 'Barcode',
      distributor: prefill ? (isDistributorKnown ? prefill.distributor : MANUAL_DISTRIBUTOR) : '',
      distributorManual: prefill && !isDistributorKnown ? prefill.distributor : '',
      outlet: prefill?.outlet || '',
      salesDivision: prefill?.salesDivision || '',
      reqType: prefill?.reqType || '',
      requesterRole: prefill?.byRole || 'SA',
      requesterName: prefill?.by || '',
      qty: prefill?.qty || 1,
      priority: prefill?.pri || 'normal',
      revisedFromId: revisedFromId || '',
    },
  })

  const selectedCategory = watch('category') as CategoryType
  const selectedDistributor = watch('distributor')
  const selectedRequesterRole = watch('requesterRole')

  const roleOptions = useMemo(
    () => options.requesterRoles[selectedCategory] ?? [],
    [options, selectedCategory]
  )

  // Update available requester roles when category changes
  useEffect(() => {
    if (roleOptions.length > 0 && !roleOptions.some((r) => r.code === selectedRequesterRole)) {
      setValue('requesterRole', roleOptions[0].code)
    }
  }, [roleOptions, selectedRequesterRole, setValue])

  // The outlets of the chosen distributor; every outlet when the distributor is typed in by hand.
  const availableOutlets = useMemo(() => {
    const list =
      selectedDistributor === MANUAL_DISTRIBUTOR
        ? options.outlets
        : (options.distributors.find((d) => d.name === selectedDistributor)?.outlets ?? [])
    const seen = new Set<string>()
    return list.filter((o) => !seen.has(o.name) && !!seen.add(o.name))
  }, [selectedDistributor, options])

  // Compute live approval chain preview
  const liveChain = computeChain(selectedCategory, selectedRequesterRole)

  const onInvalid = (invalid: FieldErrors<CreateRequestFormInput>) => {
    const first = FIELD_ORDER.find((name) => invalid[name])
    if (first) focusField(first)
  }

  const onSubmit = async (data: CreateRequestFormInput) => {
    try {
      setSubmitError(null)
      const createdItem = await createRequest({
        ...data,
        revisedFromId: revisedFromId || data.revisedFromId || undefined,
      })
      message.success(`Request ${createdItem.id} berhasil dikirim`)
      navigate('/requests')
    } catch (err: unknown) {
      const text = getApiErrorMessage(err, 'Gagal membuat request. Silakan coba lagi.')
      const field = getApiErrorField(err)
      if (field && (FIELD_ORDER as string[]).includes(field)) {
        // The server found a problem with one field: mark that field, like a local validation error.
        setError(field as keyof CreateRequestFormInput, { type: 'server', message: text })
        focusField(field)
      } else {
        setSubmitError(text)
      }
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div>
          <Text className="font-mono text-[10.5px] font-semibold uppercase tracking-widest text-rose-700 block mb-1">
            Requests / {revisedFromId ? 'Resubmit' : 'New'}
          </Text>
          <Title level={2} className="!text-slate-900 !m-0 font-extrabold tracking-tight">
            {revisedFromId ? 'Ajukan Ulang (Revisi)' : 'New request'}
          </Title>
          <Paragraph className="text-slate-500 text-sm font-medium !mb-0 mt-1">
            {revisedFromId
              ? `Mengajukan ulang sebagai revisi dari ${revisedFromId}. Sesuaikan data dan kirim kembali.`
              : 'Isi detail di bawah — rute approval ditampilkan secara real-time sebelum kamu kirim.'}
          </Paragraph>
        </div>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(revisedFromId ? `/requests/${revisedFromId}` : '/requests')}>
          Back
        </Button>
      </div>

      {revisedFromId && (
        <Alert
          message={
            <span>
              Pengajuan Ulang untuk <strong className="font-mono">{revisedFromId}</strong>
            </span>
          }
          description="Formulir telah diisi otomatis dari data request sebelumnya. Silakan periksa dan ubah data yang perlu diperbaiki sesuai catatan revisi."
          type="info"
          showIcon
          className="rounded-xl border-blue-200 bg-blue-50/60"
        />
      )}

      {submitError && (
        <Alert
          message="Gagal Membuat Request"
          description={submitError}
          type="error"
          showIcon
          className="rounded-xl"
        />
      )}

      {/* Main Form & Preview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left 2 Columns: Form */}
        <Card className="lg:col-span-2 shadow-sm border border-slate-200 rounded-2xl">
          <Form layout="vertical" onFinish={handleSubmit(onSubmit, onInvalid)}>
            {/* Category */}
            <Field name="category">
              <Form.Item
                label={<span className="font-semibold text-slate-700">Request Category</span>}
                required
                validateStatus={errors.category ? 'error' : ''}
                help={errors.category?.message}
              >
                <Controller
                  name="category"
                  control={control}
                  render={({ field }) => (
                    <Segmented
                      size="large"
                      options={['Barcode', 'Android', 'Server']}
                      value={field.value}
                      onChange={(val) => {
                        field.onChange(val)
                        setValue('outlet', '')
                      }}
                      className="bg-slate-100 p-1"
                    />
                  )}
                />
              </Form.Item>
            </Field>

            {/* Distributor */}
            <Field name="distributor">
              <Form.Item
                label={<span className="font-semibold text-slate-700">Distributor</span>}
                required
                validateStatus={errors.distributor ? 'error' : ''}
                help={errors.distributor?.message}
              >
                <Controller
                  name="distributor"
                  control={control}
                  render={({ field }) => (
                    <Select
                      size="large"
                      showSearch
                      placeholder="Select distributor…"
                      value={field.value || undefined}
                      onChange={(val) => {
                        field.onChange(val)
                        setValue('outlet', '')
                      }}
                      options={[
                        ...options.distributors.map((d) => ({ label: d.name, value: d.name })),
                        { label: 'Lainnya (isi manual)', value: MANUAL_DISTRIBUTOR },
                      ]}
                    />
                  )}
                />
              </Form.Item>
            </Field>

            {/* Manual Distributor Input */}
            {selectedDistributor === MANUAL_DISTRIBUTOR && (
              <Field name="distributorManual">
                <Form.Item
                  label={<span className="font-semibold text-slate-700">Nama Distributor Manual</span>}
                  required
                  validateStatus={errors.distributorManual ? 'error' : ''}
                  help={errors.distributorManual?.message}
                >
                  <Controller
                    name="distributorManual"
                    control={control}
                    render={({ field }) => (
                      <Input size="large" placeholder="Nama distributor manual" {...field} />
                    )}
                  />
                </Form.Item>
              </Field>
            )}

            {/* Outlet */}
            <Field name="outlet">
              <Form.Item
                label={<span className="font-semibold text-slate-700">Outlet</span>}
                required
                validateStatus={errors.outlet ? 'error' : ''}
                help={errors.outlet?.message}
              >
                <Controller
                  name="outlet"
                  control={control}
                  render={({ field }) => (
                    <Select
                      size="large"
                      showSearch
                      disabled={!selectedDistributor}
                      placeholder={selectedDistributor ? 'Pilih outlet…' : 'Pilih distributor dulu…'}
                      value={field.value || undefined}
                      onChange={field.onChange}
                      options={availableOutlets.map((o) => ({ label: o.name, value: o.name }))}
                    />
                  )}
                />
              </Form.Item>
            </Field>

            {/* Sales Division */}
            <Field name="salesDivision">
              <Form.Item
                label={<span className="font-semibold text-slate-700">Sales Division</span>}
                required
                validateStatus={errors.salesDivision ? 'error' : ''}
                help={errors.salesDivision?.message}
              >
                <Controller
                  name="salesDivision"
                  control={control}
                  render={({ field }) => (
                    <Select
                      size="large"
                      placeholder="Select division…"
                      value={field.value || undefined}
                      onChange={field.onChange}
                      options={options.salesDivisions.map((div) => ({ label: div, value: div }))}
                    />
                  )}
                />
              </Form.Item>
            </Field>

            {/* Request Type (if Android) */}
            {selectedCategory === 'Android' && (
              <Field name="reqType">
                <Form.Item
                  label={<span className="font-semibold text-slate-700">Request Type</span>}
                  required
                  validateStatus={errors.reqType ? 'error' : ''}
                  help={errors.reqType?.message}
                >
                  <Controller
                    name="reqType"
                    control={control}
                    render={({ field }) => (
                      <Select
                        size="large"
                        placeholder="Select type…"
                        value={field.value || undefined}
                        onChange={field.onChange}
                        options={options.requestTypes.map((t) => ({ label: t, value: t }))}
                      />
                    )}
                  />
                </Form.Item>
              </Field>
            )}

            {/* Requester Role & Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field name="requesterRole">
                <Form.Item
                  label={<span className="font-semibold text-slate-700">Requester Role</span>}
                  required
                  validateStatus={errors.requesterRole ? 'error' : ''}
                  help={errors.requesterRole?.message}
                >
                  <Controller
                    name="requesterRole"
                    control={control}
                    render={({ field }) => (
                      <Select
                        size="large"
                        value={field.value}
                        onChange={field.onChange}
                        options={roleOptions.map((r) => ({ label: r.label, value: r.code }))}
                      />
                    )}
                  />
                </Form.Item>
              </Field>

              <Field name="requesterName">
                <Form.Item
                  label={<span className="font-semibold text-slate-700">Requester Name</span>}
                  required
                  validateStatus={errors.requesterName ? 'error' : ''}
                  help={errors.requesterName?.message}
                >
                  <Controller
                    name="requesterName"
                    control={control}
                    render={({ field }) => (
                      <Input size="large" placeholder="Nama requester" {...field} />
                    )}
                  />
                </Form.Item>
              </Field>
            </div>

            {/* Quantity & Priority */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field name="qty">
                <Form.Item
                  label={<span className="font-semibold text-slate-700">Quantity (pcs)</span>}
                  required
                  validateStatus={errors.qty ? 'error' : ''}
                  help={errors.qty?.message}
                >
                  <Controller
                    name="qty"
                    control={control}
                    render={({ field }) => (
                      <InputNumber
                        size="large"
                        min={1}
                        className="w-full font-mono"
                        placeholder="e.g. 5"
                        value={field.value}
                        onChange={(val) => field.onChange(val || 1)}
                      />
                    )}
                  />
                </Form.Item>
              </Field>

              <Field name="priority">
                <Form.Item label={<span className="font-semibold text-slate-700">Priority</span>}>
                  <Controller
                    name="priority"
                    control={control}
                    render={({ field }) => (
                      <Segmented
                        size="large"
                        options={options.priorities.map((p) => ({ label: priorityLabel(p), value: p }))}
                        value={field.value}
                        onChange={field.onChange}
                      />
                    )}
                  />
                </Form.Item>
              </Field>
            </div>

            {/* Form Actions */}
            <div className="flex items-center gap-3 pt-4 border-t border-slate-200 mt-6">
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                loading={isPending}
                className="!font-semibold shadow-md"
              >
                {revisedFromId ? 'Kirim Pengajuan Ulang' : 'Kirim Request'}
              </Button>
              <Button size="large" onClick={() => navigate(revisedFromId ? `/requests/${revisedFromId}` : '/requests')}>
                Batal
              </Button>
            </div>
          </Form>
        </Card>

        {/* Right Column: Live Approval Preview */}
        <Card className="shadow-sm border border-slate-200 rounded-2xl">
          <Text className="font-mono text-[10.5px] font-semibold uppercase tracking-widest text-slate-400 block mb-2">
            PREVIEW RUTE APPROVAL
          </Text>

          {!liveChain.length ? (
            <Alert
              message="Otomatis Approved"
              description="Requester role berada di level tertinggi — request langsung ke Fulfillment."
              type="success"
              showIcon
              icon={<CheckCircleOutlined />}
              className="rounded-xl mt-2"
            />
          ) : (
            <>
              <Paragraph className="text-xs text-slate-500 mb-6">
                Permintaan kategori <b className="text-slate-800">{selectedCategory}</b> oleh{' '}
                <b className="text-slate-800">{ROLE_LABELS[selectedRequesterRole] || selectedRequesterRole}</b>{' '}
                harus disetujui oleh:
              </Paragraph>

              <Steps
                direction="vertical"
                size="small"
                current={-1}
                items={liveChain.map((role, idx) => ({
                  title: <span className="font-semibold text-slate-800">{ROLE_LABELS[role] || role}</span>,
                  description: <span className="text-xs text-slate-400">Approver Level {idx + 1}</span>,
                }))}
              />
            </>
          )}
        </Card>
      </div>
    </div>
  )
}
