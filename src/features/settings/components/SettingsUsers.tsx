import { useState } from 'react'
import { Modal, Form, Input, Select, message } from 'antd'
import { PlusOutlined, EditOutlined } from '@ant-design/icons'
import { useGetSettingsUsers, useAddUser, useUpdateUser } from '../hooks/useSettings'
import type { UserRoleItem } from '../types'

export default function SettingsUsers() {
  const { data: users = [], isLoading } = useGetSettingsUsers()
  const addMutation = useAddUser()
  const updateMutation = useUpdateUser()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<UserRoleItem | null>(null)
  const [form] = Form.useForm()

  const handleOpenAdd = () => {
    setEditingUser(null)
    form.resetFields()
    setIsModalOpen(true)
  }

  const handleOpenEdit = (item: UserRoleItem) => {
    setEditingUser(item)
    form.setFieldsValue(item)
    setIsModalOpen(true)
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      if (editingUser) {
        await updateMutation.mutateAsync({ id: editingUser.id, data: values })
        message.success('User & role berhasil diperbarui')
      } else {
        await addMutation.mutateAsync(values)
        message.success('User baru berhasil ditambahkan')
      }
      setIsModalOpen(false)
    } catch {
      // validation error
    }
  }

  const roleOptions = [
    { label: 'Sales Admin', value: 'Sales Admin' },
    { label: 'Sales Supervisor', value: 'Sales Supervisor' },
    { label: 'Regional Sales Manager', value: 'Regional Sales Manager' },
    { label: 'Group Regional Sales Manager', value: 'Group Regional Sales Manager' },
    { label: 'National Sales Manager', value: 'National Sales Manager' },
    { label: 'Sales Director', value: 'Sales Director' },
    { label: 'Asset Team', value: 'Asset Team' },
    { label: 'Admin', value: 'Admin' },
  ]

  return (
    <>
      <div className="card">
        <div className="card-hd">
          <h3>Users &amp; roles</h3>
          <div className="r">
            <button type="button" className="btn btn-primary btn-sm" onClick={handleOpenAdd}>
              <PlusOutlined /> Add user
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-slate-400 text-xs">Loading users…</div>
        ) : (
          <table className="tbl">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td className="font-semibold text-slate-800">{u.name}</td>
                  <td className="mono text-xs">{u.email}</td>
                  <td>
                    <span className="tag neutral">
                      <span className="dot" />
                      {u.role}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleOpenEdit(u)}
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
        title={editingUser ? 'Edit User & Role' : 'Add New User'}
        open={isModalOpen}
        onOk={handleSubmit}
        onCancel={() => setIsModalOpen(false)}
        okText={editingUser ? 'Simpan' : 'Tambah'}
        cancelText="Batal"
      >
        <Form form={form} layout="vertical" className="mt-4">
          <Form.Item
            name="name"
            label="Nama User"
            rules={[{ required: true, message: 'Nama user wajib diisi' }]}
          >
            <Input placeholder="Mis. Budi Santoso" />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Email wajib diisi' },
              { type: 'email', message: 'Format email tidak valid' },
            ]}
          >
            <Input placeholder="budi@company.co" />
          </Form.Item>
          <Form.Item
            name="role"
            label="Role User"
            rules={[{ required: true, message: 'Role wajib dipilih' }]}
          >
            <Select options={roleOptions} placeholder="Pilih role…" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}
