import { useState } from 'react'
import { Modal, Form, Input, Select, message } from 'antd'
import { PlusOutlined, EditOutlined, InfoCircleOutlined } from '@ant-design/icons'
import {
  useGetSettingsDistributors,
  useAddDistributor,
  useUpdateDistributor,
  useGetSettingsOutlets,
} from '../hooks/useSettings'
import type { DistributorItem } from '../types'

export default function SettingsDistributors() {
  const { data: distributors = [], isLoading } = useGetSettingsDistributors()
  const { data: outlets = [] } = useGetSettingsOutlets()
  const addMutation = useAddDistributor()
  const updateMutation = useUpdateDistributor()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingDistributor, setEditingDistributor] = useState<DistributorItem | null>(null)
  const [form] = Form.useForm()

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
    try {
      const values = await form.validateFields()
      if (editingDistributor) {
        await updateMutation.mutateAsync({ id: editingDistributor.id, data: values })
        message.success('Distributor berhasil diperbarui')
      } else {
        await addMutation.mutateAsync(values)
        message.success('Distributor baru berhasil ditambahkan')
      }
      setIsModalOpen(false)
    } catch {
      // validation error
    }
  }

  const outletOptions = outlets.map((o) => ({ label: o.name, value: o.name }))

  return (
    <div className="flex flex-col gap-4">
      <div className="callout">
        <InfoCircleOutlined className="text-brand flex-none mt-0.5" />
        <div>
          1 distributor mencakup beberapa outlet. Mapping ini menentukan pilihan Outlet yang muncul di
          form New Request setelah Distributor dipilih.
        </div>
      </div>

      <div className="card">
        <div className="card-hd">
          <h3>Distributor master &amp; outlet mapping</h3>
          <div className="r">
            <button type="button" className="btn btn-primary btn-sm" onClick={handleOpenAdd}>
              <PlusOutlined /> Add distributor
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-slate-400 text-xs">Loading distributors…</div>
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
                <tr key={d.id}>
                  <td className="font-semibold text-slate-800">{d.name}</td>
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
      >
        <Form form={form} layout="vertical" className="mt-4">
          <Form.Item
            name="name"
            label="Nama Distributor"
            rules={[{ required: true, message: 'Nama distributor wajib diisi' }]}
          >
            <Input placeholder="Mis. PT Logistics Utama" />
          </Form.Item>
          <Form.Item
            name="outlets"
            label="Outlet Terkait"
            rules={[{ required: true, message: 'Minimal pilih 1 outlet' }]}
          >
            <Select
              mode="tags"
              placeholder="Pilih atau ketik outlet…"
              options={outletOptions}
              className="w-full"
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
