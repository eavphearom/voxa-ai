import { KeyRound, Mail, Phone, UserRound } from 'lucide-react'
import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import AuthLayout, { AuthInput } from '../components/AuthLayout'
import { getAuthToken, loginUser, persistAuth, registerUser } from '../services/authApi'

const registerFields = [
  {
    id: 'name',
    label: 'Username',
    icon: UserRound,
  },
  {
    id: 'email',
    label: 'Email',
    icon: Mail,
    type: 'email',
  },
  {
    id: 'phone',
    label: 'Phone Number',
    icon: Phone,
    type: 'tel',
  },
  {
    id: 'password',
    label: 'Password',
    icon: KeyRound,
    type: 'password',
    showPasswordIcon: true,
  },
  {
    id: 'confirmPassword',
    label: 'Confirm Password',
    icon: KeyRound,
    type: 'password',
    showPasswordIcon: true,
  },
]

function Register() {
  const navigate = useNavigate()
  const location = useLocation()
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const updateField = (event) => {
    setForm((values) => ({ ...values, [event.target.name]: event.target.value }))
  }

  const submit = async (event) => {
    event.preventDefault()
    setError('')

    if (form.password !== form.confirmPassword) {
      setError('Password and confirm password do not match.')
      return
    }

    setLoading(true)

    try {
      const data = await registerUser({
        name: form.name,
        email: form.email,
        phone: form.phone,
        password: form.password,
        password_confirmation: form.confirmPassword,
      })
      persistAuth(data)

      if (!getAuthToken()) {
        const loginData = await loginUser({
          email: form.email,
          password: form.password,
        })
        persistAuth(loginData)
      }

      navigate(location.state?.from?.pathname || '/', { replace: true })
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout title="Create account">
      <form onSubmit={submit}>
        {registerFields.map((field) => (
          <AuthInput
            key={field.id}
            {...field}
            name={field.id}
            value={form[field.id]}
            onChange={updateField}
          />
        ))}

        {error && (
          <div className="mt-6 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="mt-10 h-14 w-full rounded-md bg-primary text-lg font-bold text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-70 sm:mt-12"
        >
          {loading ? 'Creating account...' : 'create account'}
        </button>
      </form>

      <p className="mt-7 text-center text-xs font-medium text-text-primary">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-primary hover:text-emerald-700">
          Login
        </Link>
      </p>
    </AuthLayout>
  )
}

export default Register
