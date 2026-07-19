import { useState } from 'react';
import FriendDataOverlay from './FriendDataOverlay';
import HistoryFriendDataOverlay from './HistoryFriendDataOverlay';
import ChatOverlay from './ChatOverlay';
import API_BASE_URL from '../utils/api';

const FriendItem = ({ 
    friend, 
    unreadCount,
    isDeleted = false, 
    isHistory = false,
    onRestore,
    fetchFriends,
    onDeletePermanent,
    clearUnread,
    onlineUsers
}) => {
    const [showData, setShowData] = useState(false);
    const [showChat, setShowChat] = useState(false);
    const [showPFP, setShowPFP] = useState(false);
    const [currentBalance, setCurrentBalance] = useState(friend.balance);

    const hasMessage = (unreadCount > 0 || friend.hasUnreadMessage);

    const getInitial = (name) => name?.charAt(0).toUpperCase() || '?';
    const getColor = (name) => {
        const colors = ['bg-red-500', 'bg-blue-500', 'bg-yellow-500', 'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500'];
        return colors[(name?.length || 0) % colors.length];
    };

    const isOnline = !isHistory && onlineUsers?.has(friend.friendId);

    const getBalanceDisplay = () => {
        if (currentBalance === 0) {
            return {
                text: 'Settled',
                color: 'text-gray-500 dark:text-gray-400'
            };
        } else if (currentBalance < 0) {
            return {
                text: `₹${Math.abs(currentBalance)}`,
                color: 'text-red-600 dark:text-red-400'
            };
        } else {
            return {
                text: `₹${currentBalance}`,
                color: 'text-green-600 dark:text-green-400'
            };
        }
    };

    const { text: balanceText, color: balanceColor } = getBalanceDisplay();

    const handleOverlayClose = () => {
        setShowData(false);
        fetchUpdateBalance();
        if (fetchFriends) fetchFriends();
    };

    const handleOverlayClose2 =() => {
        setShowData(false);
        if (fetchFriends) fetchFriends();
    }

    const handleOpenChat = async (friendId) => {
        const token = localStorage.getItem('token');
        try{
            const response = await fetch(`${API_BASE_URL}/chat/open/${friendId}`,{
                method: 'POST',
                headers: {'Authorization' : `Bearer ${token}`}
            })
        } catch(error) {
            console.error("Error in opening chat : ",error);
        }
    }

    const handleCloseChat = async (friendId) => {
        const token = localStorage.getItem('token');
        try{
            const response = await fetch(`${API_BASE_URL}/chat/close/${friendId}`, {
                method: 'POST',
                headers: {'Authorization' : `Bearer ${token}`}
            })
        } catch(error) {
            console.error("Error in closing chat : ",error);
        }
    }

    const fetchUpdateBalance = async () => {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`${API_BASE_URL}/friends/${friend.id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            setCurrentBalance(data.balance);
        } catch (error) {
            console.error('Error fetching balance:', error);
        }
    };

    return (
        <>
            <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm p-3 flex items-center gap-3 hover:shadow-md transition-shadow ${
                isDeleted ? 'opacity-60' : ''
            }`}>
                
                {}
                <button 
                    onClick={() => setShowPFP(true)}
                    className={`flex-shrink-0 w-10 h-10 rounded-full overflow-hidden
                        ${!isHistory && isOnline ? "ring-3 ring-green-400 shadow-[0_0_12px_#4ade80]" : ""}
                    `}
                >
                    {friend.profilePic ? (
                        <img src={friend.profilePic} alt={friend.friendName} className="w-full h-full object-cover" />
                    ) : (
                        <div className={`w-full h-full ${getColor(friend.friendName)} flex items-center justify-center text-white font-bold text-lg`}>
                            {getInitial(friend.friendName)}
                        </div>
                    )}
                </button>

                {}
                <div 
                    onClick={() => setShowData(true)}
                    className="flex-1 min-w-0 text-left cursor-pointer"
                >
                    <h4 className="font-medium text-gray-900 dark:text-gray-100 text-sm truncate">
                        {friend.friendName}
                        {isDeleted && <span className="ml-2 text-xs text-gray-400">(Deleted)</span>}
                    </h4>
                    <p className={`text-xs font-medium ${balanceColor}`}>
                        {balanceText}
                    </p>
                </div>

                {}
                <div className="flex gap-1.5 flex-shrink-0 ml-2">
                    {!isHistory && !isDeleted && (
                        <button 
                            onClick={() => {
                                setShowChat(true);
                                handleOpenChat(friend.id);
                            }}
                            className={hasMessage ? "px-2.5 py-1 text-xs font-medium bg-indigo-500 dark:bg-blue-700/70 rounded-lg hover:bg-indigo-400 dark:hover:bg-indigo-700/50 transition-colors" : "px-2.5 py-1 text-xs font-medium bg-gray-200 dark:bg-gray-700/70 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"}
                        >
                            💬
                        </button>
                    )}
                    
                    {}
                </div>
            </div>

            {}
            {showPFP && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowPFP(false)}>
                    <div className="relative max-w-2xl max-h-[80vh]">
                        {friend.profilePic ? (
                            <img src={friend.profilePic} alt={friend.friendName} className="w-full h-full object-contain rounded-2xl" />
                        ) : (
                            <div className={`w-64 h-64 rounded-full ${getColor(friend.friendName)} flex items-center justify-center text-white text-8xl font-bold`}>
                                {getInitial(friend.friendName)}
                            </div>
                        )}
                        <button onClick={() => setShowPFP(false)} className="absolute w-8 h-8 flex items-center justify-center top-0 right-0 p-2 rounded-full bg-black/40 hover:bg-black/30 text-white text-xl">
                            ✕
                        </button>
                    </div>
                </div>
            )}

            {}
            {showData && (
                isHistory ? (
                    <HistoryFriendDataOverlay 
                        friend={friend} 
                        onClose={() => setShowData(false)}
                        onRestore={onRestore}
                        onDeletePermanent={onDeletePermanent}
                    />
                ) : (
                    <FriendDataOverlay 
                        friend={friend} 
                        onClose={handleOverlayClose} 
                        onClose2 = {handleOverlayClose2}
                        onBalanceUpdate={setCurrentBalance}
                    />
                )
            )}

            {}
            {showChat && !isHistory && (
                <ChatOverlay 
                    friend={friend} 
                    onlineUsers={onlineUsers}
                    onClose={() => {
                        setShowChat(false);
                        if (fetchFriends) fetchFriends();
                        if (clearUnread) clearUnread(friend.friendId);
                        handleCloseChat(friend.id);
                    }}
                />
            )}
        </>
    );
};

export default FriendItem;