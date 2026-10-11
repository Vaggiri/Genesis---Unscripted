import React, { useState } from 'react';
import { 
  Bell, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Info, 
  CheckCheck, 
  Trash2, 
  Clock, 
  Sparkles,
  Filter
} from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';

export default function NotificationsView() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearAll } = useNotifications();
  const [filterType, setFilterType] = useState('all'); // 'all' | 'unread' | 'approved' | 'alerts'

  const formatTimeAgo = (ts) => {
    if (!ts) return 'Just now';
    const diffMs = Date.now() - new Date(ts).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  const getStatusIcon = (type) => {
    switch (type) {
      case 'approved':
        return <CheckCircle2 size={18} className="text-emerald" />;
      case 'rejected':
        return <XCircle size={18} className="text-rose" />;
      case 'new_request':
        return <Bell size={18} className="text-maroon" />;
      case 'conflict':
        return <AlertTriangle size={18} className="text-amber" />;
      default:
        return <Info size={18} className="text-indigo" />;
    }
  };

  const getStatusBadgeClass = (type) => {
    switch (type) {
      case 'approved':
        return 'badge-available';
      case 'rejected':
        return 'badge-occupied';
      case 'new_request':
        return 'badge-maroon';
      case 'conflict':
        return 'badge-flagged';
      default:
        return 'badge-lab';
    }
  };

  const filteredNotifications = notifications.filter(n => {
    if (filterType === 'unread') return !n.read;
    if (filterType === 'approved') return n.type === 'approved';
    if (filterType === 'alerts') return n.type === 'conflict' || n.type === 'rejected' || n.type === 'new_request';
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Notifications Header Banner */}
      <div className="card-amrita p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-amrita-maroon text-white flex items-center justify-center shrink-0 shadow-sm" style={{ backgroundColor: 'var(--amrita-maroon)' }}>
            <Bell size={22} color="#ffffff" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-gray-900" style={{ margin: 0, fontSize: '1.2rem' }}>
                Notification & Activity Radar
              </h2>
              {unreadCount > 0 ? (
                <span className="badge badge-maroon font-bold text-xs">
                  {unreadCount} Unread
                </span>
              ) : (
                <span className="badge badge-available text-xs">
                  All Caught Up
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Real-time campus updates for machine bookings, drawer stock, and space radar alerts
            </p>
          </div>
        </div>

        {/* Global Bulk Actions */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={markAllAsRead}
              className="btn-secondary"
              style={{ padding: '0.45rem 0.85rem', minHeight: '38px', fontSize: '0.8rem', gap: '0.35rem' }}
              title="Mark all notifications as read"
            >
              <CheckCheck size={15} color="var(--amrita-maroon)" />
              <span>Mark All Read</span>
            </button>
          )}

          {notifications.length > 0 && (
            <button
              type="button"
              onClick={clearAll}
              className="btn-secondary"
              style={{ padding: '0.45rem 0.85rem', minHeight: '38px', fontSize: '0.8rem', gap: '0.35rem', color: '#b91c1c' }}
              title="Clear all notifications"
            >
              <Trash2 size={14} color="#b91c1c" />
              <span>Clear History</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Chips Bar */}
      <div className="card-amrita p-3 flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider pl-1 pr-1 flex items-center gap-1">
            <Filter size={12} /> Filter:
          </span>
          {[
            { id: 'all', label: `All (${notifications.length})` },
            { id: 'unread', label: `Unread (${unreadCount})` },
            { id: 'approved', label: 'Confirmed / Approved' },
            { id: 'alerts', label: 'Requests & Warnings' }
          ].map(f => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilterType(f.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                filterType === f.id
                  ? 'bg-amrita-maroon text-white shadow-2xs'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
              style={{
                cursor: 'pointer',
                backgroundColor: filterType === f.id ? 'var(--amrita-maroon)' : '#ffffff',
                color: filterType === f.id ? '#ffffff' : 'var(--text-secondary)'
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        <span className="text-xs text-gray-400 hide-mobile">
          Live Supabase Postgres Sync
        </span>
      </div>

      {/* Notifications List */}
      {filteredNotifications.length === 0 ? (
        <div className="card-amrita p-12 text-center space-y-3">
          <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mx-auto text-gray-400">
            <Sparkles size={26} color="var(--text-muted)" />
          </div>
          <h4 className="font-bold text-gray-800 text-base" style={{ margin: 0 }}>
            No notifications in this view
          </h4>
          <p className="text-xs text-gray-500 max-w-md mx-auto">
            Whenever new work orders are uploaded, machine slots booked, or rooms flagged, your notifications will arrive here live.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredNotifications.map(item => (
            <div
              key={item.id}
              onClick={() => markAsRead(item.id)}
              className="card-amrita p-4 transition flex items-start justify-between gap-3 cursor-pointer"
              style={{
                backgroundColor: item.read ? '#ffffff' : '#fffbfa',
                borderColor: item.read ? 'var(--border-light)' : 'var(--amrita-maroon-border)',
                borderLeftWidth: item.read ? '1px' : '4px',
                borderLeftColor: item.read ? 'var(--border-light)' : 'var(--amrita-maroon)',
                boxShadow: item.read ? 'var(--shadow-xs)' : '0 2px 8px rgba(164, 18, 63, 0.08)'
              }}
            >
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5" style={{ backgroundColor: 'var(--bg-surface-alt)' }}>
                  {getStatusIcon(item.type)}
                </div>

                <div className="space-y-1 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`badge ${getStatusBadgeClass(item.type)} text-[10px] uppercase font-bold tracking-wider`}>
                      {item.type.replace('_', ' ')}
                    </span>
                    <h4 className="font-bold text-gray-900 text-sm leading-snug" style={{ margin: 0 }}>
                      {item.title}
                    </h4>
                    {!item.read && (
                      <span className="w-2 h-2 rounded-full bg-amrita-maroon shrink-0" style={{ backgroundColor: 'var(--amrita-maroon)' }} title="Unread" />
                    )}
                  </div>

                  <p className="text-xs text-gray-600 leading-relaxed" style={{ margin: 0 }}>
                    {item.message}
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-end gap-2 shrink-0">
                <span className="text-[11px] font-medium text-gray-400 flex items-center gap-1 whitespace-nowrap">
                  <Clock size={11} /> {formatTimeAgo(item.timestamp)}
                </span>
                {!item.read && (
                  <span className="text-[10px] font-semibold text-amrita-maroon" style={{ color: 'var(--amrita-maroon)' }}>
                    Click to mark read
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
