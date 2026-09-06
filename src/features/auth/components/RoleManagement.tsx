import React, { useEffect, useState } from 'react'
import {
  Table,
  Button,
  Tag,
  Modal,
  Form,
  Input,
  Select,
  Switch,
  Tabs,
  Card,
  message,
  Space,
  Tooltip,
  Typography,
} from 'antd'
import {
  CrownOutlined,
  UserOutlined,
  SafetyCertificateOutlined,
  PlusOutlined,
  EditOutlined,
  KeyOutlined,
} from '@ant-design/icons'
import { httpClient } from '@/shared/services/httpClient'
import type { UserProfile, Role, Permission } from '@/shared/types/auth'
import { useAuth } from '@/shared/context/AuthContext'

const { Title, Text } = Typography

export const RoleManagement: React.FC = () => {
  const { user: currentUser, refetchUser } = useAuth()
  const [users, setUsers] = useState<UserProfile[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [loading, setLoading] = useState<boolean>(false)

  // Modals
  const [createRoleOpen, setCreateRoleOpen] = useState(false)
  const [assignRoleUser, setAssignRoleUser] = useState<UserProfile | null>(null)
  const [assignPermRole, setAssignPermRole] = useState<Role | null>(null)
  const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>([])
  const [selectedPermIds, setSelectedPermIds] = useState<string[]>([])

  const [roleForm] = Form.useForm()

  const fetchData = async () => {
    setLoading(true)
    try {
      const [usersRes, rolesRes, permsRes] = await Promise.all([
        httpClient.get<UserProfile[]>('/api/v1/users'),
        httpClient.get<Role[]>('/api/v1/roles'),
        httpClient.get<Permission[]>('/api/v1/permissions'),
      ])
      setUsers(usersRes.data || [])
      setRoles(rolesRes.data || [])
      setPermissions(permsRes.data || [])
    } catch (err: any) {
      console.error('Failed to load RBAC data:', err)
      message.error(err.response?.data?.error || 'Failed to fetch RBAC data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // Toggle Master User
  const handleToggleMasterUser = async (user: UserProfile, isMaster: boolean) => {
    try {
      await httpClient.post(`/api/v1/users/${user.id}/master`, { is_master: isMaster })
      message.success(`Master status updated for ${user.name}`)
      fetchData()
      if (user.id === currentUser?.id) {
        refetchUser()
      }
    } catch (err: any) {
      message.error(err.response?.data?.error || 'Failed to update master user status')
    }
  }

  // Assign Roles to User
  const handleSaveUserRoles = async () => {
    if (!assignRoleUser) return
    try {
      await httpClient.post(`/api/v1/users/${assignRoleUser.id}/roles`, {
        role_ids: selectedRoleIds,
      })
      message.success(`Roles assigned to ${assignRoleUser.name}`)
      setAssignRoleUser(null)
      fetchData()
    } catch (err: any) {
      message.error(err.response?.data?.error || 'Failed to assign roles')
    }
  }

  // Create Role
  const handleCreateRole = async (values: any) => {
    try {
      await httpClient.post('/api/v1/roles', values)
      message.success('New role created successfully')
      setCreateRoleOpen(false)
      roleForm.resetFields()
      fetchData()
    } catch (err: any) {
      message.error(err.response?.data?.error || 'Failed to create role')
    }
  }

  // Assign Permissions to Role
  const handleSaveRolePermissions = async () => {
    if (!assignPermRole) return
    try {
      await httpClient.post(`/api/v1/roles/${assignPermRole.id}/permissions`, {
        permission_ids: selectedPermIds,
      })
      message.success(`Permissions updated for role ${assignPermRole.name}`)
      setAssignPermRole(null)
      fetchData()
    } catch (err: any) {
      message.error(err.response?.data?.error || 'Failed to update role permissions')
    }
  }

  const userColumns = [
    {
      title: 'User',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: UserProfile) => (
        <div>
          <div className="font-semibold text-slate-800 flex items-center gap-2">
            {text}
            {record.is_master && (
              <Tag color="gold" icon={<CrownOutlined />}>
                MASTER USER
              </Tag>
            )}
          </div>
          <div className="text-xs text-slate-500">{record.email}</div>
        </div>
      ),
    },
    {
      title: 'Employee No',
      dataIndex: 'employee_no',
      key: 'employee_no',
      render: (val: string) => <span className="font-mono text-xs">{val}</span>,
    },
    {
      title: 'Assigned Roles',
      dataIndex: 'roles',
      key: 'roles',
      render: (userRoles: Role[]) => (
        <Space wrap size={[0, 4]}>
          {userRoles && userRoles.length > 0 ? (
            userRoles.map((r) => (
              <Tag key={r.id} color="blue">
                {r.name}
              </Tag>
            ))
          ) : (
            <Tag color="default">No Role Assigned</Tag>
          )}
        </Space>
      ),
    },
    {
      title: 'Master User',
      key: 'is_master',
      render: (_: any, record: UserProfile) => (
        <Tooltip title={record.is_master ? 'Revoke Master privileges' : 'Grant Master privileges'}>
          <Switch
            checked={record.is_master}
            onChange={(checked) => handleToggleMasterUser(record, checked)}
            checkedChildren={<CrownOutlined />}
            unCheckedChildren={<UserOutlined />}
          />
        </Tooltip>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: UserProfile) => (
        <Button
          size="small"
          icon={<EditOutlined />}
          onClick={() => {
            setAssignRoleUser(record)
            setSelectedRoleIds(record.roles?.map((r) => r.id) || [])
          }}
        >
          Assign Roles
        </Button>
      ),
    },
  ]

  const roleColumns = [
    {
      title: 'Role Code',
      dataIndex: 'code',
      key: 'code',
      render: (code: string) => <span className="font-mono font-semibold text-blue-700">{code}</span>,
    },
    {
      title: 'Role Name',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: Role) => (
        <div>
          <div className="font-semibold text-slate-800">{name}</div>
          <div className="text-xs text-slate-500">Type: {record.role_type} | Rank: {record.approval_rank}</div>
        </div>
      ),
    },
    {
      title: 'Permissions',
      key: 'permissions',
      render: (_: any, record: Role) => (
        <Space wrap size={[0, 4]}>
          {record.permissions && record.permissions.length > 0 ? (
            record.permissions.map((p) => (
              <Tag key={p.id} color="purple">
                {p.code}
              </Tag>
            ))
          ) : (
            <Tag color="default">No Permissions</Tag>
          )}
        </Space>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Role) => (
        <Button
          size="small"
          icon={<KeyOutlined />}
          onClick={() => {
            setAssignPermRole(record)
            setSelectedPermIds(record.permissions?.map((p) => p.id) || [])
          }}
        >
          Edit Permissions
        </Button>
      ),
    },
  ]

  return (
    <Card className="shadow-sm border-slate-200 rounded-xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <Title level={4} className="!mb-1">
            <SafetyCertificateOutlined className="text-blue-600 mr-2" />
            Role & Permission Management (RBAC)
          </Title>
          <Text type="secondary">
            Manage user accounts, assign roles, configure permissions, and designate Master Users.
          </Text>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setCreateRoleOpen(true)}
          className="bg-blue-600"
        >
          Add New Role
        </Button>
      </div>

      <Tabs
        defaultActiveKey="users"
        items={[
          {
            key: 'users',
            label: `Users & Master Status (${users.length})`,
            children: (
              <Table
                columns={userColumns}
                dataSource={users}
                rowKey="id"
                loading={loading}
                pagination={{ pageSize: 10 }}
              />
            ),
          },
          {
            key: 'roles',
            label: `Roles & Permission Matrix (${roles.length})`,
            children: (
              <Table
                columns={roleColumns}
                dataSource={roles}
                rowKey="id"
                loading={loading}
                pagination={{ pageSize: 10 }}
              />
            ),
          },
          {
            key: 'permissions',
            label: `Permissions Reference (${permissions.length})`,
            children: (
              <Table
                columns={[
                  { title: 'Code', dataIndex: 'code', key: 'code', render: (c) => <span className="font-mono text-xs font-semibold">{c}</span> },
                  { title: 'Name', dataIndex: 'name', key: 'name', render: (n) => <span className="font-medium">{n}</span> },
                  { title: 'Description', dataIndex: 'description', key: 'description', render: (d) => <span className="text-slate-600 text-xs">{d}</span> },
                ]}
                dataSource={permissions}
                rowKey="id"
                loading={loading}
                pagination={{ pageSize: 15 }}
              />
            ),
          },
        ]}
      />

      {/* Modal: Create Role */}
      <Modal
        title="Create New System Role"
        open={createRoleOpen}
        onCancel={() => setCreateRoleOpen(false)}
        onOk={() => roleForm.submit()}
      >
        <Form form={roleForm} layout="vertical" onFinish={handleCreateRole}>
          <Form.Item name="code" label="Role Code (e.g. AUDITOR)" rules={[{ required: true }]}>
            <Input placeholder="AUDITOR" />
          </Form.Item>
          <Form.Item name="name" label="Role Name" rules={[{ required: true }]}>
            <Input placeholder="Internal Auditor" />
          </Form.Item>
          <Form.Item name="role_type" label="Role Type" initialValue="OPERATIONAL">
            <Select
              options={[
                { value: 'SYSTEM', label: 'SYSTEM' },
                { value: 'OPERATIONAL', label: 'OPERATIONAL' },
                { value: 'APPROVAL', label: 'APPROVAL' },
                { value: 'GENERAL', label: 'GENERAL' },
              ]}
            />
          </Form.Item>
          <Form.Item name="approval_rank" label="Approval Rank" initialValue={10}>
            <Input type="number" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal: Assign Roles to User */}
      <Modal
        title={`Assign Roles to ${assignRoleUser?.name}`}
        open={!!assignRoleUser}
        onCancel={() => setAssignRoleUser(null)}
        onOk={handleSaveUserRoles}
      >
        <div className="mb-4 text-xs text-slate-500">
          Select one or more roles to assign to this user account:
        </div>
        <Select
          mode="multiple"
          className="w-full"
          placeholder="Select roles"
          value={selectedRoleIds}
          onChange={setSelectedRoleIds}
          options={roles.map((r) => ({ value: r.id, label: `${r.name} (${r.code})` }))}
        />
      </Modal>

      {/* Modal: Assign Permissions to Role */}
      <Modal
        title={`Edit Permissions for ${assignPermRole?.name}`}
        open={!!assignPermRole}
        onCancel={() => setAssignPermRole(null)}
        onOk={handleSaveRolePermissions}
        width={600}
      >
        <div className="mb-4 text-xs text-slate-500">
          Select permissions to grant to role <b className="font-mono">{assignPermRole?.code}</b>:
        </div>
        <Select
          mode="multiple"
          className="w-full"
          placeholder="Select permissions"
          value={selectedPermIds}
          onChange={setSelectedPermIds}
          options={permissions.map((p) => ({
            value: p.id,
            label: `${p.name} [${p.code}] - ${p.description}`,
          }))}
        />
      </Modal>
    </Card>
  )
}
