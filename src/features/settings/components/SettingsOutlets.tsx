import { useState } from 'react'
import { Modal, Form, Input, message } from 'antd'
import { PlusOutlined, EditOutlined } from '@ant-design/icons'
import { useGetSettingsOutlets, useAddOutlet, useUpdateOutlet } from '../hooks/useSettings'
import type { OutletItem } from '../types'

export default function SettingsOutlets() {
  const { data: outlets = [], isLoading } = useGetSettingsOutlets()
  const addMutation = useAddOutlet()
  const updateMutation = useUpdateOutlet()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingOutlet, setEditingOutlet] = useState<OutletItem | null>(null)
  const [form] = Form.useForm()

  const handleOpenAdd = () => {
    setEditingOutlet(null)
    form.resetFields()
    setIsModalOpen(true)
  }

  const handleOpenEdit = (item: OutletItem) => {
    setEditingOutlet(item)
    form.setFieldsValue(item)
    setIsModalOpen(true)
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      if (editingOutlet) {
        await updateMutation.mutateAsync({ id: editingOutlet.id, data: values })
        message.success('Outlet berhasil diperbarui')
      } else {
        await addMutation.mutateAsync(values)
        message.success('Outlet baru berhasil ditambahkan')
      }
      setIsModalOpen(false)
    } catch {
      // validation error
    }
  }

  return (
    <>
      <div className="card">
        <div className="card-hd">
          <h3>Outlet master</h3>
          <div className="r">
            <button type="button" className="btn btn-primary btn-sm" onClick={handleOpenAdd}>
              <PlusOutlined /> Add outlet
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-slate-400 text-xs">Loading outlets…</div>
        ) : (
          <table className="tbl">
            <thead>
              <tr>
                <th>Code</th>
                <th>Outlet name</th>
                <th>Region</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {outlets.map((o) => (
                <tr key={o.id}>
                  <td className="mono font-semibold">{o.code}</td>
                  <td>{o.name}</td>
                  <td>{o.region}</td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleOpenEdit(o)}
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
        title={editingOutlet ? 'Edit Outlet' : 'Add New Outlet'}
        open={isModalOpen}
        onOk={handleSubmit}
        onCancel={() => setIsModalOpen(false)}
        okText={editingOutlet ? 'Simpan' : 'Tambah'}
        cancelText="Batal"
      >
        <Form form={form} layout="vertical" className="mt-4">
          <Form.Item
            name="code"
            label="Kode Outlet"
            rules={[{ required: true, message: 'Kode outlet wajib diisi' }]}
          >
            <Input placeholder="Mis. OUT-035" />
          </Form.Item>
          <Form.Item
            name="name"
            label="Nama Outlet"
            rules={[{ required: true, message: 'Nama outlet wajib diisi' }]}
          >
            <Input placeholder="Mis. Semarang Tengah" />
          </Form.Item>
          <Form.Item
            name="region"
            label="Wilayah / Region"
            rules={[{ required: true, message: 'Region wajib diisi' }]}
          >
            <Input placeholder="Mis. Central Java" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}
