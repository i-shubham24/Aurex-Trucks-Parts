import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { queryClient } from './lib/queryClient'
import { prefetchShopCatalogue } from './hooks/api/useProducts'
import './index.css'
import App from './App.jsx'

// Prevent browsers from restoring previous scroll positions on navigation
if (typeof window !== 'undefined' && 'scrollRestoration' in window.history) {
  window.history.scrollRestoration = 'manual';
}

// Fetch the shop catalogue now, alongside the route chunks, instead of after the page mounts.
// The staff console has its own product list, so it skips this.
if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/admin')) {
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(() => prefetchShopCatalogue(queryClient), { timeout: 3000 });
  } else {
    setTimeout(() => prefetchShopCatalogue(queryClient), 1200);
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </StrictMode>,
)
