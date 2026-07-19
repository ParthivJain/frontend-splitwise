import { useState, useEffect } from 'react';
import FriendItem from './FriendItem';
import webstomp from 'webstomp-client';
import API_BASE_URL from '../utils/api';

export let friendsData = [];

const FriendList = ({ 
    showDeleted = false, 
    searchQuery = '', 
    onlineUsers,
    isHistory = false,
    onDataChange = null
}) => {
    const [friends, setFriends] = useState([]);
    const [loading, setLoading] = useState(true);

    const [unreadMap, setUnreadMap] = useState(new Map());

    const token = localStorage.getItem('token');
    const payload = JSON.parse(atob(token.split('.')[1]));
    const userId = payload.id;
    
    const fetchFriends = async () => {

        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`${API_BASE_URL}/friends`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            setFriends(data);
            friendsData = data;
        } catch (error) {
            console.error('Error fetching friends:', error);
        } finally {
            setLoading(false);
        }
        if(typeof onDataChange === 'function'){
            onDataChange();
        }
        
    };

    useEffect(() => {
        fetchFriends();
    }, []);

    useEffect(() => {

        const socket = new WebSocket("wss://backend-splitwise.onrender.com/ws");
        const stomp = webstomp.over(socket, {
            debug: false
        });

        stomp.connect({}, () => {

            stomp.subscribe("/topic/friends", (msg) => {

                const message = JSON.parse(msg.body);

                if (message.receiverId === userId) {

                    setUnreadMap(prev => {
                        const map = new Map(prev);
                        map.set(message.senderId, (map.get(message.senderId) || 0) + 1);
                        return map;
                    })
                    fetchFriends();
                }

            });

        });

        return () => {
            if (stomp.connected) {
                stomp.disconnect();
            }
        };

    }, []);

    const clearUnread = (friendId) => {
        setUnreadMap(prev => {
            const map = new Map(prev);
            map.delete(friendId);
            return map;
        });
    };
    
    const filteredFriends = friends.filter(friend => {
        const matchesSearch = friend.friendName?.toLowerCase().includes(searchQuery.toLowerCase()) || false;
        const matchesDeleted = showDeleted ? true : friend.status !== 'deleted';
        return matchesSearch && matchesDeleted;
    });

    const activeFriends = filteredFriends.filter(f => f.status === 'active');
    const deletedFriends = filteredFriends.filter(f => f.status === 'deleted');

    if (loading) {
        return <div className="text-center text-gray-500 dark:text-gray-400 py-8">Loading friends...</div>;
    }

    if (friends.length === 0) {
        return <div className="text-center text-gray-500 dark:text-gray-400 py-8">No friends added yet</div>;
    }

    return (
        <div className="space-y-3">
            {activeFriends.length > 0 && (
                <div>
                    <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                        👥 Friends ({activeFriends.length})
                    </h3>
                    <div className="space-y-2">
                        {activeFriends.map(friend => (
                            <FriendItem 
                                key={friend.id} 
                                friend={friend}
                                unreadCount={unreadMap.get(friend.friendId) || 0}
                                isHistory={isHistory}
                                fetchFriends={fetchFriends}
                                clearUnread={clearUnread}
                                onlineUsers={onlineUsers}
                            />
                        ))}
                    </div>
                </div>
            )}

            {showDeleted && deletedFriends.length > 0 && (
                <div className="mt-4">
                    <h3 className="text-xs font-medium text-gray-400 dark:text-gray-500 mb-2">
                        ⚠️ Deleted Friends
                    </h3>
                    <div className="space-y-2">
                        {deletedFriends.map(friend => (
                            <FriendItem 
                                key={friend.id} 
                                friend={friend.friend} 
                                isDeleted={true} 
                                isHistory={isHistory}
                            />
                        ))}
                    </div>
                </div>
            )}

            {filteredFriends.length === 0 && (
                <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                    <p className="text-4xl mb-2">👥</p>
                    <p>No friends found</p>
                </div>
            )}
        </div>
    );
};

export default FriendList;