import { createContext, useContext, useState } from 'react'

const AuthContext = createContext({})

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)

  const login = async (email, password) => {
    setLoading(true)
    try {
      // Mock login for now
      await new Promise(resolve => setTimeout(resolve, 1000))
      const mockUser = {
        uid: '123',
        email: email,
        displayName: email.split('@')[0],
        role: 'artist'
      }
      setUser(mockUser)
      return { success: true, user: mockUser }
    } catch (error) {
      return { success: false, error: 'Login failed' }
    } finally {
      setLoading(false)
    }
  }

  const register = async (email, password, name) => {
    setLoading(true)
    try {
      // Mock registration for now
      await new Promise(resolve => setTimeout(resolve, 1000))
      const mockUser = {
        uid: '456',
        email: email,
        displayName: name,
        role: 'artist'
      }
      setUser(mockUser)
      return { success: true, user: mockUser }
    } catch (error) {
      return { success: false, error: 'Registration failed' }
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    setUser(null)
    return { success: true }
  }

  const value = {
    user,
    loading,
    login,
    register,
    logout
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
