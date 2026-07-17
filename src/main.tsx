import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { initializeNativeShell } from './capacitor.ts'
import { ensureHabitTargetMigration } from './utils/habitStorage.ts'
import './styles/global.css'

ensureHabitTargetMigration()
void initializeNativeShell()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
