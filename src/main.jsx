import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import WhatsAppSaaS from '../whatsapp-saas-dashboard.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <WhatsAppSaaS />
  </StrictMode>,
)
