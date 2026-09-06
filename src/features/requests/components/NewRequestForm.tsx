import { useEffect, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router'
import {
  Form,
  Input,
  Select,
  InputNumber,
  Segmented,
  Button,
  Card,
  Alert,
  Steps,
  Typography,
} from 'antd'
import { ArrowLeftOutlined, CheckCircleOutlined } from '@ant-design/icons'
import {
  createRequestSchema,
  type CreateRequestFormInput,
  type CategoryType,
} from '../types'
import {
  DISTRIBUTORS,
  DISTRIBUTOR_OUTLETS,
  SALES_DIVISIONS,
  REQ_TYPES,
  REQUESTER_ROLES_BY_CATEGORY,
  ROLE_LABELS,
  computeChain,
} from '../services/requestService'
import { useCreateRequest } from '../hooks/useRequests'

const { Title, Paragraph, Text } = Typography

export default function NewRequestForm() {
  const navigate = useNavigate()
  const { mutateAsync: createRequest, isPending } = useCreateRequest()
  const [submitError, setSubmitError] = useState<string | null>(null)

  const {
    handleSubmit,
    watch,
    setValue,
    control,
    formState: { errors },
  } = useForm<CreateRequestFormInput>({
    resolver: zodResolver(createRequestSchema),
    defaultValues: {
      category: 'Barcode',
      distributor: '',
      distributorManual: '',
      outlet: '',
      salesDivision: '',
      reqType: '',
      requesterRole: 'SA',
      requesterName: 'Admin Staff',
      qty: 5,
      priority: 'normal',
    },
  })

  const selectedCategory = watch('category') as CategoryType
  const selectedDistributor = watch('distributor')
  const selectedRequesterRole = watch('requesterRole')

  // Update available requester roles when category changes
  useEffect(() => {
    const roles = REQUESTER_ROLES_BY_CATEGORY[selectedCategory] || []
    if (roles.length > 0 && !roles.includes(selectedRequesterRole)) {
      setValue('requesterRole', roles[0])
    }
  }, [selectedCategory, selectedRequesterRole, setValue])

  // Available outlets for selected distributor
  const availableOutlets = DISTRIBUTOR_OUTLETS[selectedDistributor] || []

  // Compute live approval chain preview
  const liveChain = computeChain(selectedCategory, selectedRequesterRole)

  const onSubmit = async (data: CreateRequestFormInput) => {
    try {
      setSubmitError(null)
      const createdItem = await createRequest(data)
      navigate(`/requests/${createdItem.id}`)
    } catch (err: unknown) {
      const errorObj = err as { message?: string }
      setSubmitError(errorObj.message || 'Gagal membuat request. Silakan coba lagi.')
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div>
          <Text className="font-mono text-[10.5px] font-semibold uppercase tracking-widest text-rose-700 block mb-1">
            Requests / New
          </Text>
          <Title level={2} className="!text-slate-900 !m-0 font-extrabold tracking-tight">
            New request
          </Title>
          <Paragraph className="text-slate-500 text-sm font-medium !mb-0 mt-1">
            Isi detail di bawah — rute approval ditampilkan secara real-time sebelum kamu kirim.
          </Paragraph>
        </div>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/requests')}>
          Back
        </Button>
      </div>

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
          <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
            {/* Category */}
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

            {/* Distributor */}
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
                      ...DISTRIBUTORS.map((d) => ({ label: d, value: d })),
                      { label: 'Lainnya (isi manual)', value: '__other__' },
                    ]}
                  />
                )}
              />
            </Form.Item>

            {/* Manual Distributor Input */}
            {selectedDistributor === '__other__' && (
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
            )}

            {/* Outlet */}
            <Form.Item
              label={<span className="font-semibold text-slate-700">Outlet</span>}
              required
              validateStatus={errors.outlet ? 'error' : ''}
              help={errors.outlet?.message}
            >
              <Controller
                name="outlet"
                control={control}
                render={({ field }) =>
                  selectedDistributor === '__other__' ? (
                    <Input size="large" placeholder="Nama outlet" {...field} />
                  ) : (
                    <Select
                      size="large"
                      showSearch
                      disabled={!selectedDistributor}
                      placeholder={selectedDistributor ? 'Pilih outlet…' : 'Pilih distributor dulu…'}
                      value={field.value || undefined}
                      onChange={field.onChange}
                      options={availableOutlets.map((o) => ({ label: o, value: o }))}
                    />
                  )
                }
              />
            </Form.Item>

            {/* Sales Division */}
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
                    options={SALES_DIVISIONS.map((div) => ({ label: div, value: div }))}
                  />
                )}
              />
            </Form.Item>

            {/* Request Type (if Android) */}
            {selectedCategory === 'Android' && (
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
                      options={REQ_TYPES.map((t) => ({ label: t, value: t }))}
                    />
                  )}
                />
              </Form.Item>
            )}

            {/* Requester Role & Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                      options={(REQUESTER_ROLES_BY_CATEGORY[selectedCategory] || []).map((r) => ({
                        label: ROLE_LABELS[r] || r,
                        value: r,
                      }))}
                    />
                  )}
                />
              </Form.Item>

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
            </div>

            {/* Quantity & Priority */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

              <Form.Item label={<span className="font-semibold text-slate-700">Priority</span>}>
                <Controller
                  name="priority"
                  control={control}
                  render={({ field }) => (
                    <Segmented
                      size="large"
                      options={[
                        { label: 'Normal', value: 'normal' },
                        { label: 'High', value: 'high' },
                        { label: 'Urgent', value: 'urgent' },
                      ]}
                      value={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />
              </Form.Item>
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
                Kirim Request
              </Button>
              <Button size="large" onClick={() => navigate('/requests')}>
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
