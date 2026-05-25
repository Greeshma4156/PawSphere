import React, { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useNotificationStore } from '../../store/notificationStore';
import { getSocket } from '../../services/socketService';
import { SOCKET_EVENTS } from '../../shared/socketEvents';

export default function ToastManager() {
  const { notifications, addNotification, markAsRead, clearNotifications } = useNotificationStore();

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleNotification = (data) => {
      addNotification({
        title: data.title || 'Notification',
        message: data.message,
        type: data.type || 'info',
        link: data.rescueId ? `/rescue/${data.rescueId}` : null
      });
    };

    socket.on(SOCKET_EVENTS.NOTIFICATION_CREATED, handleNotification);
    
    return () => {
      socket.off(SOCKET_EVENTS.NOTIFICATION_CREATED, handleNotification);
    };
  }, [addNotification]);

  // Only show the 3 most recent unread notifications as toasts
  const toasts = notifications.filter(n => !n.read).slice(0, 3);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className={`p-4 rounded-2xl shadow-xl backdrop-blur-md border border-lavender/20 w-80 cursor-pointer ${
              toast.type === 'error' ? 'bg-red-500/90 text-white' : 
              toast.type === 'success' ? 'bg-mint/90 text-emerald-800' :
              'bg-white/90 dark:bg-dark/90 text-dark dark:text-cream'
            }`}
            onClick={() => markAsRead(toast.id)}
          >
            <h4 className="font-bold text-sm">{toast.title}</h4>
            <p className="text-xs mt-1 opacity-90">{toast.message}</p>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
