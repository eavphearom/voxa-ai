import { KeyRound, Mail } from 'lucide-react'
import { Link } from 'react-router-dom'
import AuthLayout, { AuthInput, GoogleButton, OrDivider } from '../components/AuthLayout'

const loginFields = [
  {
    id: 'email',
    label: 'Email',
    defaultValue: 'example@gmail.com',
    icon: Mail,
    type: 'email',
  },
  {
    id: 'password',
    label: 'Password',
    defaultValue: '***********',
    icon: KeyRound,
    type: 'password',
    showPasswordIcon: true,
  },
]

function Login() {
  return (
    <AuthLayout title="Sign In">
      <GoogleButton />
      <OrDivider />

      <form>
        {loginFields.map((field) => (
          <AuthInput key={field.id} {...field} />
        ))}

        <div className="mb-5 mt-3 flex flex-wrap items-center justify-between gap-3 text-xs">
          <label className="flex items-center gap-2 text-text-secondary">
            <input type="checkbox" className="h-4 w-4 rounded border-border-soft accent-primary" />
            Remember me
          </label>
          <a href="#" className="font-medium text-primary hover:text-emerald-700">
            Forgot Password?
          </a>
        </div>

        <button
          type="button"
          className="h-14 w-full rounded-md bg-primary text-lg font-bold text-white transition hover:bg-emerald-600"
        >
          Login
        </button>
      </form>

      <p className="mt-14 text-center text-xs font-medium text-text-primary sm:mt-20">
        Don&apos;t have an account?{' '}
        <Link to="/register" className="font-semibold text-primary hover:text-emerald-700">
          Register
        </Link>
      </p>
    </AuthLayout>
  )
}

export default Login
