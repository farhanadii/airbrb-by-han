import { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { getAllBookings, getAllListings } from '../services/api';
import { useAuth } from './AuthContext';

const NotificationsContext = createContext();

export const useNotifications = () => {
    const context = useContext(NotificationsContext);
    if (!context) throw new Error('useNotifications must be used within NotificationsProvider');
    return context;
};

export const NotificationsProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [lastChecked, setLastChecked] = useState({});
    const { isAuthenticated, userEmail } = useAuth();

    const checkForNewNotifications = useCallback(async () => {
        if (!isAuthenticated()) return;

        try {
            const [bookingsData, listingsData] = await Promise.all([
                getAllBookings(),
                getAllListings()
            ]);

            const myListings = listingsData.listings.filter(l => l.owner === userEmail);
            const myListingIds = myListings.map(l => l.id);
            const newNotifications = [];

            bookingsData.bookings.forEach(booking => {
                const bookingKey = `${booking.id}-${booking.status}`;

                // Host notification: new booking request on their listing
                if (myListingIds.includes(booking.listingId) && booking.status === 'pending') {
                    if (!lastChecked[bookingKey]) {
                        const listing = myListings.find(l => l.id === booking.listingId);
                        newNotifications.push({
                            id: bookingKey,
                            type: 'booking_request',
                            message: `New booking request for "${listing?.title}" from ${booking.owner}`,
                            bookingId: booking.id,
                            listingId: booking.listingId,
                            timestamp: new Date()
                        });
                    }
                }

                // Guest notification: booking accepted or declined
                if (booking.owner === userEmail && (booking.status === 'accepted' || booking.status === 'declined')) {
                    if (!lastChecked[bookingKey]) {
                        newNotifications.push({
                            id: bookingKey,
                            type: booking.status === 'accepted' ? 'booking_accepted' : 'booking_declined',
                            message: `Your booking request was ${booking.status}`,
                            bookingId: booking.id,
                            listingId: booking.listingId,
                            timestamp: new Date()
                        });
                    }
                }
            });

            if (newNotifications.length > 0) {
                setNotifications(prev => [...newNotifications, ...prev]);
                setUnreadCount(prev => prev + newNotifications.length);

                const newLastChecked = { ...lastChecked };
                newNotifications.forEach(notif => {
                    newLastChecked[notif.id] = true;
                });
                setLastChecked(newLastChecked);
            }
        } catch (err) {
            console.error('Failed to check notifications:', err);
        }
    }, [isAuthenticated, userEmail, lastChecked]);

    useEffect(() => {
        if (!isAuthenticated()) return;

        checkForNewNotifications();
        const interval = setInterval(checkForNewNotifications, 5000);

        return () => clearInterval(interval);
    }, [isAuthenticated, checkForNewNotifications]);

    const markAsRead = (notificationId) => {
        setNotifications(prev =>
            prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
    };

    const markAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        setUnreadCount(0);
    };

    const clearNotifications = () => {
        setNotifications([]);
        setUnreadCount(0);
    };

    const value = {
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        clearNotifications
    };

    return (
        <NotificationsContext.Provider value={value}>
            {children}
        </NotificationsContext.Provider>
    );
};
