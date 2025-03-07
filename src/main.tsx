
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { AuthProvider } from './lib/AuthContext'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// Create a client for React Query
const queryClient = new QueryClient()

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <>
        <App />
        <Toaster />
        <Sonner position="top-right" />
      </>
    </AuthProvider>
  </QueryClientProvider>
);
