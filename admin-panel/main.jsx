import React from 'react'
import { createRoot } from 'react-dom/client'
import AdminPanel from '../src/components/admin/AdminPanel'
import '../src/styles/global.css'

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AdminPanel />
  </React.StrictMode>,
)
