import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Calendar, 
  UserCheck, 
  User, 
  Sparkles, 
  ShoppingCart, 
  Package, 
  Plus, 
  LogOut,
  Bell
} from 'lucide-react';
import FacultyApprovalsView from './FacultyApprovalsView';
import ClassroomOccupancyModule from './ClassroomOccupancyModule';
import LabDirectoryView from './LabDirectoryView';
import VoiceChatBot from './VoiceChatBot';
import InventorySearch from './InventorySearch';
import NotificationsView from './NotificationsView';
import YuktiLogo from './YuktiLogo';
import { useNotifications } from '../context/NotificationContext';
import { api } from '../services/api';

export default function FacultyPortal({ user, simulatedContext, bookings = [], onApprove, onReject, onNewBooking: _onNewBooking, onLogout }) {
  const [activeTab, setActiveTab] = useState('classrooms'); // 'classrooms' | 'approvals' | 'notifications' | 'bot' | 'directory' | 'inventory' | 'orders' | 'profile'
  const { unreadCount } = useNotifications();
  const [purchaseRequests, setPurchaseRequests] = useState([]);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [orderItem, setOrderItem] = useState('');
  const [orderQty, setOrderQty] = useState(10);
  const [orderReason, setOrderReason] = useState('');
  const [submittingOrder, setSubmittingOrder] = useState(false);

  const fullName = user?.full_name || user?.name || 'Faculty Member';
  const empId = user?.emp_id || 'AMR-FACULTY';
  const dept = user?.department || 'Engineering Faculty';

  const loadOrders = async () => {
    try {
      const data = await api.getPurchaseRequests();
      setPurchaseRequests(data || []);
    } catch (err) {
      console.warn('Failed to fetch purchase requests:', err);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    if (!orderItem) return;
    setSubmittingOrder(true);
    try {
      await api.createPurchaseRequest({
        lab_id: 'lab-pcb-eda',
        item: orderItem,
        qty: Number(orderQty),
        reason: orderReason || 'Faculty lab component requisition'
      });
      setShowOrderModal(false);
      setOrderItem('');
      setOrderReason('');
      await loadOrders();
    } catch (err) {
      alert(`Requisition failed: ${err.message}`);
    } finally {
      setSubmittingOrder(false);
    }
  };

  const pendingCount = bookings.filter(b => b.status === 'pending').length;

  const facultyTabs = [
    { id: 'classrooms', label: 'Space Radar & Room Booking', shortLabel: 'Classrooms', icon: Calendar },
    { id: 'approvals', label: 'Student Slot Approvals', shortLabel: 'Approvals', icon: UserCheck, count: pendingCount },
    { id: 'notifications', label: 'Notifications', shortLabel: 'Alerts', icon: Bell, count: unreadCount },
    { id: 'inventory', label: 'Drawer Component Stock', shortLabel: 'Components', icon: Package },
    { id: 'orders', label: 'Order Lab Components', shortLabel: 'Requisitions', icon: ShoppingCart },
    { id: 'bot', label: 'AI Voice Assistant', shortLabel: 'AI Assistant', icon: Sparkles },
    { id: 'directory', label: 'Labs & Resources', shortLabel: 'Labs', icon: Building2 },
    { id: 'profile', label: 'Profile', shortLabel: 'Profile', icon: User }
  ];

  return (
    <div style={{ padding: '1rem 0 3.5rem' }}>

      {/* Faculty Profile Overview Card */}
      <div className="card-amrita" style={{
        padding: '1rem 1.25rem',
        marginBottom: '1rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.85rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <YuktiLogo size={46} style={{ borderRadius: '13px', boxShadow: '0 4px 12px rgba(164, 18, 63, 0.25)' }} />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                {fullName}
              </h2>
              <span className="badge badge-maroon" style={{ fontSize: '0.675rem' }}>
                Faculty Mentor
              </span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Emp ID: <strong>{empId}</strong> • {dept}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => setShowOrderModal(true)}
            className="btn-amrita"
            style={{ fontSize: '0.75rem', padding: '0.4rem 0.85rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
          >
            <Plus size={14} />
            <span>Order Lab Components</span>
          </button>
        </div>
      </div>

      {/* Navigation Tab Bar */}
      <div style={{
        display: 'flex',
        gap: '0.4rem',
        overflowX: 'auto',
        paddingBottom: '0.5rem',
        marginBottom: '1rem',
        borderBottom: '1px solid var(--border-light)'
      }}>
        {facultyTabs.map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.45rem 0.85rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: isActive ? 'var(--amrita-maroon)' : 'var(--bg-surface)',
                color: isActive ? '#ffffff' : 'var(--text-secondary)',
                border: `1px solid ${isActive ? 'var(--amrita-maroon)' : 'var(--border-light)'}`,
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease'
              }}
            >
              <Icon size={15} />
              <span>{t.label}</span>
              {t.count > 0 && (
                <span style={{
                  backgroundColor: isActive ? 'rgba(255,255,255,0.25)' : 'var(--amrita-maroon)',
                  color: '#ffffff',
                  fontSize: '0.65rem',
                  padding: '0.05rem 0.35rem',
                  borderRadius: '10px'
                }}>
                  {t.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Main Tab Panels */}
      {activeTab === 'classrooms' && (
        <ClassroomOccupancyModule
          simulatedContext={simulatedContext}
          user={user}
        />
      )}

      {activeTab === 'approvals' && (
        <FacultyApprovalsView
          currentUser={user}
          bookings={bookings}
          onApprove={onApprove}
          onReject={onReject}
        />
      )}

      {activeTab === 'inventory' && (
        <InventorySearch />
      )}

      {activeTab === 'orders' && (
        <div className="card-amrita p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-amrita-maroon" />
                Laboratory Component Requisitions
              </h3>
              <p className="text-xs text-gray-500">
                Request consumable ICs, sensors, breadboards, or oscilloscope probes for your lab classes.
              </p>
            </div>
            <button
              onClick={() => setShowOrderModal(true)}
              className="btn-amrita px-3.5 py-2 text-xs font-bold flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" /> New Requisition
            </button>
          </div>

          {purchaseRequests.length === 0 ? (
            <div className="p-10 text-center text-gray-400 text-sm">
              No component requisitions submitted. Click "New Requisition" to request components.
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {purchaseRequests.map((pr) => (
                <div key={pr.id} className="py-3 flex items-center justify-between text-sm">
                  <div>
                    <h5 className="font-bold text-gray-900">{pr.item} ({pr.qty} units)</h5>
                    <p className="text-xs text-gray-500">Reason: {pr.reason || 'Laboratory course requirement'}</p>
                  </div>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full uppercase ${
                    pr.status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                    pr.status === 'ordered' ? 'bg-blue-100 text-blue-800' :
                    pr.status === 'rejected' ? 'bg-rose-100 text-rose-800' :
                    'bg-amber-100 text-amber-800'
                  }`}>
                    {pr.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'bot' && (
        <VoiceChatBot
          currentUser={user}
          onBookSlot={() => setActiveTab('classrooms')}
        />
      )}

      {activeTab === 'directory' && (
        <LabDirectoryView />
      )}

      {activeTab === 'notifications' && (
        <NotificationsView />
      )}

      {activeTab === 'profile' && (
        <div className="card-amrita" style={{ padding: '1.5rem', maxWidth: '540px', margin: '0 auto' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '1rem' }}>
            Faculty Profile & Department
          </h3>
          <div style={{ display: 'grid', gap: '0.75rem', fontSize: '0.85rem' }}>
            <div><span style={{ color: 'var(--text-muted)' }}>Full Name:</span> <strong>{fullName}</strong></div>
            <div><span style={{ color: 'var(--text-muted)' }}>Employee ID:</span> <strong>{empId}</strong></div>
            <div><span style={{ color: 'var(--text-muted)' }}>Department:</span> <strong>{dept}</strong></div>
            <div><span style={{ color: 'var(--text-muted)' }}>Designation:</span> <strong>Associate Professor / Mentor</strong></div>
            <div><span style={{ color: 'var(--text-muted)' }}>Role:</span> <strong className="text-amrita-maroon">Faculty Member</strong></div>
          </div>
          <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-light)' }}>
            <button
              onClick={onLogout}
              className="btn-secondary"
              style={{ color: '#b91c1c', border: '1px solid #fee2e2', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
            >
              <LogOut size={14} /> Sign Out of Amrita Yukti
            </button>
          </div>
        </div>
      )}

      {/* Modal: Order Component */}
      {showOrderModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h4 className="font-bold text-gray-900 text-lg">Requisition Components</h4>
              <button
                onClick={() => setShowOrderModal(false)}
                className="text-gray-400 hover:text-gray-600 font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateOrder} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Component / IC</label>
                <input
                  type="text"
                  value={orderItem}
                  onChange={(e) => setOrderItem(e.target.value)}
                  placeholder="e.g. LM741 Op-Amp DIP-8 (Pack of 50)"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amrita-maroon focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Quantity</label>
                <input
                  type="number"
                  min="1"
                  value={orderQty}
                  onChange={(e) => setOrderQty(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amrita-maroon focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Course / Laboratory Context</label>
                <textarea
                  value={orderReason}
                  onChange={(e) => setOrderReason(e.target.value)}
                  placeholder="e.g. Required for B.Tech ECE Sem 4 Analog Circuit Design Laboratory experiments"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amrita-maroon focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowOrderModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-xl text-gray-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingOrder}
                  className="btn-amrita px-4 py-2 font-bold"
                >
                  Submit Requisition
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
