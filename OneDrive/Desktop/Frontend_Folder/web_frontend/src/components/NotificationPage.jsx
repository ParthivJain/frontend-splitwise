import { useState, useEffect, useRef } from "react";
import API_BASE_URL from "../utils/api";

const NotificationPage = ({ onClose, onFriendUpdate, onNotificationUpdate }) => {
  const [notifications, setNotifications] = useState([]);
  const bottomRef = useRef(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      const token = localStorage.getItem('token');
      try {
        const response = await fetch(`${API_BASE_URL}/notifications`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setNotifications(data);
        }
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };
    fetchNotifications();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [notifications]);

  const extractFriendId = (message) => {
    const match = message.match(/\[friendId:(\d+)\]/);
    return match ? parseInt(match[1]) : null;
  }

  const handleSettle = async (notif) => {
    const token = localStorage.getItem('token');
    const friendId = extractFriendId(notif.message);
    const message = notif.message.replace(/\[friendId:\d+\]/, '');
    try{
      const response = await fetch(`${API_BASE_URL}/transactions/settle/notif/${friendId}`,{
        method: 'POST',
        headers: { 'Authorization' : `Bearer ${token}`}
      })
      if(response.ok){
        deleteNotification(notif);
      }
    } catch (error) {
      console.error("Error in settling transactions via notification : ", error);
    }
  }

  const handleAdd = async (notif) => {
    const token = localStorage.getItem('token');
    const data = JSON.parse(notif.actionData || '{}');
    const messageLines = notif.message.split('\n');
    const friendId = parseInt(messageLines[0].split(': ')[1]);
    const amount = parseFloat(messageLines[1].split(': ')[1].replace('₹', ''));
    const reason = messageLines[2].split(': ')[1];
    const type = messageLines[4].split(': ')[1];
    const t = type === "given" ? "taken" : "given";
    try{
      const response = await fetch(`${API_BASE_URL}/transactions/add`, {
        method: 'POST',
        headers: {
          'Content-type' : 'application/json',
          'Authorization' : `Bearer ${token}`
        },
        body: JSON.stringify({
          friendId: friendId,
          amount: parseFloat(amount),
          reason: reason,
          type: t
        })
      });
      if(response.ok){
        setNotifications(prev => prev.filter(n => n.id !== notif.id));
        deleteNotification(notif);
        if(window.refreshFriendList){
          window.refreshFriendList();
        }
      }
    } catch(error) {
      console.error('Error in adding transaction : ',error);
    }
  }

  const handleAction = async (notif, action) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${API_BASE_URL}/friend-requests/notification/${notif.id}/${action}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        deleteNotification(notif);
        if (action === 'accept' && onFriendUpdate) {
          if (onFriendUpdate) onFriendUpdate();
          if (onNotificationUpdate) onNotificationUpdate();
        }
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const deleteNotification = async (notif) => {
    const token = localStorage.getItem('token');
    
    if (notif.type === 'friend_request') {
      try {
        const response = await fetch(`${API_BASE_URL}/friend-requests/notification/${notif.id}/reject`, {
          method: 'PUT',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          setNotifications(prev => prev.filter(n => n.id !== notif.id));
        }
      } catch (error) {
        console.error('Error rejecting request:', error);
      }
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/notifications/${notif.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        setNotifications(prev => prev.filter(n => n.id !== notif.id));
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const formatTime = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 z-40 bg-white dark:bg-gray-900 flex flex-col" style={{ top: '64px' }}>
      
      {}
      <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
        <div className="flex items-center justify-between p-4">
          <button 
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-300 text-xl"
            onClick={onClose}
          > 
            ←
          </button>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            🔔 Notifications
          </h1>
          <div className="w-10"></div>
        </div>
      </div>

      {}
      <div className="flex-1 overflow-y-auto p-4 max-w-3xl mx-auto w-full scrollbar-hide">
        {notifications.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400 py-12">
            <p className="text-4xl mb-3">🔔</p>
            <p className="text-lg font-medium">No notifications</p>
            <p className="text-sm">You're all caught up!</p>
          </div>
        ) : (
          <div className="space-y-3 pb-4">
            {notifications.map(notif => (
              <div
                key={notif.id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border-l-4 border-indigo-500 dark:border-indigo-400 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">
                        {notif.type === 'transaction_add' && '📊'}
                        {notif.type === 'request' && '👤'}
                        {notif.type === 'settlement' && '✅'}
                        {notif.type === 'reminder' && '📅'}
                        {notif.type === 'friend_deleted' && '👋'}
                      </span>
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {notif.title}
                      </h3>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 whitespace-pre-line">
                        {notif.type === 'transaction_add' 
                          ? notif.message.replace(/friendId\s*:\s*\d+\s*/i, "")
                          : notif.type === "settlement"
                          ? notif.message.replace(/\s*friendId[\s\S]*$/i, "")
                          : notif.message}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                      {formatTime(notif.createdAt || notif.time)}
                    </p>
                  </div>
                  <button
                    onClick={() => deleteNotification(notif)}
                    className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    ✕
                  </button>
                </div>

                {}
                {notif.actions && notif.actions.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {notif.actions.includes('accept') && (
                      <button
                        onClick={() => handleAction(notif, 'accept')}
                        className="px-3 py-1 text-sm bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                      >
                        Accept
                      </button>
                    )}
                    {notif.actions.includes('add') && (
                      <button
                        onClick={() => handleAdd(notif)}
                        className="px-3 py-1 text-sm bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                      >
                        Add
                      </button> 
                    )}
                    {notif.actions.includes('settle') && (
                      <button
                        onClick={() => handleSettle(notif)}
                        className="px-3 py-1 text-sm bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                      >
                        Settle
                      </button> 
                    )}
                    {notif.actions.includes('cancel') && (
                      <button
                        onClick={() => deleteNotification(notif)}
                        className="px-3 py-1 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                      >
                        cancel
                      </button>
                    )}
                    {notif.actions.includes('reject') && (
                      <button 
                        onClick={() => handleAction(notif, 'reject')}
                        className="px-3 py-1 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                      >
                        Reject
                      </button>
                    )}
                    {notif.actions.includes('view') && (
                      <button 
                        onClick={() => handleAction(notif, 'view')}
                        className="px-3 py-1 text-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
                      >
                        View Balances
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationPage;
