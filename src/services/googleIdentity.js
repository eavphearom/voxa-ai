const googleScriptUrl = 'https://accounts.google.com/gsi/client'
let scriptPromise

function loadGoogleIdentityScript() {
  if (window.google?.accounts?.id) return Promise.resolve(window.google)
  if (scriptPromise) return scriptPromise

  scriptPromise = new Promise((resolve, reject) => {
    const existingScript = document.querySelector(`script[src="${googleScriptUrl}"]`)
    const script = existingScript || document.createElement('script')

    const handleLoad = () => {
      if (window.google?.accounts?.id) {
        resolve(window.google)
      } else {
        reject(new Error('Google Identity Services failed to initialize.'))
      }
    }
    const handleError = () => reject(new Error('Unable to load Google Sign-In. Check your connection.'))

    script.addEventListener('load', handleLoad, { once: true })
    script.addEventListener('error', handleError, { once: true })

    if (!existingScript) {
      script.src = googleScriptUrl
      script.async = true
      script.defer = true
      document.head.appendChild(script)
    }
  }).catch((error) => {
    scriptPromise = null
    throw error
  })

  return scriptPromise
}

export async function getGoogleCredential() {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
  if (!clientId) throw new Error('Google Sign-In client ID is missing.')

  const google = await loadGoogleIdentityScript()

  return new Promise((resolve, reject) => {
    let settled = false
    let timeoutId
    const finish = (callback, value) => {
      if (settled) return
      settled = true
      window.clearTimeout(timeoutId)
      callback(value)
    }

    google.accounts.id.initialize({
      client_id: clientId,
      auto_select: false,
      cancel_on_tap_outside: true,
      use_fedcm_for_prompt: true,
      callback: (response) => {
        if (response.credential) {
          finish(resolve, response.credential)
        } else {
          finish(reject, new Error('Google did not return a credential.'))
        }
      },
    })

    timeoutId = window.setTimeout(() => {
      finish(reject, new Error('Google Sign-In timed out. Please try again.'))
    }, 120000)

    google.accounts.id.prompt((notification) => {
      if (notification.isNotDisplayed?.()) {
        finish(reject, new Error('Google Sign-In could not be displayed. Allow third-party sign-in, then try again.'))
      } else if (notification.isSkippedMoment?.()) {
        finish(reject, new Error('Google Sign-In was skipped. Please try again.'))
      } else if (notification.isDismissedMoment?.()) {
        finish(reject, new Error('Google Sign-In was cancelled.'))
      }
    })
  })
}
