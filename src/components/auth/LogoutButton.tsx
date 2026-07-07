import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '../../constants/routes'
import { useAuth } from '../../hooks/useAuth'
import { Button } from '../ui/Button'

export function LogoutButton() {
  const navigate = useNavigate()
  const { logout } = useAuth()
  const [isLoading, setIsLoading] = useState(false)

  async function handleLogout() {
    setIsLoading(true)
    try {
      await logout()
      navigate(ROUTES.LOGIN, { replace: true })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      variant="outline"
      fullWidth
      loading={isLoading}
      onClick={handleLogout}
      aria-label="Log out of your account"
    >
      Log out
    </Button>
  )
}
