import { KeyRound, Mail } from 'lucide-react'
import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import AuthLayout, { AuthInput, GoogleButton, OrDivider } from '../components/AuthLayout'
import { loginUser, persistAuth } from '../services/authApi'

const loginFields = [
  {
    id: 'email',
    label: 'Email',
    icon: Mail,
    type: 'email',
  },
  {
    id: 'password',
    label: 'Password',
    icon: KeyRound,
    type: 'password',
    showPasswordIcon: true,
  },
]

function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const updateField = (event) => {
    setForm((values) => ({ ...values, [event.target.name]: event.target.value }))
  }

  const submit = async (event) => {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      const data = await loginUser(form)
      persistAuth(data)
      navigate(location.state?.from?.pathname || '/', { replace: true })
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout title="Sign In">
      <GoogleButton />
      <OrDivider />

      <form onSubmit={submit}>
        {loginFields.map((field) => (
          <AuthInput
            key={field.id}
            {...field}
            name={field.id}
            value={form[field.id]}
            onChange={updateField}
          />
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

        {error && (
          <div className="mb-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="h-14 w-full rounded-md bg-primary text-lg font-bold text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? 'Logging in...' : 'Login'}
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
