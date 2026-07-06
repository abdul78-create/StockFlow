import * as React from 'react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  entityType?: string;
  entityId?: string;
  isRead: boolean;
  createdAt: string;
}

export function useNotifications() {
  const [notifications, setNotifications] = React.useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = React.useState(0);
  const [isLoading, setIsLoading] = React.useState(false);
  const { isAuthenticated } = useAuthStore();

  const fetchNotifications = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const [notifRes, countRes] = await Promise.all([
        api.get('/notifications?limit=20'),
        api.get('/notifications/unread-count'),
      ]);
      setNotifications(notifRes.data.data);
      setUnreadCount(countRes.data.data.count);
    } catch {
      // silent
    } finally {
      setIsLoading(false);
    }
  }, []);

  const markRead = async (id: string) => {
    await api.put(`/notifications/${id}/read`);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllRead = async () => {
    await api.put('/notifications/mark-all-read');
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    setUnreadCount(0);
  };

  // SSE connection for real-time updates — uses cookies (withCredentials)
  React.useEffect(() => {
    if (!isAuthenticated) return;
    fetchNotifications();

    let es: EventSource | null = null;
    const connectSSE = () => {
      // SSE uses credentials (cookie) automatically via withCredentials
      const baseUrl = (import.meta.env.VITE_API_BASE_URL as string | undefined) || 'http://localhost:3000';
      es = new EventSource(`${baseUrl}/api/v1/events`, { withCredentials: true });

      es.onmessage = (e) => {
        if (!e.data) return;
        try {
          const notification = JSON.parse(e.data) as Notification;
          setNotifications(prev => [notification, ...prev].slice(0, 20));
          if (!notification.isRead) setUnreadCount(prev => prev + 1);
        } catch {
          // keepalive or malformed data
        }
      };

      es.onerror = () => {
        es?.close();
        // Reconnect after 5s
        setTimeout(connectSSE, 5000);
      };
    };

    connectSSE();
    return () => es?.close();
  }, [isAuthenticated, fetchNotifications]);

  return { notifications, unreadCount, isLoading, markRead, markAllRead, refetch: fetchNotifications };
}
