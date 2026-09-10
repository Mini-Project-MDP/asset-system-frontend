import React from 'react'
import { Button, Card, Typography } from 'antd'
import { SafetyCertificateOutlined } from '@ant-design/icons'

const { Title, Text } = Typography

export const LoginForm: React.FC = () => {
  const handleSSOLoginRedirect = () => {
    const ssoServerUrl = import.meta.env.VITE_SSO_PORTAL_URL || 'http://localhost:5174'
    const clientId = 'app_asset_mgmt_123'
    const redirectUri = `${import.meta.env.VITE_APP_URL || window.location.origin}/sso/callback`

    const ssoAuthUrl = `${ssoServerUrl}/sso/login?client_id=${encodeURIComponent(
      clientId
    )}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=openid%20profile%20email%20roles`

    window.location.href = ssoAuthUrl
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
          <Title level={2} className="!text-slate-900 !mb-1 font-bold tracking-tight">
            Mayora Asset System
          </Title>
          <Text className="text-slate-500 text-sm">
            Sign in to access your asset management workspace
          </Text>
        </div>

        <Button
          type="primary"
          danger
          block
          icon={<SafetyCertificateOutlined className="text-lg" />}
          onClick={handleSSOLoginRedirect}
          className="h-12 text-base font-bold rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 border-none shadow-lg shadow-red-500/30"
        >
          Sign In with Mayora Single Sign-On (SSO)
        </Button>

        <p className="text-center text-xs text-slate-400 mt-6">
          Mayora Asset Management System · Powered by Mayora SSO
        </p>
      </Card>
    </div>
  )
}
