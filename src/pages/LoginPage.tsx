import { LoginForm } from '../components/auth/LoginForm'
import { AuthLayout } from '../layouts/AuthLayout'

export function LoginPage() {
  return (
    <AuthLayout title="Welcome App" subtitle="Sign in to your personal space">
      <LoginForm />
    </AuthLayout>
  )
}
