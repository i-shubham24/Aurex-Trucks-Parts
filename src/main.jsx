import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import BootLoader from './components/BootLoader.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BootLoader />
    <App />
  </StrictMode>,
)
