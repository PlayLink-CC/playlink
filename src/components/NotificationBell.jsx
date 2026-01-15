import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check, Info, AlertTriangle, MessageCircle } from 'lucide-react';

const NotificationBell = () => {
    const [notifications, setNotifications] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const fetchNotifications = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/notifications`, {
                credentials: 'include',
            });
            if (res.ok) {
                const data = await res.json();
                setNotifications(data);
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };

    useEffect(() => {
        fetchNotifications();
        // Refresh notifications every minute
        const interval = setInterval(fetchNotifications, 60000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const markAsRead = async (id) => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/notifications/${id}/read`, {
                method: 'PUT',
                credentials: 'include',
            });
            if (res.ok) {
                setNotifications(prev => prev.map(n => n.notification_id === id ? { ...n, is_read: 1 } : n));
            }
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/notifications/all-read`, {
                method: 'PUT',
                credentials: 'include',
            });
            if (res.ok) {
                setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 })));
            }
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };

    const unreadCount = notifications.filter(n => !n.is_read).length;

    const getIcon = (type) => {
        switch (type) {
            case 'NEW_COMPETITOR': return <AlertTriangle className="text-amber-500" size={18} />;
            case 'BOOKING_ALERT': return <Info className="text-blue-500" size={18} />;
            default: return <MessageCircle className="text-gray-500" size={18} />;
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition"
            >
                <Bell size={24} />
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white">
                        {unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 max-h-[480px] overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black ring-opacity-5 z-50 flex flex-col">
                    <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                        <h3 className="font-bold text-gray-900">Notifications</h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllAsRead}
                                className="text-xs text-green-600 font-semibold hover:text-green-700 transition"
                            >
                                Mark all as read
                            </button>
                        )}
                    </div>

                    <div className="overflow-y-auto flex-1">
                        {notifications.length === 0 ? (
                            <div className="p-8 text-center">
                                <Bell className="mx-auto text-gray-200 mb-2" size={32} />
                                <p className="text-gray-500 text-sm">No notifications yet.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-50">
                                {notifications.map((n) => (
                                    <div
                                        key={n.notification_id}
                                        onClick={() => !n.is_read && markAsRead(n.notification_id)}
                                        className={`p-4 hover:bg-gray-50 cursor-pointer transition flex gap-3 ${!n.is_read ? 'bg-green-50/30' : ''}`}
                                    >
                                        <div className="mt-1 flex-shrink-0">
                                            {getIcon(n.type)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-sm ${!n.is_read ? 'text-gray-900 font-semibold' : 'text-gray-600'}`}>
                                                {n.message}
                                            </p>
                                            <p className="text-[10px] text-gray-400 mt-1">
                                                {new Date(n.created_at).toLocaleString()}
                                            </p>
                                        </div>
                                        {!n.is_read && (
                                            <div className="w-2 h-2 rounded-full bg-green-500 mt-2 flex-shrink-0"></div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {notifications.length > 0 && (
                        <div className="p-3 border-t border-gray-100 bg-gray-50/50 text-center">
                            <p className="text-xs text-gray-400">Showing latest notifications</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
