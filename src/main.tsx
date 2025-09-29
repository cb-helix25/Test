import React from 'react'
import ReactDOM from 'react-dom/client'
import { initializeIcons } from '@fluentui/react'
import CallHub from './pages/callhub/CallHub'

// Initialize FluentUI icons
initializeIcons()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <CallHub />
  </React.StrictMode>,
)