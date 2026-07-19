import { useEffect, useState } from 'react';
import ForgotPasswordModal from '../components/ForgotPasswordModal';
import API_BASE_URL from '../utils/api';

const LoginPage = ({ onLogin }) => {
    const [isSignup, setIsSignup] = useState(false);
    const [name, setName] = useState('');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [remember, setRemember] = useState(true);
    const [error, setError] = useState('');
    const [showForgotPassword, setShowForgotPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    useEffect(() => {
        const savedEmail = localStorage.getItem('savedEmail');
        const savedPassword = localStorage.getItem('savedPassword');
        if(savedEmail) setEmail(savedEmail);
        if(savedPassword) setPassword(savedPassword);
    }, []);

    const isValidEmail = (email) => {
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return emailRegex.test(email);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!isValidEmail(email)) {
            setError('Please enter a valid email address (e.g., name@domain.com)');
            return;
        }

        setLoading(true);

        if (isSignup) {
            if (!name.trim()) {
                setError('Please enter your name');
                setLoading(false);
                return;
            }
            if(!username.trim()){
                setError('Please enter a valid username');
                setLoading(false);
                return;
            }
            if (password.length < 8) {
                setError('Password must be at least 8 characters long');
                setLoading(false);
                return;
            }
            if (password !== confirmPassword) {
                setError('Passwords do not match');
                setLoading(false);
                return;
            }

            try {
                const response = await fetch(`${API_BASE_URL}/auth/signup`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, username, email, password })
                });
                const data = await response.text();
                if (response.ok) {
                    alert('Account created! Please login.');
                    setIsSignup(false);
                } else {
                    setError(data || 'Signup failed!');
                }
            } catch (error) {
                setError('Network error. Please try again.');
            } finally {
                setLoading(false);
            }

        } else {
            try {
                const response = await fetch(`${API_BASE_URL}/auth/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });
                const token = await response.text();
                if (response.ok) {
                    localStorage.setItem('token', token);
                    if (remember) {
                        localStorage.setItem('isLoggedIn', 'true');
                        localStorage.setItem('savedEmail', email);
                        localStorage.setItem('savedPassword', password);
                    }
                    onLogin(remember);
                } else {
                    setError(token || 'Invalid credentials');
                }
            } catch (error) {
                setError('Network error. Please try again.');
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <div className="h-screen max-h-screen overflow-hidden flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
            <div className="w-full max-w-sm bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6">

                {}
                <div className="text-center mb-6">
                    <div className="text-4xl mb-2">💰</div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">SplitWise</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        {isSignup ? 'Create your account' : 'Track expenses with friends'}
                    </p>
                </div>

                {}
                {error && (
                    <div className="mb-4 p-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm rounded-lg text-center">
                        {error}
                    </div>
                )}

                {}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {isSignup && (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Enter your name"
                                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Username</label>
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    placeholder="Enter Username"
                                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Enter your email"
                                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                                />
                            </div>

                            {}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Min 8 characters"
                                        className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all pr-10"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-2.5 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                                    >
                                        {showPassword ? '🔓' : '🔒'}
                                    </button>
                                </div>
                            </div>

                            {}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirm Password</label>
                                <div className="relative">
                                    <input
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="Re-enter Password"
                                        className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all pr-10"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3 top-2.5 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                                    >
                                        {showConfirmPassword ? '🔓' : '🔒'}
                                    </button>
                                </div>
                            </div>
                        </>
                    )}

                    {!isSignup && (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Enter your email"
                                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                                />
                            </div>

                            {}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Enter your password"
                                        className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all pr-10"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-2.5 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                                    >
                                        {showPassword ? '🔓' : '🔒'}
                                    </button>
                                </div>
                            </div>
                        </>
                    )}

                    {}
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="remember"
                            checked={remember}
                            onChange={(e) => setRemember(e.target.checked)}
                            className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                        />
                        <label htmlFor="remember" className="text-sm text-gray-600 dark:text-gray-400">
                            Remember Id and Password?
                        </label>
                    </div>

                    {}
                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-2 text-white font-medium rounded-lg transition-colors ${
                            loading
                                ? 'bg-indigo-400 cursor-not-allowed'
                                : 'bg-indigo-600 hover:bg-indigo-700'
                        }`}
                    >
                        {loading ? '⏳ Loading...' : (isSignup ? 'Create Account' : 'Login')}
                    </button>

                    {!isSignup && (
                        <div className="text-right">
                            <button
                                type="button"
                                onClick={() => setShowForgotPassword(true)}
                                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
                            >
                                Forgot Password?
                            </button>
                        </div>
                    )}

                    <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                        {isSignup ? 'Already have an account?' : "Don't have an account?"}
                        <button
                            type="button"
                            onClick={() => { setIsSignup(!isSignup); setError(''); }}
                            className="ml-1 text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
                        >
                            {isSignup ? 'Login' : 'Sign Up'}
                        </button>
                    </p>
                </form>
            </div>

            {showForgotPassword && (
                <ForgotPasswordModal onClose={() => setShowForgotPassword(false)} />
            )}
        </div>
    );
};

export default LoginPage;