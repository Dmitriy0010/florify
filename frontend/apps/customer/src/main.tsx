import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from '@/components/ui/sonner'
import { CookieConsentBanner } from '@/components/CookieConsentBanner'
import { router } from './router'
import { queryClient } from './lib/queryClient'
import './styles/globals.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <Toaster />
      <CookieConsentBanner />
    </QueryClientProvider>
  </React.StrictMode>
)
