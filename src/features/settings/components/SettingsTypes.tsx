import { useState } from 'react'
import { Modal, Form, Input, Select, message } from 'antd'
import { PlusOutlined, EditOutlined } from '@ant-design/icons'
import { useGetSettingsTypes, useAddType, useUpdateType } from '../hooks/useSettings'
import type { AssetTypeItem } from '../types'

export default function SettingsTypes() {
  const { data: types = [], isLoading } = useGetSettingsTypes()
  const addMutation = useAddType()
  const updateMutation = useUpdateType()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingType, setEditingType] = useState<AssetTypeItem | null>(null)
  const [form] = Form.useForm()

  const handleOpenAdd = () => {
    setEditingType(null)
    form.resetFields()
    setIsModalOpen(true)
  }

  const handleOpenEdit = (item: AssetTypeItem) => {
    setEditingType(item)
    form.setFieldsValue(item)
    setIsModalOpen(true)
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      if (editingType) {
        await updateMutation.mutateAsync({ id: editingType.id, data: values })
        message.success('Tipe aset berhasil diperbarui')
      } else {
        await addMutation.mutateAsync(values)
        message.success('Tipe aset baru berhasil ditambahkan')
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
          <h3>Asset types</h3>
          <div className="r">
            <button type="button" className="btn btn-primary btn-sm" onClick={handleOpenAdd}>
              <PlusOutlined /> Add type
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-slate-400 text-xs">Loading asset types…</div>
        ) : (
          <table className="tbl">
            <thead>
              <tr>
                <th>Type</th>
                <th>Code</th>
                <th>Identifier</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {types.map((t) => (
                <tr key={t.id}>
                  <td className="font-semibold text-slate-800">{t.name}</td>
                  <td className="mono">{t.code}</td>
                  <td>
                    {t.identifier === 'No' ? (
                      <span className="tag neutral">
                        <span className="dot" />
                        None
                      </span>
                    ) : (
                      <span className="tag brand">
                        <span className="dot" />
                        {t.identifier}
                      </span>
                    )}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleOpenEdit(t)}
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
        title={editingType ? 'Edit Asset Type' : 'Add New Asset Type'}
        open={isModalOpen}
        onOk={handleSubmit}
        onCancel={() => setIsModalOpen(false)}
        okText={editingType ? 'Simpan' : 'Tambah'}
        cancelText="Batal"
      >
        <Form form={form} layout="vertical" className="mt-4">
          <Form.Item
            name="name"
            label="Nama Tipe Aset"
            rules={[{ required: true, message: 'Nama tipe aset wajib diisi' }]}
          >
            <Input placeholder="Mis. Laptop Enterprise" />
          </Form.Item>
          <Form.Item
            name="code"
            label="Kode Tipe"
            rules={[{ required: true, message: 'Kode tipe wajib diisi' }]}
          >
            <Input placeholder="Mis. LP" className="font-mono uppercase" />
          </Form.Item>
          <Form.Item
            name="identifier"
            label="Kebutuhan Identifier (IMEI / Serial)"
            rules={[{ required: true, message: 'Kebutuhan identifier wajib dipilih' }]}
          >
            <Select
              options={[
                { label: 'None (Tanpa identifier khusus)', value: 'No' },
                { label: 'Yes — IMEI required', value: 'Yes — IMEI required' },
                { label: 'Yes — Serial required', value: 'Yes — Serial required' },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}
