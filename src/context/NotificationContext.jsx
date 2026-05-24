import { createContext, useContext, useState, useCallback } from "react";

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = useCallback((notification) => {
    const id = Date.now();
    setNotifications(prev => [...prev, { ...notification, id }]);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const success = useCallback((message) => {
    addNotification({ type: "success", message });
  }, [addNotification]);

  const error = useCallback((message) => {
    addNotification({ type: "error", message });
  }, [addNotification]);

  const info = useCallback((message) => {
    addNotification({ type: "info", message });
  }, [addNotification]);

  const warning = useCallback((message) => {
    addNotification({ type: "warning", message });
  }, [addNotification]);

  return (
    <NotificationContext.Provider value={{
      notifications,
      addNotification,
      removeNotification,
      success,
      error,
      info,
      warning
    }}>
      {children}
    </NotificationContext.Provider>
  );
};
