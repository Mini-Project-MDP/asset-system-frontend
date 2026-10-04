import { useState } from 'react'
import { Modal, Form, Input, Switch, Checkbox, message } from 'antd'
import { PlusOutlined, EditOutlined } from '@ant-design/icons'
import { getApiErrorMessage } from '@/shared/utils/apiError'
import { useGetSettingsOutlets, useAddOutlet, useUpdateOutlet } from '../hooks/useSettings'
import type { OutletItem, OutletInput } from '../types'

export default function SettingsOutlets() {
  const [showInactive, setShowInactive] = useState(false)
  const { data: outlets = [], isLoading, isError, error } = useGetSettingsOutlets(showInactive)
  const addMutation = useAddOutlet()
  const updateMutation = useUpdateOutlet()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingOutlet, setEditingOutlet] = useState<OutletItem | null>(null)
  const [form] = Form.useForm<OutletInput>()

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
    const values = await form.validateFields().catch(() => null)
    if (!values) return // inline validation errors are already shown on the form

    try {
      if (editingOutlet) {
        await updateMutation.mutateAsync({ id: editingOutlet.id, data: values })
        message.success('Outlet berhasil diperbarui')
      } else {
        await addMutation.mutateAsync(values)
        message.success('Outlet baru berhasil ditambahkan')
      }
      setIsModalOpen(false)
    } catch (err) {
      message.error(getApiErrorMessage(err, 'Gagal menyimpan outlet'))
    }
  }

  return (
    <>
      <div className="card">
        <div className="card-hd">
          <h3>Outlet master</h3>
          <div className="r flex items-center gap-3">
            <Checkbox checked={showInactive} onChange={(e) => setShowInactive(e.target.checked)}>
              Tampilkan nonaktif
            </Checkbox>
            <button type="button" className="btn btn-primary btn-sm" onClick={handleOpenAdd}>
              <PlusOutlined /> Add outlet
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-slate-400 text-xs">Loading outlets…</div>
        ) : isError ? (
          <div className="p-8 text-center text-red-500 text-xs">
            {getApiErrorMessage(error, 'Gagal memuat data outlet')}
          </div>
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
                <tr key={o.id} style={o.is_active ? undefined : { opacity: 0.55 }}>
                  <td className="mono font-semibold">{o.code}</td>
                  <td>
                    {o.name}
                    {!o.is_active && (
                      <span className="tag neutral ml-2">
                        <span className="dot" />
                        Nonaktif
                      </span>
                    )}
                  </td>
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
        confirmLoading={addMutation.isPending || updateMutation.isPending}
      >
        <Form form={form} layout="vertical" className="mt-4">
          <Form.Item
            name="code"
            label="Kode Outlet"
            rules={[{ required: true, whitespace: true, message: 'Kode outlet wajib diisi' }]}
          >
            <Input placeholder="Mis. OUT-035" />
          </Form.Item>
          <Form.Item
            name="name"
            label="Nama Outlet"
            rules={[{ required: true, whitespace: true, message: 'Nama outlet wajib diisi' }]}
          >
            <Input placeholder="Mis. Semarang Tengah" />
          </Form.Item>
          <Form.Item
            name="region"
            label="Wilayah / Region"
            rules={[{ required: true, whitespace: true, message: 'Region wajib diisi' }]}
          >
            <Input placeholder="Mis. Central Java" />
          </Form.Item>
          {editingOutlet && (
            <Form.Item
              name="is_active"
              label="Status"
              valuePropName="checked"
              extra="Outlet tidak dapat dinonaktifkan selama masih dipakai request yang belum selesai."
            >
              <Switch checkedChildren="Aktif" unCheckedChildren="Nonaktif" />
            </Form.Item>
          )}
        </Form>
      </Modal>
    </>
  )
}
