import React, { useEffect, useState, useRef } from 'react';
import { Bell, Check, Trash2, X } from 'lucide-react';
import * as signalR from '@microsoft/signalr';
import { useNavigate } from 'react-router-dom';
import { getNotifications, getUnreadCount, markAsRead, markAllAsRead } from '../services/notificationService';

export default function NotificationBell({ role, onViewAll }: { role: string, onViewAll?: () => void }) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const data = await getUnreadCount();
      setUnreadCount(data.unreadCount);
    } catch (err) {
      console.error('Error fetching unread count', err);
    }
  };

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const data = await getNotifications(1, 10);
      setNotifications(data.items || data.Items || []);
    } catch (err) {
      console.error('Error fetching notifications', err);
    } finally {
      setLoading(false);
    }
  };

  // Setup SignalR and initial fetch
  useEffect(() => {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) return;

    fetchUnreadCount();

    const connection = new signalR.HubConnectionBuilder()
      .withUrl('/hubs/notifications', { accessTokenFactory: () => accessToken })
      .withAutomaticReconnect()
      .build();

    connection.on('ReceiveNotification', (notification: any) => {
      setUnreadCount((prev) => prev + 1);
      setNotifications((prev) => [notification, ...prev]);
    });

    connection.start().catch((err) => console.error('NotificationHub connection error:', err));

    return () => {
      connection.stop();
    };
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  const handleMarkAsRead = async (id: number) => {
    try {
      await markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error marking as read', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Error marking all as read', err);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative rounded p-1.5 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute right-0.5 top-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-red-500 text-[8px] font-bold text-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 rounded-lg border border-gray-200 bg-white shadow-lg z-50 overflow-hidden flex flex-col">
          <div className="flex items-center justify-between border-b px-4 py-3 bg-gray-50">
            <h3 className="font-semibold text-gray-800 text-sm">Thông báo</h3>
            <button 
              onClick={handleMarkAllAsRead}
              className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
            >
              <Check className="h-3 w-3" /> Đánh dấu đã đọc
            </button>
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {loading && notifications.length === 0 ? (
              <div className="p-4 text-center text-sm text-gray-500">Đang tải...</div>
            ) : notifications.length === 0 ? (
              <div className="p-4 text-center text-sm text-gray-500">Không có thông báo mới</div>
            ) : (
              <div className="flex flex-col divide-y divide-gray-100">
                {notifications.map((notif) => (
                  <div 
                    key={notif.id} 
                    className={`p-3 transition-colors hover:bg-gray-50 cursor-pointer ${notif.isRead ? 'opacity-70' : 'bg-blue-50/50'}`}
                    onClick={() => !notif.isRead && handleMarkAsRead(notif.id)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className={`text-sm ${notif.isRead ? 'text-gray-700' : 'text-gray-900 font-medium'}`}>
                          {notif.title}
                        </p>
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                          {notif.body}
                        </p>
                        <p className="text-[10px] text-gray-400 mt-1.5">
                          {new Date(notif.createdAt).toLocaleString('vi-VN')}
                        </p>
                      </div>
                      {!notif.isRead && (
                        <div className="w-2 h-2 rounded-full bg-blue-500 mt-1 flex-shrink-0"></div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="border-t p-2 text-center bg-gray-50">
             <button 
               onClick={() => { 
                 setIsOpen(false); 
                 if (onViewAll) onViewAll();
                 else navigate('notifications'); 
               }}
               className="text-xs text-blue-600 hover:underline font-medium"
             >
               Xem tất cả thông báo
             </button>
          </div>
        </div>
      )}
    </div>
  );
}
