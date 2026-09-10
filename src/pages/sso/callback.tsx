import React, { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import axios from 'axios'
import { Spin, Card, Alert } from 'antd'
import { SafetyCertificateOutlined, CheckCircleOutlined } from '@ant-design/icons'
import { useAuth } from '@/shared/context/AuthContext'
import type { UserProfile } from '@/shared/types/auth'

export const SSOCallbackPage: React.FC = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { login } = useAuth()
  const hasExecutedRef = useRef(false)

  const [loading, setLoading] = useState(true)
  const [statusMsg, setStatusMsg] = useState('Exchanging authorization code with Mayora SSO Identity Provider...')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const code = searchParams.get('code')

  useEffect(() => {
    if (!code) {
      setErrorMsg('No authorization code provided in callback parameters.')
      setLoading(false)
      return
    }

    if (hasExecutedRef.current) return
    hasExecutedRef.current = true

    const processSSOCallback = async () => {
      try {
        const ssoBackendUrl = import.meta.env.VITE_SSO_API_URL || 'http://localhost:8082'

        // 1. Exchange authorization code for JWT token
        setStatusMsg('Exchanging authorization code with Mayora SSO...')
        const redirectUri = `${import.meta.env.VITE_APP_URL || window.location.origin}/sso/callback`
        const tokenRes = await axios.post(`${ssoBackendUrl}/api/v1/sso/token`, {
          grant_type: 'authorization_code',
          code: code,
          redirect_uri: redirectUri,
          client_id: 'app_asset_mgmt_123',
          client_secret: 'secret_asset_mgmt_999',
        })

        const tokenData = tokenRes.data?.data || tokenRes.data
        const accessToken = tokenData?.access_token
        if (!accessToken) {
          throw new Error('Failed to retrieve access token from SSO Provider')
        }

        // 2. Fetch User Profile & Mapped App Roles from SSO
        setStatusMsg('Fetching identity & application permissions...')
        let userInfo: any = {}
        try {
          const userInfoRes = await axios.get(`${ssoBackendUrl}/api/v1/sso/userinfo`, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          })
          userInfo = userInfoRes.data?.data || userInfoRes.data
        } catch (uErr) {
          console.warn('Could not fetch userinfo, proceeding with defaults:', uErr)
        }

        const userProfile: UserProfile = {
          id: userInfo.sub || 'usr_sso',
          employee_no: userInfo.employee_no || 'EMP_SSO',
          name: userInfo.name || 'SSO User',
          email: userInfo.email || 'user@mayora.com',
          status: 'ACTIVE',
          is_master: userInfo.is_master || false,
          roles: userInfo.app_mapping?.app_role
            ? [
                {
                  id: 'role_mapped',
                  code: userInfo.app_mapping.app_role,
                  name: userInfo.app_mapping.app_role,
                  role_type: 'OPERATIONAL',
                  approval_rank: 10,
                  is_active: true,
                },
              ]
            : [],
          permissions: userInfo.app_mapping?.permissions || ['*'],
        }

        // 3. Login user into Asset System
        setStatusMsg('Authenticated successfully! Redirecting to Asset System...')
        login(accessToken, userProfile)

        setTimeout(() => {
          navigate('/')
        }, 800)
      } catch (err: any) {
        console.error('SSO Callback Error:', err)
        setErrorMsg(
          err.response?.data?.error || err.message || 'Single Sign-On authentication failed.'
        )
      } finally {
        setLoading(false)
      }
    }

    processSSOCallback()
  }, [code, login, navigate])

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4 gap-4">
      <Card className="w-full max-w-md bg-slate-800 border-slate-700 text-white rounded-2xl p-6 text-center shadow-2xl">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30 mb-4">
          <SafetyCertificateOutlined className="text-3xl" />
        </div>

        <h2 className="text-xl font-bold mb-2">Mayora SSO Authentication</h2>

        {loading ? (
          <div className="py-6 space-y-4">
            <Spin size="large" />
            <p className="text-slate-400 text-xs">{statusMsg}</p>
          </div>
        ) : errorMsg ? (
          <div className="py-4">
            <Alert
              message="SSO Authentication Failed"
              description={errorMsg}
              type="error"
              showIcon
              className="bg-red-950/50 border-red-800 text-red-200 text-xs rounded-xl"
            />
            <button
              onClick={() => navigate('/login')}
              className="mt-6 px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-xl hover:bg-blue-500"
            >
              Return to Login Page
            </button>
          </div>
        ) : (
          <div className="py-4 space-y-2">
            <CheckCircleOutlined className="text-3xl text-emerald-400" />
            <p className="text-emerald-300 font-semibold text-sm">Single Sign-On Successful!</p>
            <p className="text-slate-400 text-xs">Redirecting to Asset System Workspace...</p>
          </div>
        )}
      </Card>
    </div>
  )
}

export default SSOCallbackPage
