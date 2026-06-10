import { Eye } from 'lucide-react'
import heroImg from '../assets/hero.png'
import Logo from './Logo'

function AuthLayout({ title, children }) {
  return (
    <main className="min-h-screen bg-white px-5 py-6 text-text-primary sm:px-8">
      <Logo />

      <section className="mx-auto grid min-h-[calc(100vh-72px)] max-w-6xl items-center gap-8 py-8 lg:grid-cols-[1fr_560px] lg:gap-16">
        <div className="hidden items-center justify-center lg:flex">
          <div className="relative">
            <div className="absolute left-5 top-16 h-28 w-28 rounded-full bg-pink-300 shadow-[inset_0_0_0_8px_rgba(255,255,255,0.25)]" />
            <div className="absolute left-12 top-24 h-16 w-16 rounded-full border-[10px] border-white/60" />
            <img
              src={heroImg}
              alt="VOXA account security illustration"
              className="relative z-10 w-[430px] max-w-full"
            />
          </div>
        </div>

        <div className="mx-auto w-full max-w-xl rounded-lg border border-border-soft bg-white px-6 py-9 shadow-sm sm:px-12 lg:min-h-[650px]">
          <h1 className="mb-10 text-center text-3xl font-extrabold text-primary sm:mb-14 sm:text-4xl">
            {title}
          </h1>
          {children}
        </div>
      </section>
    </main>
  )
}

export function AuthInput({ icon: Icon, label, defaultValue, type = 'text', showPasswordIcon = false }) {
  return (
    <label className="mb-4 flex h-14 items-center gap-4 rounded-md bg-zinc-100 px-4 transition focus-within:ring-4 focus-within:ring-primary/15">
      <Icon size={22} className="shrink-0 text-zinc-700" />
      <span className="min-w-0 flex-1">
        <span className="block text-[10px] font-medium text-text-secondary">{label}</span>
        <input
          type={type}
          defaultValue={defaultValue}
          className="w-full bg-transparent text-sm font-semibold text-text-primary outline-none"
        />
      </span>
      {showPasswordIcon && <Eye size={17} className="shrink-0 text-zinc-800" />}
    </label>
  )
}

export function GoogleButton() {
  return (
    <button
      type="button"
      className="flex h-14 w-full items-center justify-center gap-4 rounded-md bg-white text-sm font-medium text-text-secondary shadow-[0_8px_24px_rgba(17,24,39,0.12)] transition hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(17,24,39,0.16)]"
    >
      <span className="text-2xl font-bold text-blue-500">G</span>
      Login with Google
    </button>
  )
}

export function OrDivider() {
  return (
    <div className="flex items-center gap-6 py-7 text-xs font-semibold text-text-secondary">
      <span className="h-px flex-1 bg-border-soft" />
      OR
      <span className="h-px flex-1 bg-border-soft" />
    </div>
  )
}

export default AuthLayout
