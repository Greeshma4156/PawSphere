import { useEffect, useMemo, useState } from 'react';
import { io } from 'socket.io-client';

let socketSingleton = null;

export const getSocket = () => {
  if (socketSingleton) return socketSingleton;
  const url = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

  try {
    socketSingleton = io(url, { transports: ['websocket'], autoConnect: true });
  } catch (e) {
    console.error('Socket initialization failed:', e);
    socketSingleton = null;
  }

  return socketSingleton;
};

export const useSocketEvents = ({ enabled = true, onEvent, eventNames = [] }) => {
  const socket = useMemo(() => (enabled ? getSocket() : null), [enabled]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!socket) return;

    const handleConnect = () => setConnected(true);
    const handleDisconnect = () => setConnected(false);

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);

    for (const evt of eventNames) {
      socket.on(evt, (payload) => {
        if (onEvent) onEvent(evt, payload);
      });
    }

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      for (const evt of eventNames) {
        socket.off(evt);
      }
    };
  }, [socket, eventNames, onEvent]);

  return { socket, connected };
};

