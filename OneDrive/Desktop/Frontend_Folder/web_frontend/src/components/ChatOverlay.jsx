import { useState, useRef, useEffect } from 'react';
import webstomp from 'webstomp-client';
import API_BASE_URL from '../utils/api';

const ChatOverlay = ({ friend, onlineUsers, onClose }) => {
    const [stompClient, setStompClient] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [editingMessage, setEditingMessage] = useState(null);
    const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
    const [showMenu, setShowMenu] = useState(false);
    const [selectedMessage, setSelectedMessage] = useState(null);
    const messagesEndRef = useRef(null);
    const token = localStorage.getItem('token');
    const payload = JSON.parse(atob(token.split('.')[1]));
    const userId = payload.id;

    const isOnline = onlineUsers.has(friend.friendId);

    useEffect(() => {
        const fetchHistory = async () => {
            const token = localStorage.getItem('token');
            try {
                const response = await fetch(`${API_BASE_URL}/chat/${friend.id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.ok) {
                    const data = await response.json();
                    setMessages(data);
                }
            } catch (error) {
                console.error('Error fetching chat history:', error);
            }
        };
        fetchHistory();
    }, [friend.id]);

    useEffect(() => {
        const socket = new WebSocket("wss://backend-splitwise.onrender.com/ws");
        const stomp = webstomp.over(socket, {
            debug: false
        });
        
        stomp.connect({
            
        }, () => {
            stomp.subscribe(`/topic/messages`, (message) => {
                const data = JSON.parse(message.body);

                const friendUserId = friend.friendId;

                const isCurrentChat =
                    (data.senderId === userId && data.receiverId === friendUserId) ||
                    (data.senderId === friendUserId && data.receiverId === userId);

                if (!isCurrentChat) {
                    return; 
                }
                setMessages(prev => {

                    const index = prev.findIndex(m => m.id === data.id);

                    if (index !== -1) {

                        const updated = [...prev];
                        updated[index] = data;

                        return updated;
                    }

                    return [...prev, data];
                });
            });
        });

        setStompClient(stomp);

        return () => {
            if (stomp && stomp.connected) {
                stomp.disconnect();
            }
        };
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async () => {
        if (!newMessage.trim() || !stompClient || !stompClient.connected) return;

        if (editingMessage) {
            try{
                const response = await fetch(`${API_BASE_URL}/chat/${editingMessage.id}`,{
                    method: "PUT",
                    headers: {
                        "Content-Type": "text/plain",
                        "Authorization": `Bearer ${token}`
                    },
                    body: newMessage.trim()
                });
                if(response.ok){
                    setEditingMessage(null);
                    setNewMessage("");
                }
            } catch (error) {
                console.error(error);
            }
            return;
        }
        const message = {
            receiverId: friend.id,
            message: newMessage.trim(),
            status: 'sent'
        };

        if (stompClient && stompClient.connected) {
            stompClient.send('/app/chat.send', JSON.stringify(message), {});
        }
        setNewMessage('');
    };

    const handleDeleteForMe = async () => {
        if (!selectedMessage) return;
        try {
            const response = await fetch(`${API_BASE_URL}/chat/${selectedMessage.id}/me`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                setMessages(prev => prev.filter(msg => msg.id !== selectedMessage.id));
                setShowMenu(false);
                setSelectedMessage(null);
            }
        } catch (error) {
            console.error('Error deleting message:', error);
        }
    };

    const handleDeleteForEveryone = async () => {
        if (!selectedMessage) return;
        try {
            const response = await fetch(`${API_BASE_URL}/chat/${selectedMessage.id}/everyone`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                setMessages(prev =>
                    prev.map(msg =>
                        msg.id === selectedMessage.id
                            ? { 
                                ...msg, 
                                message: 'This message was deleted', 
                                deletedForEveryone: true,
                                isDeletedBySender: false,
                                isDeletedByReceiver: false
                              }
                            : msg
                    )
                );
                setShowMenu(false);
                setSelectedMessage(null);
            }
        } catch (error) {
            console.error('Error deleting message:', error);
        }
    };

    const handleEdit = () => {
        if (!selectedMessage) return;
        setEditingMessage(selectedMessage);
        setNewMessage(selectedMessage.message);
        setShowMenu(false);
    };

    const handleUpdateEdit = async () => {
        if (!editingMessage) return;
        setEditingMessage(null);
        setNewMessage('');
    };

    const handleContextMenu = (e, message) => {
        e.preventDefault();
        setSelectedMessage(message);
        setMenuPosition({ x: e.clientX, y: e.clientY });
        setShowMenu(true);
    };

    const handleLongPress = (message) => {
        setSelectedMessage(message);
        setMenuPosition({ x: window.innerWidth / 2 - 80, y: window.innerHeight / 2 - 60 });
        setShowMenu(true);
    };

    const visibleMessages = messages.filter(msg => {
        if (msg.deletedForEveryone) {
            if(msg.senderId === userId && msg.deletedBySender) return false;
            if(msg.receiverId === userId && msg.deletedByReceiver) return false;
            return true;
        }
        
        if (msg.receiverId === userId) {
            if(msg.deletedByReceiver){
                return false;
            }
        }
        
        if (msg.senderId === userId) {
            if(msg.deletedBySender){
                return false;
            }
        }
        
        return true;
    });

    const isMyMessage = selectedMessage?.senderId === userId;
    const isDeletedMessage = selectedMessage?.message === 'This message was deleted';

    return (
        <div 
            className="fixed inset-0 z-15 flex flex-col items-center justify-center bg-white"
            style={{ top: '64px' }}
        >
            <div 
                className=" w-full shadow-xl max-w-xl h-full flex flex-col bg-white dark:bg-gray-800 rounded-xl "
            >
                
                {}
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-indigo-600 dark:bg-indigo-800 flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={onClose}
                            className="text-white hover:bg-indigo-500 dark:hover:bg-indigo-700 p-1 rounded-lg transition-colors"
                        >
                            ←
                        </button>
                        <div>
                            <h2 className="text-lg font-bold text-white">{friend.friendName}</h2>
                            <p className={`text-xs ${isOnline ? 'text-green-300' : 'text-gray-300'}`}>
                                {isOnline ? '🟢 Online' : '⚪ Offline'}
                            </p>
                        </div>
                    </div>
                </div>

                {}
                <div className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-hide bg-gray-50 dark:bg-gray-900/50">
                    {visibleMessages.length === 0 ? (
                        <div className="flex items-center justify-center h-full text-center text-gray-500 dark:text-gray-400">
                            <div>
                                <p className="text-4xl mb-3">💬</p>
                                <p className="text-lg font-medium">No chats with {friend.friendName}</p>
                                <p className="text-sm">Start chatting...</p>
                            </div>
                        </div>
                    ) : (
                        visibleMessages.map(msg => {
                            const isMe = msg.senderId === userId;
                            const isDeleted = msg.deletedForEveryone;
                            const time = new Date(msg.createdAt);
                            const timeStr = time.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

                            return (
                                <div
                                    key={msg.id}
                                    className={`flex ${isMe ? 'justify-end' : 'justify-start'} relative group`}
                                    onContextMenu={(e) => handleContextMenu(e, msg)}
                                    onTouchStart={(e) => {
                                        const touch = e.touches[0];
                                        let timer = setTimeout(() => {
                                            handleLongPress(msg);
                                        }, 500);
                                        e.currentTarget.ontouchend = () => clearTimeout(timer);
                                        e.currentTarget.ontouchmove = () => clearTimeout(timer);
                                    }}
                                >
                                    <div className={`max-w-[80%] rounded-2xl p-3 shadow-sm ${
                                        isMe
                                            ? isDeleted
                                                ? 'bg-gray-400 dark:bg-gray-600 text-gray-200 italic'
                                                : 'bg-indigo-600 text-white'
                                            : isDeleted
                                                ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 italic'
                                                : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white'
                                    }`}>
                                        <p className="text-sm break-words">
                                            {isDeleted ? "This message was deleted" : msg.message}
                                        </p>
                                        {!isDeleted && (
                                            <p className={`text-[10px] mt-1 ${
                                                isMe ? 'text-indigo-200' : 'text-gray-400 dark:text-gray-400'
                                            }`}>
                                                {timeStr}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {}
                <div className="p-3 border-t border-gray-200 dark:border-gray-700 flex gap-2 bg-white dark:bg-gray-800 flex-shrink-0">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        placeholder={editingMessage ? 'Edit message...' : `Message ${friend.friendName}...`}
                        className="flex-1 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                    />
                    <button
                        onClick={handleSend}
                        disabled={!newMessage.trim()}
                        className={`px-4 py-2 rounded-xl font-medium transition-colors ${
                            newMessage.trim()
                                ? editingMessage
                                    ? 'bg-green-600 hover:bg-green-700 text-white'
                                    : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                                : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                        }`}
                    >
                        {editingMessage ? '💾' : '➤'}
                    </button>
                </div>

            </div>

            {}
            {showMenu && selectedMessage && (
                <>
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className="fixed z-50 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 py-1 min-w-[160px]"
                        style={{
                            top: menuPosition.y,
                            left: menuPosition.x,
                            transform: 'translate(-50%, -50%)'
                        }}
                    >
                        {!isDeletedMessage && (
                            <>
                                {isMyMessage && (
                                    <button
                                        onClick={handleEdit}
                                        className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
                                    >
                                        ✏️ Edit
                                    </button>
                                )}
                                {isMyMessage && (
                                    <button
                                        onClick={handleDeleteForEveryone}
                                        className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
                                    >
                                        🗑️ Everyone
                                    </button>
                                )}
                            </>
                        )}
                        <button
                            onClick={handleDeleteForMe}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
                        >
                            🗑️ Me
                        </button>
                        <button
                            onClick={() => setShowMenu(false)}
                            className="w-full text-left px-4 py-2 text-sm text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                            Cancel
                        </button>
                    </div>

                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setShowMenu(false)}
                    />
                </>
            )}
        </div>
    );
};

export default ChatOverlay;