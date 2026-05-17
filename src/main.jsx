import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ImmoProvider } from './context/ImmoContext.jsx'
import Auth from './auth/Auth.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ImmoProvider>
      <Auth>
        <App />
      </Auth>
    </ImmoProvider>
  </StrictMode>,
)