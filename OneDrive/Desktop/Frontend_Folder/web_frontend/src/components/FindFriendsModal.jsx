import { useEffect, useState } from 'react';
import API_BASE_URL from '../utils/api';

const FindFriendsModal = ({ onClose }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [users, setUsers] = useState([]);
    const [friends, setFriends] = useState([]);       
    const [pendingRequests, setPendingRequests] = useState([]);
    const [requestedUsers, setRequestedUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const token = localStorage.getItem('token');
    const currentUserId = JSON.parse(atob(token.split('.')[1])).id;

    useEffect(() => {
        const fetchData = async () => {
            if (!token) return;
            setLoading(true);
            try {
                const usersRes = await fetch(`${API_BASE_URL}/users`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const usersData = await usersRes.json();
                setUsers(usersData);

                const friendsRes = await fetch(`${API_BASE_URL}/friends`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const friendsData = await friendsRes.json();
                setFriends(friendsData);

                const pendingRes = await fetch(`${API_BASE_URL}/friend-requests/pending`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (pendingRes.ok) {
                    const pendingData = await pendingRes.json();
                    const pendingIds = pendingData.map(req => req.receiver.id);
                    setPendingRequests(pendingIds);
                    setRequestedUsers(pendingIds);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [token]);

    const sendRequest = async (userId) => {
        try {
            const response = await fetch(`${API_BASE_URL}/friend-requests/${userId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.ok) {
                setRequestedUsers(prev => [...prev, userId]);
                setPendingRequests(prev => [...prev, userId]);
            } else {
                const errorText = await response.text();
                console.error('Request failed:', errorText);
                alert(errorText);
            }
        } catch (error) {
            console.error('Error sending request:', error);
        }
    };

    const filteredUsers = users.filter(user => {
        if (user.id === currentUserId) return false;

        const isFriend = friends.some(f => {
            if (f.friend) {
                return f.friend.id === user.id;
            }
            if (f.friendId) {
                return f.friendId === user.id;
            }
            return false;
        });
        if (isFriend) return false;

        const matchesSearch = user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            user.username?.toLowerCase().includes(searchQuery.toLowerCase());

        return matchesSearch;
    });

    return (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" style={{ top: '64px' }} onClick={onClose}>
            <div className="relative w-full max-w-md h-[75vh] max-h-[75vh] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
                
                {}
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">🔍 Find Friends</h2>
                    <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">✕</button>
                </div>

                {}
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by name or username..."
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                        autoFocus
                    />
                </div>

                {}
                <div className="flex-1 overflow-y-auto p-4 scrollbar-hide">
                    {loading ? (
                        <div className="text-center text-gray-500 dark:text-gray-400 py-8">⏳ Loading...</div>
                    ) : searchQuery.trim() === '' ? (
                        <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                            <p className="text-4xl mb-3">👤</p>
                            <p className="text-lg font-medium">Search for friends</p>
                        </div>
                    ) : filteredUsers.length === 0 ? (
                        <div className="text-center text-gray-500 dark:text-gray-400 py-8">No users found</div>
                    ) : (
                        filteredUsers.map(user => {
                            const isRequested = pendingRequests.includes(user.id);
                            return (
                                <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                                    <div>
                                        <p className="font-medium text-gray-900 dark:text-white">{user.name}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">@{user.username}</p>
                                    </div>
                                    <button
                                        onClick={() => sendRequest(user.id)}
                                        disabled={isRequested}
                                        className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                                            isRequested
                                                ? 'bg-green-500 text-white cursor-default'
                                                : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                                        }`}
                                    >
                                        {isRequested ? '✅ Requested' : '📤 Send Request'}
                                    </button>
                                </div>
                            );
                        })
                    )}
                </div>

            </div>
        </div>
    );
};

export default FindFriendsModal;