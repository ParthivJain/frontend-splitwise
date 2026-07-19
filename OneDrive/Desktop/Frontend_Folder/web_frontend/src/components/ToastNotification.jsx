const ToastNotification = ({ message, type }) => {
  const colors = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    warning: 'bg-yellow-500'
  };

  return (
    <div className={`fixed top-4 right-4 z-50 ${colors[type] || 'bg-blue-500'} text-white px-4 py-2 rounded-lg shadow-lg`}>
      {message}
    </div>
  );
};

export default ToastNotification;