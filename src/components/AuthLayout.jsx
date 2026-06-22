import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import Logo from "./Logo";
import { FcGoogle } from "react-icons/fc";
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
              src='images/login.png'
              alt="VOXA account security illustration"
              className="relative z-10 w-[500px] max-w-full"
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
  );
}

export function AuthInput({
  icon: Icon,
  label,
  defaultValue,
  type = "text",
  showPasswordIcon = false,
  name,
  value,
  onChange,
  required = true,
}) {
  const [visible, setVisible] = useState(false);
  const inputType = showPasswordIcon ? (visible ? "text" : "password") : type;

  return (
    <label className="mb-4 flex h-14 items-center gap-4 rounded-md bg-zinc-100 px-4 transition focus-within:ring-4 focus-within:ring-primary/15">
      <Icon size={22} className="shrink-0 text-zinc-700" />
      <span className="min-w-0 flex-1">
        <span className="block text-[10px] font-medium text-text-secondary">
          {label}
        </span>
        <input
          name={name}
          type={inputType}
          value={value}
          onChange={onChange}
          defaultValue={value === undefined ? defaultValue : undefined}
          required={required}
          className="w-full bg-transparent text-sm font-semibold text-text-primary outline-none"
        />
      </span>
      {showPasswordIcon && (
        <button
          type="button"
          onClick={() => setVisible((value) => !value)}
          className="shrink-0 rounded-md p-1 text-zinc-800 transition hover:bg-white"
          aria-label={visible ? "Hide password" : "Show password"}
        >
          {visible ? <EyeOff size={17} /> : <Eye size={17} />}
        </button>
      )}
    </label>
  );
}

export function GoogleButton({ onClick, loading = false, disabled = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      className="flex h-14 w-full items-center justify-center gap-4 rounded-md bg-white text-sm font-medium text-text-secondary shadow-[0_8px_24px_rgba(17,24,39,0.12)] transition hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(17,24,39,0.16)] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
    >
      <FcGoogle size={24} className={loading ? "animate-pulse" : ""} />
      {loading ? "Signing in with Google..." : "Login with Google"}
    </button>
  );
}

export function OrDivider() {
  return (
    <div className="flex items-center gap-6 py-7 text-xs font-semibold text-text-secondary">
      <span className="h-px flex-1 bg-border-soft" />
      OR
      <span className="h-px flex-1 bg-border-soft" />
    </div>
  );
}

export default AuthLayout;
