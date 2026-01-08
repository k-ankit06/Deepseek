import React from 'react'
import ReactDOM from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import { Toaster } from 'react-hot-toast'
import App from './App'
import './styles/globals.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HelmetProvider>
      <App />
      <Toaster
        position="top-right"
        containerStyle={{
          top: 20,
          right: 20,
        }}
        toastOptions={{
          // Shorter duration to prevent stacking
          duration: 2000,
          // Limit to only 1 visible toast
          style: {
            background: '#1f2937',
            color: '#fff',
            borderRadius: '10px',
            padding: '16px',
            maxWidth: '400px',
          },
          success: {
            duration: 2000,
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            duration: 3000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
          loading: {
            duration: Infinity,
          },
        }}
        // Only show 1 toast at a time
        gutter={8}
      />
    </HelmetProvider>
  </React.StrictMode>
)