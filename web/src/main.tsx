import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import './index.css'
import App from './App.tsx'
import { getSetting } from './storage/settingsRepository'
import type { Theme } from './storage/types'

registerSW({ immediate: true })

// Read the theme before the first render so the page doesn't flash the wrong one.
getSetting('theme')
  .catch(() => undefined) // IndexedDB unavailable
  .then((stored) => {
    const theme: Theme = stored ?? 'auto'
    document.documentElement.setAttribute('data-theme', theme)
    createRoot(document.getElementById('root')!).render(
      <StrictMode>
        <App initialTheme={theme} />
      </StrictMode>,
    )
  })
