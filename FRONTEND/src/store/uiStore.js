import { create } from 'zustand'

export const useUIStore = create((set) => ({
  user: JSON.parse(localStorage.getItem('pawsphere_user') || 'null'),
  token: localStorage.getItem('pawsphere_token') || null,
  theme: localStorage.getItem('pawsphere_theme') || 'light',
  isOnline: navigator.onLine,
  notifications: [],
  activeChat: null,
  isSOSActive: false,
  flags: {
    ENABLE_AI: true,
    ENABLE_OFFLINE_MODE: true,
    ENABLE_PUSH_NOTIFICATIONS: true,
    ENABLE_ESCALATION: true,
  },

  setUser: (user, token) => {
    if (user && token) {
      localStorage.setItem('pawsphere_user', JSON.stringify(user));
      localStorage.setItem('pawsphere_token', token);
      set({ user, token });
    } else {
      localStorage.removeItem('pawsphere_user');
      localStorage.removeItem('pawsphere_token');
      set({ user: null, token: null });
    }
  },

  toggleTheme: () => set((state) => {
    const nextTheme = state.theme === 'light' ? 'dark' : 'light';
    localStorage.setItem('pawsphere_theme', nextTheme);
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }
    return { theme: nextTheme };
  }),

  setOnlineStatus: (status) => set({ isOnline: status }),

  addNotification: (notification) => set((state) => ({
    notifications: [
      { id: Date.now(), timestamp: new Date(), read: false, ...notification },
      ...state.notifications
    ]
  })),

  markNotificationsRead: () => set((state) => ({
    notifications: state.notifications.map(n => ({ ...n, read: true }))
  })),

  clearNotifications: () => set({ notifications: [] }),

  setActiveChat: (chatPartner) => set({ activeChat: chatPartner }),

  toggleSOS: () => set((state) => ({ isSOSActive: !state.isSOSActive })),
  setSOSActive: (active) => set({ isSOSActive: active }),
}));
