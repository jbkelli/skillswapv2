import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { NotificationProvider } from './context/NotificationContext.jsx'
import { ChatNotificationProvider } from './context/ChatNotificationContext.jsx'
import { BrowserRouter } from 'react-router-dom'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <NotificationProvider>
      <AuthProvider>
        <BrowserRouter>
          <ChatNotificationProvider>
            <App />
          </ChatNotificationProvider>
        </BrowserRouter>
      </AuthProvider>
    </NotificationProvider>
  </StrictMode>,
)
