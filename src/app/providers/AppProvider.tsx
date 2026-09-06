import type { ReactNode } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { ConfigProvider } from 'antd'
import { queryClient } from '../../shared/lib/queryClient'
import { AuthProvider } from '../../shared/context/AuthContext'

type AppProviderProps = {
  children: ReactNode
}

export function AppProvider({ children }: AppProviderProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: '#1d4ed8',
            colorPrimaryHover: '#1e40af',
            colorPrimaryActive: '#1e3a8a',
            borderRadius: 10,
            fontFamily: "'IBM Plex Sans', system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
          },
          components: {
            Button: {
              fontWeight: 600,
              borderRadius: 10,
            },
            Modal: {
              borderRadiusLG: 18,
            },
          },
        }}
      >
        <AuthProvider>{children}</AuthProvider>
      </ConfigProvider>
    </QueryClientProvider>
  )
}