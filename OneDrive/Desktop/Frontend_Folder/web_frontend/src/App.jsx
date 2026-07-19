import { useState, useEffect, useRef } from 'react';
import './styles/index.css';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import History from './pages/History';
import NotificationPage from './components/NotificationPage';
import ToastNotification from './components/ToastNotification';
import LoginPage from './pages/LoginPage';
import webstomp from 'webstomp-client';
import API_BASE_URL from './utils/api';

function App() {
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [currentPage, setCurrentPage] = useState('home');
  const [showNotification, setShowNotification] = useState(false);
  const [toast, setToast] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [notificationRefreshKey, setNotificationRefreshKey] = useState(0);
  const [stompClient, setStompClient] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem('isLoggedIn') === 'true';
  });
  const [token, setToken] = useState(localStorage.getItem('token'));

  let userId = null;
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      userId = payload.id;
    } catch (error) {
      console.error('Invalid token:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('isLoggedIn');
      setIsLoggedIn(false);
    }
  }

  const timer = useRef(null);
  const status = useRef(false);

  const sendOnline = async () => {
    const token = localStorage.getItem("token");
    if(!token || status.current) return;

    await fetch(`${API_BASE_URL}/presence/online`, {
      method: "POST",
      headers: {'Authorization' : `Bearer ${token}` }
    });

    status.current = true;
  };

  const sendOffline = async () => {
    const token = localStorage.getItem("token");
    if (!token || !status.current) return;

    await fetch(`${API_BASE_URL}/presence/offline`, {
        method: "POST",
        headers: {
        Authorization: `Bearer ${token}`
      }
    });

    status.current = false;
  };
  
  useEffect(() => {
    const fetchOnlineUsers = async() => {
        const token = localStorage.getItem('token');
        if (!token) return;
        
        const response = await fetch(`${API_BASE_URL}/presence/online`, {
            headers: {'Authorization' : `Bearer ${token}`}
        });
        
        if(response.ok){
            const data = await response.json();
            setOnlineUsers(new Set(data));
        }
    };
    fetchOnlineUsers();
  }, []);

  useEffect(() => {
      const activity = () => {
          sendOnline();
          clearTimeout(timer.current);
          timer.current = setTimeout(() => {
              sendOffline();
          },  60 * 1000);
      };

      window.addEventListener("mousemove", activity);
      window.addEventListener("keydown", activity);
      window.addEventListener("click", activity);
      window.addEventListener("scroll", activity);
      window.addEventListener("touchstart", activity);
      window.addEventListener("beforeunload", handleUnload);

      activity();

      return () => {
          window.removeEventListener("mousemove", activity);
          window.removeEventListener("keydown", activity);
          window.removeEventListener("click", activity);
          window.removeEventListener("scroll", activity);
          window.removeEventListener("touchstart", activity);    
          window.removeEventListener("beforeunload", handleUnload);
          clearTimeout(timer.current);
      };
  }, []);

  useEffect(() => {
    if(!token){
      setIsLoggedIn(false);
      return;
    }
    const checkToken = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/users/me`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.status === 403 || response.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('isLoggedIn');
          setIsLoggedIn(false);
        }
      } catch (error) {
        console.error('Token check failed:', error);
      }
    };
    checkToken();
  }, [token]);

  const handleUnload = () => {
      const token = localStorage.getItem("token");
      if (!token || !status.current) return;

      navigator.sendBeacon(
          `${API_BASE_URL}/presence/offline`,
          new Blob([], { type: "application/json" })
      );
  };

  useEffect(() => {
    if (!token || !userId) return;

    const socket = new WebSocket("wss://backend-splitwise.onrender.com/ws");
    const stomp = webstomp.over(socket, {
      debug: false
    });

    stomp.connect({
      userId: userId.toString()
    }, () => {
      setStompClient(stomp);

      stomp.subscribe("/topic/status", (message) => {
        const data = JSON.parse(message.body);
        setOnlineUsers(prev => {
          const users = new Set(prev);
          if (data.online) {
            users.add(data.userId);
          } else {
            users.delete(data.userId);
          }
          return users;
        });
      });
    });

    return () => {
      if (stomp.connected) {
        stomp.disconnect();
      }
    };
  }, [token, userId]);

  const handleLogin = (remember) => {
    setIsLoggedIn(true);
    if (remember) {
      localStorage.setItem('isLoggedIn', 'true');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('isLoggedIn');
    setIsLoggedIn(false);
  };

  const handleNotificationUpdate = () => {
    setRefreshKey(prev => prev + 1); 
    setNotificationRefreshKey(prev => prev + 1);
  };

  const handleFriendUpdate = () => {
    setRefreshKey(prev => prev + 1);
  };

  const navigateTo = (page) => {
    setCurrentPage(page);
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  if (!isLoggedIn) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="h-screen max-h-screen overflow-hidden scrollbar-hide bg-gray-50 dark:bg-gray-900">
      
      <Navbar
        currentPage={currentPage}
        navigateTo={navigateTo}
        onNotificationClick={() => setShowNotification(true)}
        onLogout={handleLogout}
        onFriendUpdate={handleFriendUpdate}
      />

      <div className="h-[calc(100vh-64px)] max-h-[calc(100vh-64px)] overflow-hidden pt-4 pb-20 md:pb-4 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {currentPage === 'home' && <Home 
          refreshKey={refreshKey}
          onlineUsers={onlineUsers} 
        />}
        {currentPage === 'history' && <History />}
      </div>

      {showNotification && (
        <NotificationPage
          onClose={() => {
            setShowNotification(false)
            handleNotificationUpdate();
          }}
          onFriendUpdate={handleFriendUpdate}
          onNotificationUpdate={handleNotificationUpdate}
        />
      )}

      {toast && (
        <ToastNotification message={toast.message} type={toast.type} />
      )}

    </div>
  );
}

export default App;