import React, { useState, useEffect } from 'react';
import { Layers, Package, CheckSquare, BarChart3, ShoppingCart, Plus, CheckCircle2 } from 'lucide-react';
import JobQueue from './JobQueue';
import InventoryUpload from './InventoryUpload';
import InventorySearch from './InventorySearch';
import FacultyApprovalsView from './FacultyApprovalsView';
import UtilizationDashboard from './UtilizationDashboard';
import { api } from '../services/api';

export default function LabInchargePortal({ currentUser, onBookSlot: _onBookSlot }) {
  const [activeTab, setActiveTab] = useState('queue');
  const [purchaseRequests, setPurchaseRequests] = useState([]);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [orderItem, setOrderItem] = useState('');
  const [orderQty, setOrderQty] = useState(5);
  const [orderReason, setOrderReason] = useState('');
  const [submittingOrder, setSubmittingOrder] = useState(false);

  useEffect(() => {
    loadPurchaseRequests();
  }, []);

  const loadPurchaseRequests = async () => {
    try {
      const data = await api.getPurchaseRequests();
      setPurchaseRequests(data || []);
    } catch (err) {
      console.warn('Failed to fetch purchase requests:', err);
    }
  };

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    if (!orderItem) return;
    setSubmittingOrder(true);

    try {
      await api.createPurchaseRequest({
        lab_id: 'lab-fablab',
        item: orderItem,
        qty: Number(orderQty),
        reason: orderReason
      });
      setShowOrderModal(false);
      setOrderItem('');
      setOrderReason('');
      await loadPurchaseRequests();
    } catch (err) {
      alert(`Order request failed: ${err.message}`);
    } finally {
      setSubmittingOrder(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Workshop Manager Header */}
      <div className="card-amrita p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="badge-amrita text-xs font-bold uppercase tracking-wider mb-1 inline-block">
            Workshop Manager / Lab In-Charge Desk
          </span>
          <h2 className="text-2xl font-black text-gray-900">
            Digital Fabrication & Prototyping Bay Control
          </h2>
          <p className="text-sm text-gray-500">
            Welcome, {currentUser?.full_name || 'Lab In-Charge'}. Manage machine job queues, verify drawer audits, and approve workstation allocations.
          </p>
        </div>

        <button
          onClick={() => setShowOrderModal(true)}
          className="btn-amrita px-4 py-2 text-sm flex items-center gap-2 font-bold shrink-0 shadow-sm"
        >
          <Plus className="w-4 h-4" /> Order Raw Materials
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-gray-200 overflow-x-auto gap-2">
        <button
          onClick={() => setActiveTab('queue')}
          className={`px-4 py-2.5 font-bold text-sm border-b-2 flex items-center gap-2 whitespace-nowrap transition ${
            activeTab === 'queue'
              ? 'border-amrita-maroon text-amrita-maroon'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          <Layers className="w-4 h-4" /> Work Order Queue
        </button>

        <button
          onClick={() => setActiveTab('approvals')}
          className={`px-4 py-2.5 font-bold text-sm border-b-2 flex items-center gap-2 whitespace-nowrap transition ${
            activeTab === 'approvals'
              ? 'border-amrita-maroon text-amrita-maroon'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          <CheckSquare className="w-4 h-4" /> Slot Approvals
        </button>

        <button
          onClick={() => setActiveTab('inventory-upload')}
          className={`px-4 py-2.5 font-bold text-sm border-b-2 flex items-center gap-2 whitespace-nowrap transition ${
            activeTab === 'inventory-upload'
              ? 'border-amrita-maroon text-amrita-maroon'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          <Package className="w-4 h-4" /> CSV Inventory Intake
        </button>

        <button
          onClick={() => setActiveTab('inventory-search')}
          className={`px-4 py-2.5 font-bold text-sm border-b-2 flex items-center gap-2 whitespace-nowrap transition ${
            activeTab === 'inventory-search'
              ? 'border-amrita-maroon text-amrita-maroon'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          <Package className="w-4 h-4" /> Drawer Stock Radar
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-2.5 font-bold text-sm border-b-2 flex items-center gap-2 whitespace-nowrap transition ${
            activeTab === 'orders'
              ? 'border-amrita-maroon text-amrita-maroon'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          <ShoppingCart className="w-4 h-4" /> Purchase Requests
        </button>

        <button
          onClick={() => setActiveTab('utilization')}
          className={`px-4 py-2.5 font-bold text-sm border-b-2 flex items-center gap-2 whitespace-nowrap transition ${
            activeTab === 'utilization'
              ? 'border-amrita-maroon text-amrita-maroon'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          <BarChart3 className="w-4 h-4" /> Machine Analytics
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === 'queue' && (
        <JobQueue onOpenPurchaseRequest={() => setShowOrderModal(true)} />
      )}

      {activeTab === 'approvals' && (
        <FacultyApprovalsView currentUser={currentUser} />
      )}

      {activeTab === 'inventory-upload' && (
        <InventoryUpload onImportSuccess={loadPurchaseRequests} />
      )}

      {activeTab === 'inventory-search' && (
        <InventorySearch />
      )}

      {activeTab === 'orders' && (
        <div className="card-amrita p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-amrita-maroon" />
              Consumable Material & Component Orders
            </h3>
            <button
              onClick={() => setShowOrderModal(true)}
              className="btn-amrita px-3 py-1.5 text-xs font-bold flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" /> New Requisition
            </button>
          </div>

          {purchaseRequests.length === 0 ? (
            <div className="p-10 text-center text-gray-400 text-sm">
              No pending purchase requisitions. Click "New Requisition" to order filament or tools.
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {purchaseRequests.map((pr) => (
                <div key={pr.id} className="py-3 flex items-center justify-between text-sm">
                  <div>
                    <h5 className="font-bold text-gray-900">{pr.item} ({pr.qty} units)</h5>
                    <p className="text-xs text-gray-500">Reason: {pr.reason || 'Restocking component drawers'}</p>
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

      {activeTab === 'utilization' && (
        <UtilizationDashboard />
      )}

      {/* Modal: New Purchase Request */}
      {showOrderModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h4 className="font-bold text-gray-900 text-lg">Requisition Material</h4>
              <button
                onClick={() => setShowOrderModal(false)}
                className="text-gray-400 hover:text-gray-600 font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateOrder} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Item / Consumable</label>
                <input
                  type="text"
                  value={orderItem}
                  onChange={(e) => setOrderItem(e.target.value)}
                  placeholder="e.g. Polymaker PLA Black 1kg spools"
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
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Reason / Project Context</label>
                <textarea
                  value={orderReason}
                  onChange={(e) => setOrderReason(e.target.value)}
                  placeholder="e.g. Critical stock depletion for IEEE Autonomous Drone hackathon intake"
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
