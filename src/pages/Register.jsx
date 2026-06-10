import { KeyRound, Mail, Phone, UserRound } from 'lucide-react'
import { Link } from 'react-router-dom'
import AuthLayout, { AuthInput } from '../components/AuthLayout'

const registerFields = [
  {
    id: 'name',
    label: 'Username',
    defaultValue: 'sok dara',
    icon: UserRound,
  },
  {
    id: 'email',
    label: 'Email',
    defaultValue: 'dara@gmail.com',
    icon: Mail,
    type: 'email',
  },
  {
    id: 'phone',
    label: 'Phone Number',
    defaultValue: '***********',
    icon: Phone,
    type: 'tel',
    showPasswordIcon: true,
  },
  {
    id: 'password',
    label: 'Password',
    defaultValue: '***********',
    icon: KeyRound,
    type: 'password',
    showPasswordIcon: true,
  },
  {
    id: 'confirmPassword',
    label: 'Confirm Password',
    defaultValue: '***********',
    icon: KeyRound,
    type: 'password',
    showPasswordIcon: true,
  },
]

function Register() {
  return (
    <AuthLayout title="Create account">
      <form>
        {registerFields.map((field) => (
          <AuthInput key={field.id} {...field} />
        ))}

        <button
          type="button"
          className="mt-10 h-14 w-full rounded-md bg-primary text-lg font-bold text-white transition hover:bg-emerald-600 sm:mt-12"
        >
          create account
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
