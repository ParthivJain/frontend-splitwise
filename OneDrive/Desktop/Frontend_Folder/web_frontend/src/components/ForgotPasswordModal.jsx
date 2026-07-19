import { useState } from 'react';
import API_BASE_URL from '../utils/api';

const ForgotPasswordModal = ({ onClose }) => {
    const [email, setEmail] = useState('');
    const [step, setStep] = useState(1);
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleSendOTP = async () => {
        setError('');
        setMessage('');
        
        if (!email) {
            setError('Please enter your email');
            return;
        }

        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(email)) {
            setError('Please enter a valid email address');
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email.trim() })
            });

            const data = await response.text();
            
            if (response.ok) {
                setMessage('✅ OTP sent to your email!');
                setStep(2);
            } else {
                setError(data || 'Failed to send OTP');
            }
        } catch (error) {
            setError('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = async () => {
        setError('');
        setMessage('');
        
        if (!otp) {
            setError('Please enter OTP');
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email.trim(), otp: otp.trim() })
            });

            const data = await response.text();
            
            if (response.ok) {
                setMessage('✅ OTP verified successfully!');
                setStep(3);
            } else {
                setError(data || 'Invalid OTP');
            }
        } catch (error) {
            setError('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async () => {
        setError('');
        setMessage('');
        
        if (newPassword.length < 8) {
            setError('Password must be at least 8 characters long');
            return;
        }
        
        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    email: email.trim(), 
                    otp: otp.trim(), 
                    newPassword 
                })
            });

            const data = await response.text();
            
            if (response.ok) {
                setMessage('✅ Password reset successfully!');
                setTimeout(() => onClose(), 2000);
            } else {
                setError(data || 'Failed to reset password');
            }
        } catch (error) {
            setError('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="w-full max-w-sm bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6">
                
                {}
                <div className="text-center mb-6">
                    <div className="text-4xl mb-2">🔐</div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {step === 1 && 'Forgot Password'}
                        {step === 2 && 'Verify OTP'}
                        {step === 3 && 'Reset Password'}
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        {step === 1 && 'Enter your registered email address'}
                        {step === 2 && `OTP sent to ${email}`}
                        {step === 3 && 'Set your new password'}
                    </p>
                </div>

                {}
                {error && (
                    <div className="mb-4 p-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm rounded-lg text-center">
                        {error}
                    </div>
                )}
                
                {message && (
                    <div className="mb-4 p-2 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-sm rounded-lg text-center">
                        {message}
                    </div>
                )}

                {}
                {step === 1 && (
                    <form onSubmit={(e) => { e.preventDefault(); handleSendOTP(); }} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Email Address
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your email"
                                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                                disabled={loading}
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full py-2 text-white font-medium rounded-lg transition-colors ${
                                loading
                                    ? 'bg-indigo-400 cursor-not-allowed'
                                    : 'bg-indigo-600 hover:bg-indigo-700'
                            }`}
                        >
                            {loading ? '⏳ Sending...' : 'Send OTP'}
                        </button>
                    </form>
                )}

                {}
                {step === 2 && (
                    <form onSubmit={(e) => { e.preventDefault(); handleVerifyOTP(); }} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Enter OTP
                            </label>
                            <input
                                type="text"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                placeholder="Enter 6-digit OTP"
                                maxLength="6"
                                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-center text-2xl tracking-widest"
                                disabled={loading}
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full py-2 text-white font-medium rounded-lg transition-colors ${
                                loading
                                    ? 'bg-indigo-400 cursor-not-allowed'
                                    : 'bg-indigo-600 hover:bg-indigo-700'
                            }`}
                        >
                            {loading ? '⏳ Verifying...' : 'Verify OTP'}
                        </button>
                        <button
                            type="button"
                            onClick={() => setStep(1)}
                            className="w-full py-2 text-sm text-gray-500 dark:text-gray-400 hover:underline"
                        >
                            ← Change email
                        </button>
                    </form>
                )}

                {}
                {step === 3 && (
                    <form onSubmit={(e) => { e.preventDefault(); handleResetPassword(); }} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                New Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="Min 8 characters"
                                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all pr-10"
                                    disabled={loading}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-2.5 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                                >
                                    {showPassword ? '🔓' : '🔒'}
                                </button>
                            </div>
                            {newPassword.length > 0 && newPassword.length < 8 && (
                                <p className="text-xs text-red-500 mt-1">⚠️ Min 8 characters required</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Confirm Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Re-enter password"
                                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all pr-10"
                                    disabled={loading}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-2.5 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                                >
                                    {showConfirmPassword ? '🔓' : '🔒'}
                                </button>
                            </div>
                            {confirmPassword.length > 0 && newPassword !== confirmPassword && (
                                <p className="text-xs text-red-500 mt-1">⚠️ Passwords do not match</p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={loading || newPassword.length < 8 || newPassword !== confirmPassword}
                            className={`w-full py-2 text-white font-medium rounded-lg transition-colors ${
                                loading || newPassword.length < 8 || newPassword !== confirmPassword
                                    ? 'bg-indigo-400 cursor-not-allowed'
                                    : 'bg-indigo-600 hover:bg-indigo-700'
                            }`}
                        >
                            {loading ? '⏳ Resetting...' : 'Reset Password'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default ForgotPasswordModal;