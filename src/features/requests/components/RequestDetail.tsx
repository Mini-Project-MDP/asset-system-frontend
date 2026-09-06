import React from 'react'
import { useNavigate, useParams } from 'react-router'
import {
  Card,
  Steps,
  Timeline,
  Descriptions,
  Tag,
  Button,
  Typography,
  Spin,
  Alert,
} from 'antd'
import {
  ArrowLeftOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  SyncOutlined,
} from '@ant-design/icons'
import { useGetRequestDetail } from '../hooks/useRequests'
import { ROLE_LABELS } from '../services/requestService'
import type { ApprovalChainStep, HistoryItem } from '../types'

const { Title, Paragraph, Text } = Typography

export default function RequestDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: request, isLoading, isError } = useGetRequestDetail(id || '')

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px]">
        <Spin size="large" />
        <Text className="text-slate-400 mt-4">Memuat detail request...</Text>
      </div>
    )
  }

  if (isError || !request) {
    return (
      <Card className="rounded-2xl shadow-sm border border-slate-200">
        <Alert
          message="Request Tidak Ditemukan"
          description={`Request dengan ID ${id} tidak ditemukan atau telah dihapus.`}
          type="error"
          showIcon
        />
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/requests')} className="mt-4">
          Kembali ke Requests
        </Button>
      </Card>
    )
  }

  // Find active step index in approval chain
  const currentStepIndex = request.chain.findIndex((n) => n.status === 'current')

  const getStepStatus = (status: ApprovalChainStep['status']) => {
    switch (status) {
      case 'approved':
        return 'finish'
      case 'current':
        return 'process'
      case 'rejected':
      case 'revision':
        return 'error'
      default:
        return 'wait'
    }
  }

  const getStepIcon = (status: ApprovalChainStep['status']) => {
    switch (status) {
      case 'approved':
        return <CheckCircleOutlined />
      case 'current':
        return <SyncOutlined spin />
      case 'rejected':
      case 'revision':
        return <CloseCircleOutlined />
      default:
        return <ClockCircleOutlined />
    }
  }

  const renderChainSteps = (chain: ApprovalChainStep[]) => {
    if (!chain || chain.length === 0) {
      return (
        <Alert
          message="Tidak Ada Approval"
          description="Requester role berada di level tertinggi — request langsung dikirim ke Fulfillment."
          type="info"
          showIcon
          className="rounded-xl"
        />
      )
    }

    return (
      <Steps
        current={currentStepIndex >= 0 ? currentStepIndex : chain.length}
        size="small"
        items={chain.map((n) => ({
          title: <span className="font-semibold text-slate-800">{n.roleLabel || n.role}</span>,
          description: (
            <span className="capitalize text-xs font-mono text-slate-400">
              {n.status === 'current' ? 'Reviewing' : n.status}
            </span>
          ),
          status: getStepStatus(n.status),
          icon: getStepIcon(n.status),
        }))}
      />
    )
  }

  const renderTimeline = (hist: HistoryItem[]) => {
    return (
      <Timeline
        className="mt-2"
        items={hist.map((ev) => ({
          color: ev.type === 'go' ? 'green' : ev.type === 'warn' ? 'amber' : 'red',
          children: (
            <div className="flex flex-col gap-0.5">
              <Text className="font-semibold text-sm text-slate-800">
                {ev.role} — {ev.action}
              </Text>
              <Text className="font-mono text-xs text-slate-400">{ev.date}</Text>
            </div>
          ),
        }))}
      />
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <Text className="font-mono text-[10.5px] font-semibold uppercase tracking-widest text-rose-700 block mb-1">
            Request Detail
          </Text>
          <Title level={2} className="!font-mono !text-slate-900 !m-0 font-extrabold tracking-tight">
            {request.id}
          </Title>
          <Paragraph className="text-slate-500 text-sm font-medium !mb-0 mt-1">
            {request.type} · {request.outlet}
          </Paragraph>
        </div>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/requests')}>
          Back
        </Button>
      </div>

      {/* Approval Route Card */}
      <Card className="shadow-sm border border-slate-200 rounded-2xl">
        <Text className="font-mono text-[10.5px] font-semibold uppercase tracking-widest text-slate-400 block mb-4">
          APPROVAL ROUTE
        </Text>
        {renderChainSteps(request.chain)}
      </Card>

      {/* Details & History Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left 2 Columns: Request details */}
        <Card
          title={
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800">Request details</span>
              <span className={`tag ${request.statusTag.cls}`}>
                <span className="dot" />
                {request.statusTag.text}
              </span>
            </div>
          }
          className="lg:col-span-2 shadow-sm border border-slate-200 rounded-2xl"
        >
          <Descriptions
            bordered
            column={{ xs: 1, sm: 2 }}
            size="middle"
            className="[&_.ant-descriptions-item-label]:!bg-slate-50 [&_.ant-descriptions-item-label]:!font-semibold [&_.ant-descriptions-item-label]:!text-slate-600"
            items={[
              {
                key: 'id',
                label: 'Request ID',
                children: <Text className="font-mono font-bold text-rose-700">{request.id}</Text>,
              },
              {
                key: 'category',
                label: 'Category',
                children: request.type,
              },
              {
                key: 'outlet',
                label: 'Outlet',
                children: request.outlet,
              },
              {
                key: 'distributor',
                label: 'Distributor',
                children: request.distributor,
              },
              {
                key: 'salesDivision',
                label: 'Sales Division',
                children: request.salesDivision,
              },
              {
                key: 'qty',
                label: 'Quantity',
                children: <Text className="font-mono font-bold">{request.qty} pcs</Text>,
              },
              {
                key: 'priority',
                label: 'Priority',
                children: <span className={`pri ${request.pri}`}>{request.pri}</span>,
              },
              ...(request.reqType
                ? [
                    {
                      key: 'reqType',
                      label: 'Request Type',
                      children: request.reqType,
                    },
                  ]
                : []),
              {
                key: 'by',
                label: 'Requested by',
                children: request.by,
              },
              {
                key: 'byRole',
                label: 'Requester role',
                children: ROLE_LABELS[request.byRole] || request.byRole,
              },
              {
                key: 'submitted',
                label: 'Submitted Date',
                children: <Text className="font-mono">{request.date}</Text>,
              },
            ]}
          />
        </Card>

        {/* Right 1 Column: Approval history */}
        <Card
          title={<span className="font-bold text-slate-800">Approval history</span>}
          className="shadow-sm border border-slate-200 rounded-2xl"
        >
          {renderTimeline(request.hist)}
        </Card>
      </div>
    </div>
  )
}
