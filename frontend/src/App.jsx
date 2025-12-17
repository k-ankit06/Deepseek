import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import { OfflineProvider } from './context/OfflineContext'
import routes from './routes'
import './styles/globals.css'

function App() {
  return (
    <Router>
      <AuthProvider>
        <ThemeProvider>
          <OfflineProvider>
            <Routes>
              {routes.map((route, index) => (
                <Route
                  key={index}
                  path={route.path}
                  element={<route.component />}
                />
              ))}
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </OfflineProvider>
        </ThemeProvider>
      </AuthProvider>
    </Router>
  )
}

export default App