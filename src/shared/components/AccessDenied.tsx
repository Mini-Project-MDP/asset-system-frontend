import { Button } from 'antd'
import { useNavigate } from 'react-router'
import { useAuth } from '@/shared/context/AuthContext'

interface AccessDeniedProps {
  /** Where the user can go instead; absent when they can open no module at all. */
  landingPath?: string
}

export default function AccessDenied({ landingPath }: AccessDeniedProps) {
  const navigate = useNavigate()
  const { logout } = useAuth()

  return (
    <div className="card card-pad" style={{ maxWidth: 520, margin: '48px auto', textAlign: 'center' }}>
      <b style={{ fontSize: 16 }}>{landingPath ? 'Akses ditolak' : 'Belum ada akses'}</b>
      <p style={{ color: 'var(--muted)', fontSize: 13, margin: '8px 0 16px' }}>
        {landingPath
          ? 'Role Anda tidak memiliki akses ke halaman ini.'
          : 'Akun Anda belum memiliki akses ke modul mana pun. Hubungi Admin untuk mengatur role Anda.'}
      </p>
      {landingPath ? (
        <Button type="primary" onClick={() => navigate(landingPath, { replace: true })}>
          Kembali ke halaman utama
        </Button>
      ) : (
        <Button
          onClick={() => {
            logout()
            navigate('/login')
          }}
        >
          Sign Out
        </Button>
      )}
    </div>
  )
}
