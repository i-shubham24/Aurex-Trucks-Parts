import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from './lib/queryClient'
import { prefetchShopCatalogue } from './hooks/api/useProducts'
import './index.css'
import App from './App.jsx'

// Prevent browsers from restoring previous scroll positions on navigation
if (typeof window !== 'undefined' && 'scrollRestoration' in window.history) {
  window.history.scrollRestoration = 'manual';
}

// Fetch the shop catalogue on idle time instead of competing with critical route execution
if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/admin')) {
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(() => prefetchShopCatalogue(queryClient), { timeout: 4000 });
  } else {
    setTimeout(() => prefetchShopCatalogue(queryClient), 2000);
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>,
)
