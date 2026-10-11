import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';

const NotificationContext = createContext(null);

const DEFAULT_NOTIFICATIONS = {
  student: [
    {
      id: 'notif-s1',
      title: '✅ Machine Booking Confirmed',
      message: 'Your slot for Bambu Lab X1-Carbon Combo (Floor 1, Digital Fab Hub) has been approved.',
      type: 'approved',
      timestamp: Date.now() - 15 * 60 * 1000,
      read: false
    },
    {
      id: 'notif-s2',
      title: '📦 Drawer Component Restock',
      message: '10k Ohm 1/4W Metal Film Resistors replenished (120 units available in Drawer D-04).',
      type: 'info',
      timestamp: Date.now() - 2 * 3600 * 1000,
      read: false
    },
    {
      id: 'notif-s3',
      title: '🖨️ Work Order Sliced',
      message: 'Quadcopter Arm Bracket v2 3D mesh volume verified (~42g PLA, estimated 55 mins).',
      type: 'new_request',
      timestamp: Date.now() - 5 * 3600 * 1000,
      read: true
    }
  ],
  faculty: [
    {
      id: 'notif-f1',
      title: '🔔 New Lab Booking Request',
      message: 'Adithya K. requested FabLab Workstation for IoT Sensor Node prototyping.',
      type: 'new_request',
      timestamp: Date.now() - 10 * 60 * 1000,
      read: false
    },
    {
      id: 'notif-f2',
      title: '⚠️ Classroom Space Radar Conflict',
      message: 'Classroom AB1-102 flagged for unannounced room takeover during scheduled lecture.',
      type: 'conflict',
      timestamp: Date.now() - 45 * 60 * 1000,
      read: false
    },
    {
      id: 'notif-f3',
      title: '✅ Timetable Reservation Synced',
      message: 'B.Tech CSE Semester 4 elective lab slot verified across the central campus radar.',
      type: 'approved',
      timestamp: Date.now() - 4 * 3600 * 1000,
      read: true
    }
  ],
  lab_incharge: [
    {
      id: 'notif-l1',
      title: '🛠️ New 3D / PCB Job in Queue',
      message: 'New CAD geometry uploaded for Prusa MK4 High-Speed CoreXY. Review required.',
      type: 'new_request',
      timestamp: Date.now() - 8 * 60 * 1000,
      read: false
    },
    {
      id: 'notif-l2',
      title: '⚠️ Low Component Stock Warning',
      message: 'ESP32-WROOM-32D Development Boards down to 3 units in Drawer Bin 02.',
      type: 'conflict',
      timestamp: Date.now() - 1 * 3600 * 1000,
      read: false
    },
    {
      id: 'notif-l3',
      title: '✅ Machine Maintenance Complete',
      message: 'Boss Laser CO2 65W Precision Cutter optical calibration routine passed.',
      type: 'info',
      timestamp: Date.now() - 6 * 3600 * 1000,
      read: true
    }
  ],
  admin: [
    {
      id: 'notif-a1',
      title: '🛡️ Realtime Security Policy Audit',
      message: 'Row Level Security policy enforcement verified on facility_bookings table.',
      type: 'info',
      timestamp: Date.now() - 20 * 60 * 1000,
      read: false
    },
    {
      id: 'notif-a2',
      title: '✅ Crowd Report Resolved',
      message: 'Room conflict report for AB2-204 resolved by department coordinator.',
      type: 'approved',
      timestamp: Date.now() - 2 * 3600 * 1000,
      read: false
    },
    {
      id: 'notif-a3',
      title: '📢 System Broadcast Active',
      message: 'Even Semester 2026 Space Radar threshold configured at 2 crowd flags.',
      type: 'info',
      timestamp: Date.now() - 12 * 3600 * 1000,
      read: true
    }
  ]
};

export function NotificationProvider({ children }) {
  const { user, role } = useAuth();
  const currentRole = role || 'student';
  const storageKey = `amrita_yukti_notifications_${user?.id || currentRole}`;

  const [notifications, setNotifications] = useState(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return DEFAULT_NOTIFICATIONS[currentRole] || DEFAULT_NOTIFICATIONS.student;
  });

  // Re-load notifications if user or role changes
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        setNotifications(JSON.parse(saved));
        return;
      }
    } catch {
      // fallback
    }
    setNotifications(DEFAULT_NOTIFICATIONS[currentRole] || DEFAULT_NOTIFICATIONS.student);
  }, [storageKey, currentRole]);

  // Persist notifications on change
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(notifications));
    } catch {
      // ignore storage full
    }
  }, [notifications, storageKey]);

  const addNotification = useCallback((item) => {
    const newNotif = {
      id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      title: item.title || 'Campus Notification',
      message: item.message || '',
      type: item.type || 'info', // 'approved' | 'rejected' | 'new_request' | 'conflict' | 'info'
      timestamp: Date.now(),
      read: false
    };

    setNotifications(prev => [newNotif, ...prev]);
  }, []);

  const markAsRead = useCallback((id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        clearAll
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return ctx;
}
