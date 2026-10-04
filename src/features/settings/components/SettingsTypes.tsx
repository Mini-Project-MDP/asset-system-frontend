import { useState } from 'react'
import { Modal, Form, Input, Select, Switch, Checkbox, message } from 'antd'
import { PlusOutlined, EditOutlined } from '@ant-design/icons'
import { getApiErrorMessage } from '@/shared/utils/apiError'
import { useGetSettingsTypes, useAddType, useUpdateType } from '../hooks/useSettings'
import type { AssetTypeItem, AssetTypeInput } from '../types'

export default function SettingsTypes() {
  const [showInactive, setShowInactive] = useState(false)
  const { data: types = [], isLoading, isError, error } = useGetSettingsTypes(showInactive)
  const addMutation = useAddType()
  const updateMutation = useUpdateType()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingType, setEditingType] = useState<AssetTypeItem | null>(null)
  const [form] = Form.useForm<AssetTypeInput>()

  const handleOpenAdd = () => {
    setEditingType(null)
    form.resetFields()
    setIsModalOpen(true)
  }

  const handleOpenEdit = (item: AssetTypeItem) => {
    setEditingType(item)
    form.setFieldsValue({
      code: item.code,
      name: item.name,
      identifier: item.identifier_required ? item.identifier_type : 'NONE',
      is_active: item.is_active,
    })
    setIsModalOpen(true)
  }

  const handleSubmit = async () => {
    const values = await form.validateFields().catch(() => null)
    if (!values) return // inline validation errors are already shown on the form

    try {
      if (editingType) {
        await updateMutation.mutateAsync({ id: editingType.id, data: values })
        message.success('Tipe aset berhasil diperbarui')
      } else {
        await addMutation.mutateAsync(values)
        message.success('Tipe aset baru berhasil ditambahkan')
      }
      setIsModalOpen(false)
    } catch (err) {
      message.error(getApiErrorMessage(err, 'Gagal menyimpan tipe aset'))
    }
  }

  return (
    <>
      <div className="card">
        <div className="card-hd">
          <h3>Asset types</h3>
          <div className="r flex items-center gap-3">
            <Checkbox checked={showInactive} onChange={(e) => setShowInactive(e.target.checked)}>
              Tampilkan nonaktif
            </Checkbox>
            <button type="button" className="btn btn-primary btn-sm" onClick={handleOpenAdd}>
              <PlusOutlined /> Add type
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-slate-400 text-xs">Loading asset types…</div>
        ) : isError ? (
          <div className="p-8 text-center text-red-500 text-xs">
            {getApiErrorMessage(error, 'Gagal memuat data tipe aset')}
          </div>
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
                <tr key={t.id} style={t.is_active ? undefined : { opacity: 0.55 }}>
                  <td className="font-semibold text-slate-800">
                    {t.name}
                    {!t.is_active && (
                      <span className="tag neutral ml-2">
                        <span className="dot" />
                        Nonaktif
                      </span>
                    )}
                  </td>
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
        confirmLoading={addMutation.isPending || updateMutation.isPending}
      >
        <Form form={form} layout="vertical" className="mt-4">
          <Form.Item
            name="name"
            label="Nama Tipe Aset"
            rules={[{ required: true, whitespace: true, message: 'Nama tipe aset wajib diisi' }]}
          >
            <Input placeholder="Mis. Laptop Enterprise" />
          </Form.Item>
          <Form.Item
            name="code"
            label="Kode Tipe"
            rules={[{ required: true, whitespace: true, message: 'Kode tipe wajib diisi' }]}
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
                { label: 'None (Tanpa identifier khusus)', value: 'NONE' },
                { label: 'Yes — IMEI required', value: 'IMEI' },
                { label: 'Yes — Serial required', value: 'SERIAL_NUMBER' },
              ]}
            />
          </Form.Item>
          {editingType && (
            <Form.Item
              name="is_active"
              label="Status"
              valuePropName="checked"
              extra="Tipe aset tidak dapat dinonaktifkan selama masih dipakai request yang belum selesai."
            >
              <Switch checkedChildren="Aktif" unCheckedChildren="Nonaktif" />
            </Form.Item>
          )}
        </Form>
      </Modal>
    </>
  )
}
