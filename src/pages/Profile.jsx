import { Camera, CheckCircle2, Mail, Phone, Save, UserRound, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { DEFAULT_AVATAR, getProfile, normalizeUser, persistUser, updateProfile } from '../services/authApi'

const allowedImageTypes = new Set(['image/jpeg', 'image/png', 'image/webp'])
const maxImageSize = 5 * 1024 * 1024

function Profile() {
  const { onUserUpdated } = useOutletContext()
  const [form, setForm] = useState({ name: '', email: '', phone: '' })
  const [profileUser, setProfileUser] = useState(null)
  const [profileFile, setProfileFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [profileLoading, setProfileLoading] = useState(true)
  const [reloadKey, setReloadKey] = useState(0)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const inputRef = useRef(null)

  useEffect(() => {
    let ignore = false

    getProfile()
      .then((response) => {
        if (ignore) return
        const responseUser = response.data?.data || response.data || response
        const nextUser = normalizeUser(responseUser)
        setProfileUser(nextUser)
        setForm({
          name: responseUser.name || '',
          email: responseUser.email || '',
          phone: responseUser.phone || '',
        })
        onUserUpdated?.(persistUser(nextUser))
        setError('')
      })
      .catch((requestError) => {
        if (!ignore) setError(requestError.message)
      })
      .finally(() => {
        if (!ignore) setProfileLoading(false)
      })

    return () => {
      ignore = true
    }
  }, [onUserUpdated, reloadKey])

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  const updateField = (event) => {
    setForm((values) => ({ ...values, [event.target.name]: event.target.value }))
    setError('')
    setSuccess('')
  }

  const selectImage = (file) => {
    if (!file) return
    if (!allowedImageTypes.has(file.type)) {
      setError('Profile image must be JPG, PNG, or WEBP.')
      return
    }
    if (file.size > maxImageSize) {
      setError('Profile image must not exceed 5 MB.')
      return
    }

    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setProfileFile(file)
    setPreviewUrl(URL.createObjectURL(file))
    setError('')
    setSuccess('')
  }

  const removeSelectedImage = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setProfileFile(null)
    setPreviewUrl('')
    if (inputRef.current) inputRef.current.value = ''
  }

  const validate = () => {
    if (!form.name.trim()) return 'Name is required.'
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) return 'Enter a valid email address.'
    if (!/^\+?[0-9]{8,20}$/.test(form.phone.trim())) return 'Phone must contain 8 to 20 digits.'
    return ''
  }

  const submit = async (event) => {
    event.preventDefault()
    const validationError = validate()
    if (validationError) {
      setError(validationError)
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')
    try {
      const response = await updateProfile({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        profileFile,
      })
      const responseUser = response.data?.data || response.data || response
      const nextUser = persistUser(normalizeUser({ ...profileUser, ...responseUser }))
      setProfileUser(nextUser)
      setForm({ name: nextUser.name, email: nextUser.email, phone: nextUser.phone })
      onUserUpdated?.(nextUser)
      setProfileFile(null)
      setPreviewUrl('')
      if (inputRef.current) inputRef.current.value = ''
      setSuccess(response.message || 'Profile updated successfully.')
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }

  const currentImage = previewUrl || profileUser?.avatar || DEFAULT_AVATAR

  return (
    <div className="mx-auto max-w-4xl px-5 py-8 md:px-10 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-text-primary md:text-3xl">Edit Profile</h1>
        <p className="mt-2 text-sm text-text-secondary">Update your account information and profile image.</p>
      </div>

      {profileLoading ? (
        <div className="rounded-2xl border border-border-soft bg-white p-10 text-center text-sm font-medium text-text-secondary">
          Loading profile...
        </div>
      ) : !profileUser ? (
        <div className="rounded-2xl border border-red-100 bg-red-50 p-6 text-center">
          <p className="text-sm font-medium text-red-600">{error || 'Unable to load profile.'}</p>
          <button type="button" onClick={() => { setProfileLoading(true); setReloadKey((value) => value + 1) }} className="mt-4 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white">
            Retry
          </button>
        </div>
      ) : (
      <form onSubmit={submit} className="overflow-hidden rounded-2xl border border-border-soft bg-white">
        <div className="border-b border-border-soft bg-[#F8FAF9] px-5 py-7 sm:px-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <div className="relative w-fit">
              <img src={currentImage} alt="Profile preview" className="h-28 w-28 rounded-2xl border-4 border-white " />
              <button type="button" onClick={() => inputRef.current?.click()} className="absolute -bottom-2 -right-2 flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white transition hover:bg-[#25A86A]" aria-label="Choose profile image">
                <Camera size={18} />
              </button>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-text-primary">Profile photo</h2>
              <p className="mt-1 text-sm text-text-secondary">JPG, PNG, or WEBP. Maximum size 5 MB.</p>
              <div className="mt-4 flex flex-wrap gap-3">
                <button type="button" onClick={() => inputRef.current?.click()} className="rounded-xl border border-border-soft bg-white px-4 py-2 text-sm font-semibold transition hover:border-primary hover:text-primary">
                  Choose image
                </button>
                {profileFile && (
                  <button type="button" onClick={removeSelectedImage} className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-red-500 transition hover:bg-red-50">
                    <X size={16} /> Remove selection
                  </button>
                )}
              </div>
              <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(event) => selectImage(event.target.files?.[0])} />
            </div>
          </div>
        </div>

        <div className="space-y-5 px-5 py-7 sm:px-8">
          <ProfileField icon={UserRound} label="Name" name="name" value={form.name} onChange={updateField} autoComplete="name" />
          <ProfileField icon={Mail} label="Email" name="email" type="email" value={form.email} onChange={updateField} readOnly autoComplete="email" />
          <ProfileField icon={Phone} label="Phone" name="phone" type="tel" value={form.phone} onChange={updateField} autoComplete="tel" />

          {error && <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">{error}</div>}
          {success && <div className="flex items-center gap-2 rounded-xl border border-primary/20 bg-[#EAFBF3] px-4 py-3 text-sm font-medium text-primary"><CheckCircle2 size={17} />{success}</div>}

          <div className="flex justify-end border-t border-border-soft pt-5">
            <button type="submit" disabled={loading} className="inline-flex h-12 items-center gap-2 rounded-xl bg-primary px-6 text-sm font-semibold text-white transition hover:bg-[#25A86A] disabled:cursor-not-allowed disabled:opacity-60">
              <Save size={17} /> {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </form>
      )}
    </div>
  )
}

function ProfileField({ icon: Icon, label, ...inputProps }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-text-primary">{label}</span>
      <span className="flex h-12 items-center gap-3 rounded-xl border border-border-soft px-4 transition focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10">
        <Icon size={18} className="shrink-0 text-text-secondary" />
        <input {...inputProps} required className="min-w-0 flex-1 bg-transparent text-sm outline-none" />
      </span>
    </label>
  )
}

export default Profile
