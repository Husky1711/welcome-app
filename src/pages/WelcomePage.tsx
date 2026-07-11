import { BottomTabNav } from '../components/layout/BottomTabNav'
import { WelcomeDashboard } from '../components/dashboard/WelcomeDashboard'
import '../styles/welcome-dashboard.css'

export function WelcomePage() {
  return (
    <div className="welcome-page">
      <WelcomeDashboard />
      <BottomTabNav />
    </div>
  )
}
