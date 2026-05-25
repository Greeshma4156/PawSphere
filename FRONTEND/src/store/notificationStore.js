import { create } from 'zustand';

export const useNotificationStore = create((set) => ({
  notifications: [],
  unreadCount: 0,
  
  addNotification: (notification) => set((state) => {
    const newNotif = {
      id: Date.now().toString(),
      read: false,
      timestamp: new Date().toISOString(),
      ...notification,
    };
    return {
      notifications: [newNotif, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    };
  }),

  markAsRead: (id) => set((state) => {
    let decreased = false;
    const updated = state.notifications.map(n => {
      if (n.id === id && !n.read) {
        decreased = true;
        return { ...n, read: true };
      }
      return n;
    });
    return {
      notifications: updated,
      unreadCount: decreased ? state.unreadCount - 1 : state.unreadCount,
    };
  }),

  markAllAsRead: () => set((state) => ({
    notifications: state.notifications.map(n => ({ ...n, read: true })),
    unreadCount: 0,
  })),
  
  clearNotifications: () => set({ notifications: [], unreadCount: 0 }),
}));
