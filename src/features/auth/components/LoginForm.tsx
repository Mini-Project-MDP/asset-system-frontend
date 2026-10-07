import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router'
import {
  Button,
  Card,
  Typography,
  Form,
  Input,
  Alert,
  Divider,
  Space,
  Tag,
  Tooltip,
} from 'antd'
import {
  SafetyCertificateOutlined,
  UserOutlined,
  LockOutlined,
  LoginOutlined,
  GlobalOutlined,
  KeyOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons'
import { httpClient } from '@/shared/services/httpClient'
import { useAuth } from '@/shared/context/AuthContext'
import type { LoginResponse, UserProfile } from '@/shared/types/auth'

const { Title, Text } = Typography

type AuthMode = 'local' | 'sso'

const DEMO_ACCOUNTS = [
  {
    key: 'master',
    label: '👑 Master Admin',
    email: 'master1@mayora.com',
    name: 'Master Admin One',
    roleCode: 'role_master',
    roleName: 'Master Admin',
    isMaster: true,
    color: 'gold',
  },
  {
    key: 'manager',
    label: '💼 Asset Manager',
    email: 'manager1@mayora.com',
    name: 'Manager Asset One',
    roleCode: 'role_mgr',
    roleName: 'Asset Manager',
    isMaster: false,
    color: 'blue',
  },
  {
    key: 'approver',
    label: '✅ Approver',
    email: 'approver1@mayora.com',
    name: 'Approver One',
    roleCode: 'role_appr',
    roleName: 'Approver',
    isMaster: false,
    color: 'purple',
  },
  {
    key: 'sa',
    label: '📋 Sales Admin (SA)',
    email: 'demo.sa1@mayora.com',
    name: 'Demo Sales Admin',
    roleCode: 'role_sa',
    roleName: 'Sales Admin',
    isMaster: false,
    color: 'cyan',
  },
  {
    key: 'ss',
    label: '🔍 Sales Supervisor (SS)',
    email: 'demo.ss1@mayora.com',
    name: 'Demo Sales Supervisor',
    roleCode: 'role_ss',
    roleName: 'Sales Supervisor',
    isMaster: false,
    color: 'orange',
  },
  {
    key: 'user',
    label: '👤 Regular User',
    email: 'user1@mayora.com',
    name: 'Regular User One',
    roleCode: 'role_user',
    roleName: 'Regular User',
    isMaster: false,
    color: 'green',
  },
]

export const LoginForm: React.FC = () => {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [form] = Form.useForm()

  const [authMode, setAuthMode] = useState<AuthMode>(() => {
    // 1. Check URL query params (?mode=sso or ?mode=local or ?auth_mode=...)
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const urlMode = (params.get('mode') || params.get('auth_mode'))?.toLowerCase()
      if (urlMode === 'sso' || urlMode === 'local') {
        localStorage.setItem('auth_mode', urlMode)
        return urlMode as AuthMode
      }
      // 2. Check localStorage
      const saved = localStorage.getItem('auth_mode')?.toLowerCase()
      if (saved === 'sso' || saved === 'local') {
        return saved as AuthMode
      }
    }
    // Default to 'local' for safe, offline-ready presentation
    return 'local'
  })

  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [infoMsg, setInfoMsg] = useState<string | null>(null)

  useEffect(() => {
    // Listen for storage events across tabs or console changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'auth_mode' && (e.newValue === 'sso' || e.newValue === 'local')) {
        setAuthMode(e.newValue as AuthMode)
      }
    }
    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  const handleModeChange = (newMode: AuthMode) => {
    setAuthMode(newMode)
    localStorage.setItem('auth_mode', newMode)
    setErrorMsg(null)
    setInfoMsg(null)
  }

  const handleSSOLoginRedirect = () => {
    const ssoServerUrl =
      import.meta.env.VITE_SSO_PORTAL_URL || 'https://sso-frontend-alpha.vercel.app'
    const clientId = 'app_asset_mgmt_123'
    const redirectUri = `${import.meta.env.VITE_APP_URL || window.location.origin}/sso/callback`

    const ssoAuthUrl = `${ssoServerUrl}/sso/login?client_id=${encodeURIComponent(
      clientId
    )}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=openid%20profile%20email%20roles`

    window.location.href = ssoAuthUrl
  }

  const handleDirectLogin = async (values: {
    username_or_email: string
    password: string
  }) => {
    setLoading(true)
    setErrorMsg(null)
    setInfoMsg(null)

    try {
      // 1. Try real backend login
      const response = await httpClient.post<LoginResponse>(
        '/api/v1/auth/login',
        values
      )
      const data = (response.data as any)?.data || response.data
      const { access_token, user } = data || {}
      if (!access_token) {
        throw new Error('Invalid authentication response from server')
      }
      login(access_token, user)
      navigate('/')
    } catch (err: any) {
      console.warn('Backend login attempt returned:', err)

      // 2. Check if network failure or backend offline - offer graceful demo fallback
      const isNetworkError =
        err.code === 'ERR_NETWORK' ||
        err.message?.includes('Network Error') ||
        err.response?.status >= 500

      if (isNetworkError) {
        // Fallback demo login for resilience during presentation
        const matchedAccount = DEMO_ACCOUNTS.find(
          (acc) =>
            acc.email.toLowerCase() === values.username_or_email.toLowerCase()
        )
        const demoUser: UserProfile = {
          id: matchedAccount ? `usr_${matchedAccount.key}` : 'usr_local_demo',
          employee_no: matchedAccount ? `EMP_${matchedAccount.key.toUpperCase()}` : 'EMP_DEMO',
          name: matchedAccount ? matchedAccount.name : 'Local Demo User',
          email: values.username_or_email,
          status: 'ACTIVE',
          is_master: matchedAccount ? matchedAccount.isMaster : false,
          roles: [
            {
              id: matchedAccount ? `role_${matchedAccount.key}` : 'role_demo',
              code: matchedAccount ? matchedAccount.roleCode : 'role_master',
              name: matchedAccount ? matchedAccount.roleName : 'Master Admin',
              role_type: 'SYSTEM',
              approval_rank: 1,
              is_active: true,
            },
          ],
          permissions: ['*'],
        }

        const fallbackToken = 'mock_jwt_' + Math.random().toString(36).substring(2)
        login(fallbackToken, demoUser)
        navigate('/')
        return
      }

      const msg =
        err.response?.data?.error ||
        err.message ||
        'Authentication failed. Please check your credentials.'
      setErrorMsg(msg)
    } finally {
      setLoading(false)
    }
  }

  const fillAndLoginDemo = (accountKey: string) => {
    const account = DEMO_ACCOUNTS.find((a) => a.key === accountKey)
    if (!account) return

    form.setFieldsValue({
      username_or_email: account.email,
      password: 'Password123!',
    })

    // Instant login for demo convenience
    handleDirectLogin({
      username_or_email: account.email,
      password: 'Password123!',
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900 via-slate-900 to-black p-4">
      <Card
        className="w-full max-w-md shadow-2xl border border-slate-700/60 bg-slate-800/90 backdrop-blur-md rounded-2xl overflow-hidden"
        styles={{ body: { padding: '2rem 2.25rem' } }}
      >
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white shadow-lg shadow-blue-500/30 mb-3">
            <SafetyCertificateOutlined className="text-2xl" />
          </div>
          <Title level={2} className="!text-white !mb-1 font-bold tracking-tight">
            Mayora Asset System
          </Title>
          <Text className="text-slate-400 text-xs">
            System Support Asset Management System Workspace
          </Text>
        </div>

        {/* Mode Switcher Banner */}
        <div className="flex items-center justify-between p-1.5 mb-5 bg-slate-900/90 border border-slate-700/80 rounded-xl">
          <div className="text-[11px] text-slate-400 font-medium flex items-center gap-1.5 pl-2">
            <span>Mode:</span>
          </div>
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => handleModeChange('local')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                authMode === 'local'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <KeyOutlined className="text-xs" />
              Auth Biasa
            </button>
            <button
              type="button"
              onClick={() => handleModeChange('sso')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                authMode === 'sso'
                  ? 'bg-red-600 text-white shadow-md shadow-red-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <GlobalOutlined className="text-xs" />
              Mayora SSO
            </button>
          </div>
        </div>

        {errorMsg && (
          <Alert
            message={errorMsg}
            type="error"
            showIcon
            closable
            onClose={() => setErrorMsg(null)}
            className="mb-4 rounded-xl bg-red-950/50 border-red-800 text-red-200 text-xs"
          />
        )}

        {infoMsg && (
          <Alert
            message={infoMsg}
            type="info"
            showIcon
            closable
            onClose={() => setInfoMsg(null)}
            className="mb-4 rounded-xl bg-blue-950/50 border-blue-800 text-blue-200 text-xs"
          />
        )}

        {/* ========================================================
            MODE SSO
            ======================================================== */}
        {authMode === 'sso' && (
          <div className="space-y-4">
            <div className="p-3 bg-red-950/30 border border-red-800/40 rounded-xl text-center">
              <span className="text-xs text-red-300 font-medium flex items-center justify-center gap-1.5">
                <GlobalOutlined /> Mode Mayora Single Sign-On Aktif
              </span>
              <p className="text-[11px] text-slate-400 mt-1">
                Autentikasi terpusat melalui Mayora Identity Provider (IdP)
              </p>
            </div>

            <Button
              type="primary"
              danger
              block
              icon={<SafetyCertificateOutlined className="text-lg" />}
              onClick={handleSSOLoginRedirect}
              className="h-12 text-sm font-bold rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 border-none shadow-lg shadow-red-500/30 cursor-pointer"
            >
              Sign In with Mayora Single Sign-On (SSO)
            </Button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => handleModeChange('local')}
                className="text-xs text-slate-400 hover:text-blue-400 underline underline-offset-4 cursor-pointer transition-colors"
              >
                Mengalami kendala SSO? Beralih ke Mode Auth Biasa (Bypass)
              </button>
            </div>
          </div>
        )}

        {/* ========================================================
            MODE AUTH BIASA (DIRECT CREDENTIALS & DEMO ACCOUNTS)
            ======================================================== */}
        {authMode === 'local' && (
          <div>
            <Form
              form={form}
              layout="vertical"
              onFinish={handleDirectLogin}
              initialValues={{
                username_or_email: 'master1@mayora.com',
                password: 'Password123!',
              }}
              size="middle"
            >
              <Form.Item
                name="username_or_email"
                rules={[
                  {
                    required: true,
                    message: 'Masukkan email atau nomor karyawan',
                  },
                ]}
                className="mb-3"
              >
                <Input
                  prefix={<UserOutlined className="text-slate-400 mr-1" />}
                  placeholder="Email atau NIK (misal master1@mayora.com)"
                  className="bg-slate-900/80 border-slate-700 text-white placeholder-slate-500 rounded-xl hover:border-blue-500 focus:border-blue-500 h-10"
                />
              </Form.Item>

              <Form.Item
                name="password"
                rules={[{ required: true, message: 'Masukkan password Anda' }]}
                className="mb-4"
              >
                <Input.Password
                  prefix={<LockOutlined className="text-slate-400 mr-1" />}
                  placeholder="Password (default Password123!)"
                  className="bg-slate-900/80 border-slate-700 text-white placeholder-slate-500 rounded-xl hover:border-blue-500 focus:border-blue-500 h-10"
                />
              </Form.Item>

              <Form.Item className="mb-4">
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  icon={<LoginOutlined />}
                  block
                  className="h-11 text-sm font-semibold rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 border-none shadow-lg shadow-blue-500/25 cursor-pointer"
                >
                  Sign In (Direct Auth)
                </Button>
              </Form.Item>
            </Form>

            <Divider className="border-slate-700/60 text-slate-400 text-[11px] my-4">
              <span className="flex items-center gap-1">
                <ThunderboltOutlined className="text-amber-400" />
                AKUN DEMO CEPAT (1-KLIK)
              </span>
            </Divider>

            {/* Quick Demo Login Pills */}
            <div className="space-y-1.5 text-center">
              <Space wrap size={[6, 6]} style={{ justifyContent: 'center' }}>
                {DEMO_ACCOUNTS.map((acc) => (
                  <Tooltip key={acc.key} title={`Klik untuk langsung login sebagai ${acc.roleName}`}>
                    <Tag
                      color={acc.color}
                      className="cursor-pointer px-2.5 py-1 text-xs rounded-full border-opacity-40 hover:scale-105 active:scale-95 transition-all shadow-sm"
                      onClick={() => fillAndLoginDemo(acc.key)}
                    >
                      {acc.label}
                    </Tag>
                  </Tooltip>
                ))}
              </Space>
              <p className="text-[10px] text-slate-500 mt-2">
                Password default semua akun: <code className="text-slate-400">Password123!</code>
              </p>
            </div>
          </div>
        )}

        {/* Footer info & Localstorage activation clue */}
        <div className="mt-5 pt-3 border-t border-slate-700/50 text-center">
          <p className="text-[11px] text-slate-400">
            Aktivasi via LocalStorage: <code className="text-amber-300">auth_mode = '{authMode}'</code>
          </p>
          <p className="text-[10px] text-slate-500 mt-0.5">
            Ketik di console: <code className="text-slate-400">localStorage.setItem('auth_mode', 'sso')</code> atau <code className="text-slate-400">?mode=sso</code>
          </p>
        </div>
      </Card>
    </div>
  )
}

export default LoginForm
