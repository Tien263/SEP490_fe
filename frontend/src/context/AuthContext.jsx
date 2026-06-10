import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const AUTH_STORAGE_KEY = 'frontend-auth-user'
const PENDING_REGISTRATION_KEY = 'frontend-pending-registration'

const AuthContext = createContext(null)

function readJson(key) {
  try {
    const raw = window.localStorage.getItem(key)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function writeJson(key, value) {
  if (value == null) {
    window.localStorage.removeItem(key)
    return
  }

  window.localStorage.setItem(key, JSON.stringify(value))
}

function deriveNameFromEmail(email) {
  const localPart = email.split('@')[0] || 'nguoi-dung'
  return localPart
    .split(/[._-]/g)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)

  useEffect(() => {
    setUser(readJson(AUTH_STORAGE_KEY))
  }, [])

  const value = useMemo(() => {
    return {
      user,
      isAuthenticated: Boolean(user),
      login(email) {
        const pendingRegistration = readJson(PENDING_REGISTRATION_KEY)
        const fullName =
          pendingRegistration?.email === email
            ? pendingRegistration.fullName
            : deriveNameFromEmail(email)

        const nextUser = {
          id: 'mock-user-1',
          fullName,
          email,
        }

        writeJson(AUTH_STORAGE_KEY, nextUser)
        if (pendingRegistration?.email === email) {
          writeJson(PENDING_REGISTRATION_KEY, null)
        }
        setUser(nextUser)
        return nextUser
      },
      logout() {
        writeJson(AUTH_STORAGE_KEY, null)
        setUser(null)
      },
      savePendingRegistration(payload) {
        writeJson(PENDING_REGISTRATION_KEY, payload)
      },
      getPendingRegistration() {
        return readJson(PENDING_REGISTRATION_KEY)
      },
      clearPendingRegistration() {
        writeJson(PENDING_REGISTRATION_KEY, null)
      },
    }
  }, [user])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }

  return context
}
