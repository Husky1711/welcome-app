import { LoginForm } from '../components/auth/LoginForm'
import { AuthLayout } from '../layouts/AuthLayout'

export function LoginPage() {
  return (
    <AuthLayout title="Welcome App" subtitle="Sign in to continue">
      <LoginForm />
    </AuthLayout>
  )
}
