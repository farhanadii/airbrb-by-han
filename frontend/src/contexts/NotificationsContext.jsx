import { createContext, useState, useContext, useEffect, useCallback, useRef } from 'react';
import { getAllBookings, getAllListings } from '../services/api';
import { useAuth } from './AuthContext';

const NotificationsContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useNotifications = () => {
  const context = useContext(NotificationsContext);
  if (!context) throw new Error('useNotifications must be used within NotificationsProvider');
  return context;
};

export const NotificationsProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [lastChecked, setLastChecked] = useState(() => {
    try {
      const saved = localStorage.getItem('notificationsLastChecked');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  const lastCheckedRef = useRef(lastChecked);
  const { isAuthenticated, userEmail } = useAuth();

  // Keep ref in sync with state
  useEffect(() => {
    lastCheckedRef.current = lastChecked;
  }, [lastChecked]);

  const checkForNewNotifications = useCallback(async () => {
    if (!isAuthenticated()) return;

    try {
      const [bookingsData, listingsData] = await Promise.all([
        getAllBookings(),
        getAllListings()
      ]);

      const myListings = listingsData.listings.filter(l => l.owner === userEmail);
      const myListingIds = myListings.map(l => String(l.id)); // Convert to strings for comparison
      const newNotifications = [];

      console.log('=== NOTIFICATION CHECK ===');
      console.log('Current user:', userEmail);
      console.log('My listings:', myListings);
      console.log('My listing IDs:', myListingIds);
      console.log('Total bookings:', bookingsData.bookings.length);

      // Check each booking
      bookingsData.bookings.forEach(booking => {
        const bookingKey = `${booking.id}-${booking.status}`;
        const isMyListing = myListingIds.includes(String(booking.listingId)); // Convert to string for comparison
        const isPending = booking.status === 'pending';

        console.log(`Booking ${booking.id}:`, {
          listingId: booking.listingId,
          status: booking.status,
          owner: booking.owner,
          isMyListing,
          isPending,
          alreadyChecked: !!lastCheckedRef.current[bookingKey]
        });

        // Host notification: new booking request on their listing
        if (isMyListing && isPending) {
          console.log('✓ This is a pending booking on MY listing!');
          if (!lastCheckedRef.current[bookingKey]) {
            const listing = myListings.find(l => String(l.id) === String(booking.listingId));
            console.log('🔔 NEW NOTIFICATION - Creating notification for booking:', bookingKey);
            console.log('Found listing:', listing);
            newNotifications.push({
              id: bookingKey,
              type: 'booking_request',
              message: `New booking request for "${listing?.title || 'your property'}" from ${booking.owner}`,
              bookingId: booking.id,
              listingId: booking.listingId,
              timestamp: new Date()
            });
          } else {
            console.log('Already notified about this booking:', bookingKey);
          }
        }

        // Guest notification: booking accepted or declined
        if (booking.owner === userEmail && (booking.status === 'accepted' || booking.status === 'declined')) {
          if (!lastCheckedRef.current[bookingKey]) {
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

      console.log(`Found ${newNotifications.length} new notifications`);
      if (newNotifications.length > 0) {
        console.log('New notifications:', newNotifications);
        setNotifications(prev => [...newNotifications, ...prev]);
        setUnreadCount(prev => prev + newNotifications.length);

        const newLastChecked = { ...lastCheckedRef.current };
        newNotifications.forEach(notif => {
          newLastChecked[notif.id] = true;
        });
        setLastChecked(newLastChecked);
        localStorage.setItem('notificationsLastChecked', JSON.stringify(newLastChecked));
      }
    } catch (err) {
      console.error('Failed to check notifications:', err);
    }
  }, [isAuthenticated, userEmail]);

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
    console.log('🗑️ Clearing all notifications and resetting tracking');
    setNotifications([]);
    setUnreadCount(0);
    setLastChecked({});
    localStorage.removeItem('notificationsLastChecked');
  };

  const value = {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearNotifications
  };

  // Debug: Log current state
  useEffect(() => {
    console.log('📬 Notification state updated:', {
      count: notifications.length,
      unread: unreadCount,
      notifications: notifications.map(n => ({
        id: n.id,
        type: n.type,
        message: n.message
      }))
    });
  }, [notifications, unreadCount]);

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
};
