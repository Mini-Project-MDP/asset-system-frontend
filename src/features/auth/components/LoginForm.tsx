import React, { useState } from 'react'
import { useNavigate } from 'react-router'
import { Alert, Button, Form, Input, Card, Typography, Divider, Space, Tag } from 'antd'
import { UserOutlined, LockOutlined, LoginOutlined, SafetyCertificateOutlined } from '@ant-design/icons'
import { httpClient } from '@/shared/services/httpClient'
import { useAuth } from '@/shared/context/AuthContext'
import type { LoginResponse } from '@/shared/types/auth'

const { Title, Text } = Typography

export const LoginForm: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form] = Form.useForm()

  const handleSubmit = async (values: { username_or_email: string; password: string }) => {
    setLoading(true)
    setErrorMsg(null)
    try {
      const response = await httpClient.post<LoginResponse>('/api/v1/auth/login', values)
      const data = (response.data as any)?.data || response.data
      const { access_token, user } = data || {}
      if (!access_token) {
        throw new Error('Invalid authentication response from server')
      }
      login(access_token, user)
      navigate('/')
    } catch (err: any) {
      const msg = err.response?.data?.error || err.message || 'Authentication failed. Please check your credentials.'
      setErrorMsg(msg)
    } finally {
      setLoading(false)
    }
  }

  const fillQuickAccount = (email: string) => {
    form.setFieldsValue({
      username_or_email: email,
      password: 'Password123!',
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900 via-slate-900 to-black p-4">
      <Card
        className="w-full max-w-md shadow-2xl border border-slate-700/50 bg-slate-800/80 backdrop-blur-md rounded-2xl overflow-hidden"
        styles={{ body: { padding: '2.5rem' } }}
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white shadow-lg shadow-blue-500/30 mb-4">
            <SafetyCertificateOutlined className="text-3xl" />
          </div>
          <Title level={2} className="!text-white !mb-1 font-bold tracking-tight">
            Mayora Asset System
          </Title>
          <Text className="text-slate-400 text-sm">
            Sign in to access your asset management workspace
          </Text>
        </div>

        {errorMsg && (
          <Alert
            message={errorMsg}
            type="error"
            showIcon
            closable
            onClose={() => setErrorMsg(null)}
            className="mb-6 rounded-lg bg-red-950/40 border-red-800 text-red-200"
          />
        )}

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{ username_or_email: 'master1@mayora.com', password: 'Password123!' }}
          size="large"
        >
          <Form.Item
            name="username_or_email"
            rules={[{ required: true, message: 'Please enter your email or employee number' }]}
          >
            <Input
              prefix={<UserOutlined className="text-slate-400" />}
              placeholder="Email or Employee No."
              className="bg-slate-900/60 border-slate-700 text-white placeholder-slate-500 rounded-xl hover:border-blue-500 focus:border-blue-500"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Please enter your password' }]}
          >
            <Input.Password
              prefix={<LockOutlined className="text-slate-400" />}
              placeholder="Password"
              className="bg-slate-900/60 border-slate-700 text-white placeholder-slate-500 rounded-xl hover:border-blue-500 focus:border-blue-500"
            />
          </Form.Item>

          <Form.Item className="mt-8 mb-4">
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              icon={<LoginOutlined />}
              block
              className="h-12 text-base font-semibold rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 border-none shadow-lg shadow-blue-500/25"
            >
              Sign In
            </Button>
          </Form.Item>
        </Form>

        <Divider className="border-slate-700/60 text-slate-400 text-xs my-6">
          DEMO QUICK LOGIN ACCOUNTS
        </Divider>

        <div className="space-y-2 text-center">
          <Space wrap size={[4, 8]} style={{ justifyContent: 'center' }}>
            <Tag
              color="gold"
              className="cursor-pointer px-3 py-1 rounded-full border-gold-500/30 hover:opacity-80 transition-opacity"
              onClick={() => fillQuickAccount('master1@mayora.com')}
            >
              👑 Master Admin
            </Tag>
            <Tag
              color="blue"
              className="cursor-pointer px-3 py-1 rounded-full border-blue-500/30 hover:opacity-80 transition-opacity"
              onClick={() => fillQuickAccount('manager1@mayora.com')}
            >
              💼 Asset Manager
            </Tag>
            <Tag
              color="purple"
              className="cursor-pointer px-3 py-1 rounded-full border-purple-500/30 hover:opacity-80 transition-opacity"
              onClick={() => fillQuickAccount('approver1@mayora.com')}
            >
              ✅ Approver
            </Tag>
            <Tag
              color="green"
              className="cursor-pointer px-3 py-1 rounded-full border-green-500/30 hover:opacity-80 transition-opacity"
              onClick={() => fillQuickAccount('user1@mayora.com')}
            >
              👤 Regular User
            </Tag>
          </Space>
        </div>
      </Card>
    </div>
  )
}
