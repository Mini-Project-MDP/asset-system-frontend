import { useMemo, useState } from 'react'
import { Modal, Form, Input, Select, Switch, Checkbox, message } from 'antd'
import { PlusOutlined, EditOutlined, InfoCircleOutlined } from '@ant-design/icons'
import { getApiErrorMessage } from '@/shared/utils/apiError'
import {
  useGetSettingsDistributors,
  useAddDistributor,
  useUpdateDistributor,
  useGetSettingsOutlets,
} from '../hooks/useSettings'
import type { DistributorItem, DistributorInput } from '../types'

export default function SettingsDistributors() {
  const [showInactive, setShowInactive] = useState(false)
  const {
    data: distributors = [],
    isLoading,
    isError,
    error,
  } = useGetSettingsDistributors(showInactive)
  const { data: outlets = [] } = useGetSettingsOutlets()
  const addMutation = useAddDistributor()
  const updateMutation = useUpdateDistributor()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingDistributor, setEditingDistributor] = useState<DistributorItem | null>(null)
  const [form] = Form.useForm<DistributorInput>()

  const handleOpenAdd = () => {
    setEditingDistributor(null)
    form.resetFields()
    setIsModalOpen(true)
  }

  const handleOpenEdit = (item: DistributorItem) => {
    setEditingDistributor(item)
    form.setFieldsValue(item)
    setIsModalOpen(true)
  }

  const handleSubmit = async () => {
    const values = await form.validateFields().catch(() => null)
    if (!values) return // inline validation errors are already shown on the form

    try {
      if (editingDistributor) {
        await updateMutation.mutateAsync({ id: editingDistributor.id, data: values })
        message.success('Distributor berhasil diperbarui')
      } else {
        await addMutation.mutateAsync(values)
        message.success('Distributor baru berhasil ditambahkan')
      }
      setIsModalOpen(false)
    } catch (err) {
      message.error(getApiErrorMessage(err, 'Gagal menyimpan distributor'))
    }
  }

  // One outlet is served by exactly one distributor, so outlets already mapped
  // to another distributor are shown but cannot be picked.
  const outletOptions = useMemo(() => {
    const takenBy = new Map<string, string>()
    for (const d of distributors) {
      if (d.id === editingDistributor?.id) continue
      for (const outletId of d.outlet_ids) takenBy.set(outletId, d.name)
    }
    return outlets.map((o) => {
      const owner = takenBy.get(o.id)
      return {
        label: owner ? `${o.name} — sudah dicover ${owner}` : o.name,
        value: o.id,
        disabled: !!owner,
      }
    })
  }, [outlets, distributors, editingDistributor])

  return (
    <div className="flex flex-col gap-4">
      <div className="callout">
        <InfoCircleOutlined className="text-brand flex-none mt-0.5" />
        <div>
          1 distributor mencakup beberapa outlet, dan 1 outlet hanya dilayani 1 distributor. Mapping ini
          menentukan pilihan Outlet yang muncul di form New Request setelah Distributor dipilih.
        </div>
      </div>

      <div className="card">
        <div className="card-hd">
          <h3>Distributor master &amp; outlet mapping</h3>
          <div className="r flex items-center gap-3">
            <Checkbox checked={showInactive} onChange={(e) => setShowInactive(e.target.checked)}>
              Tampilkan nonaktif
            </Checkbox>
            <button type="button" className="btn btn-primary btn-sm" onClick={handleOpenAdd}>
              <PlusOutlined /> Add distributor
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-slate-400 text-xs">Loading distributors…</div>
        ) : isError ? (
          <div className="p-8 text-center text-red-500 text-xs">
            {getApiErrorMessage(error, 'Gagal memuat data distributor')}
          </div>
        ) : (
          <table className="tbl">
            <thead>
              <tr>
                <th>Distributor</th>
                <th>Outlet yang dicover</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {distributors.map((d) => (
                <tr key={d.id} style={d.is_active ? undefined : { opacity: 0.55 }}>
                  <td className="font-semibold text-slate-800">
                    {d.name}
                    <div className="mono text-xs text-slate-500 font-normal">{d.code}</div>
                    {!d.is_active && (
                      <span className="tag neutral">
                        <span className="dot" />
                        Nonaktif
                      </span>
                    )}
                  </td>
                  <td>
                    <div className="flex flex-wrap gap-1.5 py-1">
                      {d.outlets.map((o, idx) => (
                        <span key={idx} className="tag neutral">
                          <span className="dot" />
                          {o}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleOpenEdit(d)}
                    >
                      <EditOutlined /> Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal
        title={editingDistributor ? 'Edit Distributor' : 'Add New Distributor'}
        open={isModalOpen}
        onOk={handleSubmit}
        onCancel={() => setIsModalOpen(false)}
        okText={editingDistributor ? 'Simpan' : 'Tambah'}
        cancelText="Batal"
        confirmLoading={addMutation.isPending || updateMutation.isPending}
      >
        <Form form={form} layout="vertical" className="mt-4">
          <Form.Item
            name="code"
            label="Kode Distributor"
            rules={[{ required: true, whitespace: true, message: 'Kode distributor wajib diisi' }]}
          >
            <Input placeholder="Mis. DIST-005" />
          </Form.Item>
          <Form.Item
            name="name"
            label="Nama Distributor"
            rules={[{ required: true, whitespace: true, message: 'Nama distributor wajib diisi' }]}
          >
            <Input placeholder="Mis. PT Logistics Utama" />
          </Form.Item>
          <Form.Item
            name="outlet_ids"
            label="Outlet Terkait"
            rules={[{ required: true, type: 'array', min: 1, message: 'Minimal pilih 1 outlet' }]}
          >
            <Select
              mode="multiple"
              placeholder="Pilih outlet…"
              options={outletOptions}
              optionFilterProp="label"
              className="w-full"
            />
          </Form.Item>
          {editingDistributor && (
            <Form.Item
              name="is_active"
              label="Status"
              valuePropName="checked"
              extra="Distributor tidak dapat dinonaktifkan selama masih dipakai request yang belum selesai."
            >
              <Switch checkedChildren="Aktif" unCheckedChildren="Nonaktif" />
            </Form.Item>
          )}
        </Form>
      </Modal>
    </div>
  )
}
