import { useState, useEffect } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { resetPassword } from '../../services/authService'

const ResetPassword = () => {
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()
    const [token, setToken] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [isValidToken, setIsValidToken] = useState(null)

    useEffect(() => {
        const tokenParam = searchParams.get('token')
        const emailParam = searchParams.get('email')

        if (tokenParam && emailParam) {
            setToken(tokenParam)
            setEmail(decodeURIComponent(emailParam))
            setIsValidToken(true)
        } else {
            setIsValidToken(false)
        }
    }, [searchParams])

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (password !== confirmPassword) {
            toast.error('Passwords do not match')
            return
        }

        if (password.length < 8) {
            toast.error('Password must be at least 8 characters')
            return
        }

        setLoading(true)

        try {
            const result = await resetPassword({ token, email, password })
            if (result.success) {
                toast.success('Password reset successful!')
                navigate('/login')
            } else {
                toast.error(result.message || 'Failed to reset password')
            }
        } catch (error) {
            console.error('Failed to reset password:', error)
            toast.error(error.response?.data?.message || 'Failed to reset password')
        } finally {
            setLoading(false)
        }
    }

    if (isValidToken === null) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            </div>
        )
    }

    if (isValidToken === false) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center py-12 px-4">
                <div className="max-w-md w-full">
                    <div className="card">
                        <div className="text-center py-8">
                            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-red-500 to-orange-500 mb-6">
                                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-4">
                                Invalid Reset Link
                            </h2>
                            <p className="text-gray-300 mb-6">
                                This password reset link is invalid or has expired.
                            </p>
                            <Link
                                to="/forgot-password"
                                className="inline-block w-full btn-primary py-3 text-center"
                            >
                                Request New Reset Link
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center py-12 px-4">
            <div className="max-w-md w-full">
                <Link to="/login" className="inline-flex items-center text-gray-400 hover:text-white mb-8">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to Login
                </Link>

                <div className="card">
                    <div className="text-center mb-10">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-orange-500 to-red-500 mb-6">
                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                            </svg>
                        </div>
                        <h2 className="text-3xl font-bold text-white mb-3">
                            Reset Password
                        </h2>
                        <p className="text-gray-400">
                            Enter your new password below.
                        </p>
                    </div>

                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Email Address
                            </label>
                            <input
                                type="email"
                                required
                                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl placeholder-gray-500 text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                New Password
                            </label>
                            <input
                                type="password"
                                required
                                minLength={8}
                                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl placeholder-gray-500 text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <p className="text-xs text-gray-500 mt-1">Minimum 8 characters</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Confirm New Password
                            </label>
                            <input
                                type="password"
                                required
                                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl placeholder-gray-500 text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                placeholder="••••••••"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 px-4 bg-gradient-to-r from-orange-600 to-red-600 text-white font-semibold rounded-xl hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            {loading ? 'Resetting Password...' : 'Reset Password'}
                        </button>
                    </form>

                    <div className="mt-8 text-center text-sm text-gray-400">
                        Remember your password?{' '}
                        <Link to="/login" className="font-semibold text-primary hover:text-primary/80">
                            Back to login
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ResetPassword
