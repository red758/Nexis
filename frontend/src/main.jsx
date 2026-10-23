import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { DataContext } from './context/DataContext.jsx'

// Notice we only call createRoot ONE time, and AuthProvider wraps App!
ReactDOM.createRoot(document.getElementById('root')).render(
  <DataContext>
    <App />
  </DataContext>
)