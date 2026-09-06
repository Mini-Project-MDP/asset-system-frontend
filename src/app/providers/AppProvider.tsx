import type { ReactNode } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { ConfigProvider } from 'antd'
import { queryClient } from '../../shared/lib/queryClient'

type AppProviderProps = {
  children: ReactNode
}

export function AppProvider({ children }: AppProviderProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: '#be123c',
            colorPrimaryHover: '#9f1239',
            colorPrimaryActive: '#881337',
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
        {children}
      </ConfigProvider>
    </QueryClientProvider>
  )
}