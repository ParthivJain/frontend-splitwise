import { useState, useRef, useEffect } from 'react';
import FindFriendsModal from './FindFriendsModal';
import API_BASE_URL from '../utils/api';

const Navbar = ({ currentPage, navigateTo, onNotificationClick, onLogout, onFriendUpdate }) => {

    const [showFindFriends, setShowFindFriends] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isDark, setIsDark] = useState(false);
    const [isClosing, setIsClosing] = useState(false);
    const [photoStep, setPhotoStep] = useState(1);
    const [notificationCount, setNotificationCount] = useState(0);
    const prevCountRef = useRef(0);
    const [profilePic, setProfilePic] = useState(() => {
        return localStorage.getItem('profilePic') || null;
    });
    const fileInputRef = useRef(null);
    
    const [isUploading, setIsUploading] = useState(false);

    const [user, setUser] = useState({
        name: '',
        email: '',
        username: '',
        profilePic: null
    });

    const toggleTheme = () => {
        setIsDark(!isDark);
        document.documentElement.classList.toggle('dark');
    };

    const closeDrawer = () => {
        setIsClosing(true);
        setTimeout(() => {
            setIsProfileOpen(false);
            setIsClosing(false);
            setPhotoStep(1);
        }, 500);
    };

    const handlePhotoUpload = async (e) => {
        const file = e.target.files[0];
        if(!file) return;
        if(!file.type.startsWith('image/')){
            alert('Please upload an image file');
            return;
        }
        if(file.size > 2*1024*1024){
            alert('Image size should be less than 2MB');
            return;
        }

        setIsUploading(true);
        const reader = new FileReader();

        reader.onloadend = async() => {
            const base64 = reader.result;
            const token = localStorage.getItem('token');

            try{
                const response = await fetch(`${API_BASE_URL}/users/profile-pic`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ profilePic: base64 })
                });
                if(response.ok){
                    const data = await response.json();

                    setProfilePic(base64);
                    localStorage.setItem('profilePic', base64);

                    setUser(prev => ({...prev, profilePic: base64}));

                    setPhotoStep(1);
                } else {
                    alert('Failed to upload photo');
                }
            } catch(error){
                console.error('Error uploading photo:', error);
                alert('Something went wrong');
            } finally {
                setIsUploading(false);
            }
        };

        reader.readAsDataURL(file);

    };

    const removePhoto = async () => {
        const token = localStorage.getItem('token');
        try{
            const response = await fetch(`${API_BASE_URL}/users/profile-pic`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if(response.ok) {
                setProfilePic(null);
                localStorage.removeItem('profilePic');
                setUser(prev => ({ ...prev, profilePic: null}));
                setPhotoStep(1);
            } else {
                alert('Failed to remove photo');
            }
        } catch (error) {
            console.error('Error removing photo : ', error);
            alert('Something went wrong');
        }
    };

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    const openPhotoEdit = () => {
        setPhotoStep(2);
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('isLoggedIn');
        onLogout();
    };

    useEffect(() => {
        const fetchUserData = async () => {
            const token = localStorage.getItem('token');
            if (!token) return;
            try {
                const response = await fetch(`${API_BASE_URL}/users/me`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.ok) {
                    const data = await response.json();
                    setUser(data);
                    if (data.profilePic) {
                        setProfilePic(data.profilePic);
                        localStorage.setItem('profilePic', data.profilePic);
                    }
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        };
        fetchUserData();
    }, []);

    useEffect(() => {
        const fetchNotificationCount = async () => {
            const token = localStorage.getItem('token');
            if (!token) return;
            try {
                const response = await fetch(`${API_BASE_URL}/notifications`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.ok) {
                    const data = await response.json();
                    const newCount = data.length;

                    if (newCount !== prevCountRef.current) {
                        if (onFriendUpdate) onFriendUpdate();
                        prevCountRef.current = newCount;
                    }
                    setNotificationCount(newCount);
                }
            } catch (error) {
                console.error('Error fetching notifications:', error);
            }
        };

        fetchNotificationCount();
        const interval = setInterval(fetchNotificationCount, 5000);
        return () => clearInterval(interval);
    }, [onFriendUpdate]);

    return (
        <>
            <nav className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">

                        {}
                        <button
                            onClick={() => { setIsProfileOpen(true); setIsClosing(false); setPhotoStep(1); }}
                            className='w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-xl hover:ring-2 ring-indigo-500 transition-all'
                        >
                            👤
                        </button>

                        {}
                        <span className='text-xl font-bold text-indigo-600 dark:text-indigo-400'>
                            💰 SplitWise
                        </span>

                        {}
                        <button
                            onClick={onNotificationClick}
                            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors relative text-xl"
                        >
                            🔔
                            {notificationCount > 0 && (
                                <span className="absolute -top-0 -right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                    {notificationCount}
                                </span>
                            )}
                        </button>

                    </div>
                </div>
            </nav>

            {}
            {(isProfileOpen || isClosing) && (
                <div className="fixed inset-0 z-50 flex">
                    <div 
                        className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
                            isClosing ? 'opacity-0' : 'opacity-100'
                        }`}
                        onClick={closeDrawer}
                    ></div>

                    <div className={`relative w-[70%] sm:w-[60%] md:w-[40%] h-full bg-white dark:bg-gray-800 shadow-2xl transition-transform duration-300 ease-out ${
                        isClosing ? '-translate-x-full' : 'animate-slide-in-left'
                    }`}>

                        <button
                            onClick={closeDrawer}
                            className='absolute h-8 w-8 flex items-center justify-center top-4 right-4 text-xl p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full text-gray-700 dark:text-gray-300'
                        >
                            ✕
                        </button>

                        {photoStep === 1 && (
                            <div className='p-6 pt-12'>
                                <div className='flex flex-col items-center'>
                                    <div className='relative'>
                                        <div className='w-24 h-24 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-5xl overflow-hidden'>
                                            {profilePic ? (
                                                <img src={profilePic} alt="Profile" className="w-full h-full object-cover" />
                                            ) : (
                                                <span>👤</span>
                                            )}
                                        </div>
                                        <button 
                                            onClick={openPhotoEdit}
                                            className='absolute bottom-0 right-0 bg-indigo-600 text-white p-1.5 rounded-full text-xs hover:bg-indigo-700 transition-colors'
                                        >
                                            ✏️
                                        </button>
                                    </div>
                                    <h2 className='text-xl font-bold mt-3 dark:text-white'>{user.name || 'User'}</h2>
                                    <p className='text-gray-500 dark:text-gray-400 text-sm'>@{user.username || 'username'}</p>
                                </div>

                                <hr className='my-6 border-gray-200 dark:border-gray-700'/>

                                <div className="space-y-2">
                                    {currentPage === 'history' && (
                                        <button onClick={() => { navigateTo('home'); closeDrawer(); }} className='w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'>
                                            <span className="text-xl">🏠</span><span>Home</span>
                                        </button>
                                    )}
                                    {currentPage === 'home' && (
                                        <button onClick={() => { navigateTo('history'); closeDrawer(); }} className='w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'>
                                            <span className="text-xl">📜</span><span>History</span>
                                        </button>
                                    )}
                                    <button onClick={() => { setShowFindFriends(true); closeDrawer(); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300">
                                        <span className="text-xl">🔍</span><span>Find Friends</span>
                                    </button>
                                    <button onClick={toggleTheme} className='w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'>
                                        <span className='text-xl'>{isDark ? '☀️' : '🌙'}</span>
                                        <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
                                    </button>
                                    <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-red-600 dark:text-red-400">
                                        <span className='text-xl'>🚪</span><span>Logout</span>
                                    </button>
                                </div>

                                <div className='absolute bottom-6 left-0 right-0 text-center text-xs text-gray-400 dark:text-gray-600'>
                                    Version 1.0.0
                                </div>
                            </div>
                        )}

                        {photoStep === 2 && (
                            <div className='p-6 pt-12 flex flex-col items-center justify-center h-full'>
                                <h2 className='text-xl font-bold text-gray-900 dark:text-white mb-6'>Profile Photo</h2>
                                <div className='w-40 h-40 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-7xl overflow-hidden shadow-xl'>
                                    {profilePic ? (
                                        <img src={profilePic} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <span>👤</span>
                                    )}
                                </div>
                                <input type="file" ref={fileInputRef} onChange={handlePhotoUpload} accept="image/*" className="hidden" />
                                <button onClick={triggerFileInput}  disabled={isUploading} className="w-full mt-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2">
                                    {isUploading ? '⏳ Uploading...' : '📤 Upload Photo'}
                                </button>
                                <button onClick={removePhoto} disabled={!profilePic} className={`w-full mt-3 py-3 font-medium rounded-xl transition-colors flex items-center justify-center gap-2 ${
                                    profilePic ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-gray-300 dark:bg-gray-600 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                                }`}>
                                    🗑️ Remove Photo
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {showFindFriends && <FindFriendsModal onClose={() => setShowFindFriends(false)} />}
        </>
    );
};

export default Navbar;