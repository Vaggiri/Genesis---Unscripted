import React, { useState, useEffect } from 'react';
import { 
  Laptop, 
  Monitor, 
  Cpu, 
  Tablet, 
  Package, 
  Plus, 
  CheckCircle2, 
  Check, 
  ShieldCheck,
  FileText 
} from 'lucide-react';
import { api } from '../services/api';
import { useNotifications } from '../context/NotificationContext';
import IctsVerificationPassModal from './IctsVerificationPassModal';

function generateAssetTag(category) {
  const catCode = category === 'laptop' ? 'LAP' : category === 'monitor' ? 'MON' : 'AST';
  const randNum = Math.floor(100 + Math.random() * 900);
  return `AMR-ICTS-${catCode}-2026-${randNum}`;
}

function generateSerialNo() {
  return `SN-ICTS-${Math.floor(100000 + Math.random() * 900000)}`;
}

function generateVerificationCode() {
  return `ICTS-PASS-${Math.floor(1000 + Math.random() * 9000)}-VERIFIED`;
}

export default function IctsRequisitionsView({ currentUser, isAdmin = false }) {
  const { addNotification } = useNotifications();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all'); // 'all' | 'pending' | 'approved' | 'issued' | 'rejected'
  
  // Requisition Modal State (for Faculty)
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Admin Approval Modal State
  const [approvingItem, setApprovingItem] = useState(null);
  const [assignedAssetTag, setAssignedAssetTag] = useState('');
  const [assignedSerialNo, setAssignedSerialNo] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [collectionLocation, setCollectionLocation] = useState('ICTS Central Desk, Academic Block 1 Ground Floor (Counter 2)');
  const [rejectingItem, setRejectingItem] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // Selected Pass Modal for viewing verification gate pass
  const [selectedPassRequest, setSelectedPassRequest] = useState(null);

  // New Request Form State
  const [formCategory, setFormCategory] = useState('laptop');
  const [formItemName, setFormItemName] = useState('Apple MacBook Pro 16" M3 Pro (36GB RAM / 512GB SSD)');
  const [formSpecs, setFormSpecs] = useState('Apple M3 Pro, 36GB Unified RAM, 512GB SSD, macOS Sonoma, MATLAB & VLSI EDA bundle');
  const [formPurpose, setFormPurpose] = useState('Research Project development and laboratory course delivery');
  const [formAllocation, setFormAllocation] = useState('Permanent Faculty Allocation');
  const [formOffice, setFormOffice] = useState(currentUser?.office || 'AB-2 Room 304');
  const [formPhone, setFormPhone] = useState('4102');

  const hardwarePresets = [
    {
      category: 'laptop',
      label: 'Apple MacBook Pro 16" (M3 Pro)',
      name: 'Apple MacBook Pro 16" M3 Pro (36GB RAM / 512GB SSD)',
      specs: '12-core CPU, 18-core GPU, Liquid Retina XDR display, 36GB Unified RAM, 512GB SSD, 140W USB-C Charger',
      icon: Laptop
    },
    {
      category: 'laptop',
      label: 'Lenovo ThinkPad P16 Mobile Workstation',
      name: 'Lenovo ThinkPad P16 Gen 2 (Intel Core i9 / RTX 4000)',
      specs: 'Intel Core i9-13980HX, 64GB DDR5 RAM, NVIDIA RTX 4000 Ada 12GB GPU, 1TB NVMe SSD, Windows 11 Pro',
      icon: Laptop
    },
    {
      category: 'monitor',
      label: 'Dell UltraSharp 27" 4K USB-C Hub',
      name: 'Dell UltraSharp 27" 4K USB-C Hub Monitor (U2723QE)',
      specs: '4K UHD (3840 x 2160) IPS Black panel, 90W USB-C Power Delivery, RJ-45 Ethernet, DisplayPort Daisy-chain',
      icon: Monitor
    },
    {
      category: 'workstation',
      label: 'NVIDIA Dual-GPU AI Deep Learning Rig',
      name: 'Amrita AI Compute Rig (Dual NVIDIA RTX 4090 24GB)',
      specs: 'AMD Threadripper PRO 5955WX, 128GB ECC RAM, Dual NVIDIA RTX 4090 (48GB VRAM total), 4TB Gen4 NVMe, Ubuntu LTS',
      icon: Cpu
    },
    {
      category: 'tablet',
      label: 'Apple iPad Pro 12.9" + Apple Pencil',
      name: 'Apple iPad Pro 12.9" M2 (Wi-Fi 256GB) with Apple Pencil 2',
      specs: 'Liquid Retina XDR display, Apple Pencil 2 wireless charging, for live equation annotation & lecture recording',
      icon: Tablet
    }
  ];

  const handleApplyPreset = (preset) => {
    setFormCategory(preset.category);
    setFormItemName(preset.name);
    setFormSpecs(preset.specs);
  };

  const loadRequests = async () => {
    setLoading(true);
    try {
      const data = await api.getIctsRequests();
      setRequests(data || []);
    } catch (err) {
      console.warn('Failed to load ICTS requests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    api.getIctsRequests()
      .then(data => {
        if (mounted) {
          setRequests(data || []);
          setLoading(false);
        }
      })
      .catch(err => {
        console.warn('Failed to load ICTS requests:', err);
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const handleCreateRequest = async (e) => {
    e.preventDefault();
    if (!formItemName.trim()) return;

    setSubmitting(true);
    try {
      const payload = {
        faculty_name: currentUser?.full_name || currentUser?.name || 'Faculty Member',
        emp_id: currentUser?.emp_id || 'AMR-FACULTY',
        department: currentUser?.department || 'Engineering Faculty',
        email: currentUser?.email || 'faculty@cb.amrita.edu',
        phone_extension: formPhone,
        office_room: formOffice,
        item_category: formCategory,
        item_name: formItemName,
        specifications: formSpecs,
        purpose: formPurpose,
        allocation_type: formAllocation
      };

      await api.createIctsRequest(payload);
      setShowRequestModal(false);

      // Notify user
      addNotification({
        title: 'ICTS Requisition Submitted',
        message: `Your request for ${formItemName} has been routed to ICTS Admin for approval.`,
        type: 'request',
        category: 'icts',
        target_roles: ['faculty', 'admin']
      });

      await loadRequests();
    } catch (err) {
      alert(`Submission failed: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleStartApproval = (req) => {
    setApprovingItem(req);
    setAssignedAssetTag(generateAssetTag(req.item_category));
    setAssignedSerialNo(generateSerialNo());
    setAdminNotes('Approved for academic & research use. Handover verified by ICTS Admin.');
  };

  const handleConfirmApproval = async (e) => {
    e.preventDefault();
    if (!approvingItem) return;

    try {
      const verificationCode = generateVerificationCode();
      await api.updateIctsRequest(approvingItem.id, {
        status: 'approved',
        approved_at: new Date().toISOString(),
        approved_by: currentUser?.full_name || 'ICTS Administrator',
        asset_tag: assignedAssetTag,
        serial_number: assignedSerialNo,
        admin_notes: adminNotes,
        verification_code: verificationCode,
        collection_location: collectionLocation
      });

      addNotification({
        title: '🎉 ICTS Requisition Approved!',
        message: `Equipment (${approvingItem.item_name}) has been approved for ${approvingItem.faculty_name}. Gate Pass ${verificationCode} generated.`,
        type: 'approved',
        category: 'icts',
        target_roles: ['faculty', 'admin']
      });

      setApprovingItem(null);
      await loadRequests();
    } catch (err) {
      alert(`Approval update failed: ${err.message}`);
    }
  };

  const handleConfirmRejection = async (e) => {
    e.preventDefault();
    if (!rejectingItem) return;

    try {
      await api.updateIctsRequest(rejectingItem.id, {
        status: 'rejected',
        admin_notes: rejectionReason || 'Requisition declined by ICTS Department.'
      });

      addNotification({
        title: 'ICTS Requisition Notice',
        message: `Requisition for ${rejectingItem.item_name} was declined: ${rejectionReason || 'Allocation limits reached.'}`,
        type: 'rejected',
        category: 'icts',
        target_roles: ['faculty', 'admin']
      });

      setRejectingItem(null);
      await loadRequests();
    } catch (err) {
      alert(`Status update failed: ${err.message}`);
    }
  };

  const handleMarkCollected = async (reqId) => {
    if (!window.confirm('Mark this asset as physically collected & handed over to faculty?')) return;
    try {
      await api.updateIctsRequest(reqId, {
        status: 'issued',
        handed_over_at: new Date().toISOString()
      });
      await loadRequests();
    } catch (err) {
      alert(`Update failed: ${err.message}`);
    }
  };

  // Filter requests based on user role and filter chips
  const displayedRequests = requests.filter(req => {
    if (!isAdmin && req.emp_id && currentUser?.emp_id && req.emp_id !== currentUser.emp_id) {
      // In faculty mode, show their requests (or all demo if emp_id matches)
      // If user is faculty, prioritize matching emp_id or show all faculty requests
    }
    if (filterStatus === 'pending') return req.status === 'pending';
    if (filterStatus === 'approved') return req.status === 'approved';
    if (filterStatus === 'issued') return req.status === 'issued';
    if (filterStatus === 'rejected') return req.status === 'rejected';
    return true;
  });

  const pendingCount = requests.filter(r => r.status === 'pending').length;
  const approvedCount = requests.filter(r => r.status === 'approved').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      
      {/* Top Banner Card */}
      <div className="card-amrita" style={{
        padding: '1.25rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        background: 'linear-gradient(135deg, #ffffff 0%, #fffbfa 100%)',
        borderLeft: '5px solid var(--amrita-maroon)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '12px',
            backgroundColor: 'var(--amrita-maroon-bg)',
            color: 'var(--amrita-maroon)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1.5px solid var(--amrita-maroon-border)',
            flexShrink: 0
          }}>
            <Laptop size={24} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span className="badge badge-maroon" style={{ fontSize: '0.675rem' }}>
                ICTS Department • Amrita University
              </span>
              {pendingCount > 0 && (
                <span className="badge badge-flagged" style={{ fontSize: '0.675rem' }}>
                  {pendingCount} Pending Review
                </span>
              )}
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', margin: '2px 0 0' }}>
              {isAdmin ? 'ICTS Faculty Hardware & Asset Allocation Desk' : 'Faculty ICTS Hardware Requisitions'}
            </h2>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: 0 }}>
              {isAdmin 
                ? 'Review and authorize institutional laptop, monitor, GPU workstation, and digital teaching tablet allocations.'
                : 'Requisition laptops, high-resolution external monitors, and lab computing equipment from Amrita ICTS.'}
            </p>
          </div>
        </div>

        {/* Action Button */}
        {!isAdmin ? (
          <button
            onClick={() => setShowRequestModal(true)}
            className="btn-amrita"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.55rem 1.1rem', fontSize: '0.85rem' }}
          >
            <Plus size={16} />
            <span>Requisition Laptop / Monitor</span>
          </button>
        ) : (
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <ShieldCheck size={14} color="var(--amrita-maroon)" /> Verification Authority Active
            </span>
          </div>
        )}
      </div>

      {/* Filter Tabs */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.5rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
          {[
            { id: 'all', label: `All Requests (${requests.length})` },
            { id: 'pending', label: `Pending Review (${pendingCount})` },
            { id: 'approved', label: `Ready for Pickup (${approvedCount})` },
            { id: 'issued', label: 'Active Issued' },
            { id: 'rejected', label: 'Declined' }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilterStatus(f.id)}
              style={{
                padding: '0.35rem 0.75rem',
                borderRadius: '8px',
                fontSize: '0.75rem',
                fontWeight: 700,
                border: '1px solid',
                cursor: 'pointer',
                backgroundColor: filterStatus === f.id ? 'var(--amrita-maroon)' : '#ffffff',
                borderColor: filterStatus === f.id ? 'var(--amrita-maroon)' : 'var(--border-light)',
                color: filterStatus === f.id ? '#ffffff' : 'var(--text-secondary)',
                transition: 'all 0.15s ease'
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
          Showing {displayedRequests.length} requisitions
        </span>
      </div>

      {/* Requests Grid / Cards */}
      {loading ? (
        <div className="card-amrita" style={{ padding: '2.5rem 1.5rem', textAlign: 'center' }}>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
            Loading ICTS requisitions...
          </p>
        </div>
      ) : displayedRequests.length === 0 ? (
        <div className="card-amrita" style={{ padding: '3rem 1.5rem', textAlign: 'center' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'var(--bg-surface-alt)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem', color: 'var(--text-muted)' }}>
            <Laptop size={22} />
          </div>
          <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 4px' }}>
            No requisitions found in this view
          </h4>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0 }}>
            {!isAdmin 
              ? 'Click "Requisition Laptop / Monitor" above to submit a new equipment allocation request.'
              : 'All faculty ICTS hardware requests have been processed.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '0.85rem' }}>
          {displayedRequests.map((req) => {
            const isApproved = req.status === 'approved';
            const isPending = req.status === 'pending';
            const isIssued = req.status === 'issued';
            const isRejected = req.status === 'rejected';

            const ItemIcon = req.item_category === 'laptop' ? Laptop : req.item_category === 'monitor' ? Monitor : req.item_category === 'tablet' ? Tablet : req.item_category === 'workstation' ? Cpu : Package;

            return (
              <div 
                key={req.id} 
                className="card-amrita" 
                style={{
                  padding: '1.15rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                  borderLeftWidth: '4px',
                  borderLeftColor: isApproved ? '#10b981' : isPending ? '#f59e0b' : isIssued ? '#0284c7' : '#ef4444'
                }}
              >
                {/* Header row */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <div style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '10px',
                      backgroundColor: 'var(--bg-surface-alt)',
                      color: 'var(--amrita-maroon)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <ItemIcon size={20} />
                    </div>
                    <div>
                      <span style={{ fontSize: '0.675rem', textTransform: 'uppercase', fontWeight: 800, color: 'var(--text-muted)' }}>
                        {req.item_category} • {req.allocation_type}
                      </span>
                      <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                        {req.item_name}
                      </h4>
                    </div>
                  </div>

                  <span className={`badge ${
                    isApproved ? 'badge-available' :
                    isPending ? 'badge-flagged' :
                    isIssued ? 'badge-lab' : 'badge-occupied'
                  }`} style={{ fontSize: '0.65rem', textTransform: 'uppercase', fontWeight: 800 }}>
                    {isApproved ? 'Ready for Pickup' : req.status}
                  </span>
                </div>

                {/* Specs and Justification */}
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.45, backgroundColor: 'var(--bg-surface-alt)', padding: '0.65rem 0.75rem', borderRadius: '8px' }}>
                  <div style={{ marginBottom: '4px' }}>
                    <strong>Specs:</strong> {req.specifications || 'Standard Amrita ICTS bundle'}
                  </div>
                  <div>
                    <strong>Purpose:</strong> {req.purpose}
                  </div>
                </div>

                {/* Faculty details (for admin or general info) */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.72rem', color: 'var(--text-muted)', flexWrap: 'wrap', gap: '0.4rem' }}>
                  <div>
                    <strong>{req.faculty_name}</strong> ({req.emp_id}) • {req.department}
                  </div>
                  <div>
                    Cabin: <strong>{req.office_room || 'Academic Block'}</strong>
                  </div>
                </div>

                {/* Approved Gate Pass Details Preview */}
                {isApproved && (
                  <div style={{
                    padding: '0.65rem 0.75rem',
                    borderRadius: '8px',
                    backgroundColor: '#ecfdf5',
                    border: '1px solid #a7f3d0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '0.5rem',
                    fontSize: '0.75rem'
                  }}>
                    <div>
                      <span style={{ color: '#065f46', fontWeight: 700, display: 'block' }}>
                        Pass ID: <code style={{ fontFamily: 'monospace', fontWeight: 800 }}>{req.verification_code}</code>
                      </span>
                      <span style={{ fontSize: '0.68rem', color: '#047857' }}>
                        Asset Tag: <strong>{req.asset_tag}</strong> • Serial: {req.serial_number}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setSelectedPassRequest(req)}
                      className="btn-amrita"
                      style={{ fontSize: '0.72rem', padding: '0.35rem 0.7rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                    >
                      <FileText size={13} />
                      <span>View Gate Pass</span>
                    </button>
                  </div>
                )}

                {/* Rejection Note */}
                {isRejected && req.admin_notes && (
                  <div style={{ fontSize: '0.72rem', color: '#991b1b', backgroundColor: '#fef2f2', padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid #fecaca' }}>
                    <strong>Decline Reason:</strong> {req.admin_notes}
                  </div>
                )}

                {/* Admin Actions Footer */}
                {isAdmin && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.5rem', borderTop: '1px solid var(--border-light)', paddingTop: '0.65rem', marginTop: 'auto' }}>
                    {isPending && (
                      <>
                        <button
                          type="button"
                          onClick={() => setRejectingItem(req)}
                          className="btn-secondary"
                          style={{ fontSize: '0.72rem', padding: '0.35rem 0.65rem', color: '#dc2626' }}
                        >
                          Decline
                        </button>
                        <button
                          type="button"
                          onClick={() => handleStartApproval(req)}
                          className="btn-amrita"
                          style={{ fontSize: '0.72rem', padding: '0.35rem 0.85rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                        >
                          <Check size={13} />
                          <span>Review & Approve</span>
                        </button>
                      </>
                    )}

                    {isApproved && (
                      <button
                        type="button"
                        onClick={() => handleMarkCollected(req.id)}
                        className="btn-secondary"
                        style={{ fontSize: '0.72rem', padding: '0.35rem 0.75rem', color: '#0284c7', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                      >
                        <CheckCircle2 size={13} />
                        <span>Mark Handed Over / Issued</span>
                      </button>
                    )}
                  </div>
                )}

              </div>
            );
          })}
        </div>
      )}

      {/* Modal: New ICTS Requisition (Faculty) */}
      {showRequestModal && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem'
          }}
          onClick={() => setShowRequestModal(false)}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '18px',
              maxWidth: '600px',
              width: '100%',
              maxHeight: '92vh',
              overflowY: 'auto',
              padding: '1.5rem',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Laptop size={20} color="var(--amrita-maroon)" />
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)' }}>
                  ICTS Hardware & Asset Requisition
                </h3>
              </div>
              <button 
                onClick={() => setShowRequestModal(false)}
                style={{ background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                ✕
              </button>
            </div>

            {/* Quick Presets */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                Quick Presets (Click to Auto-Fill Specs)
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.4rem' }}>
                {hardwarePresets.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleApplyPreset(p)}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                      padding: '0.45rem 0.6rem',
                      borderRadius: '8px',
                      backgroundColor: formItemName === p.name ? 'var(--amrita-maroon-bg)' : '#f8fafc',
                      border: `1px solid ${formItemName === p.name ? 'var(--amrita-maroon)' : 'var(--border-light)'}`,
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      color: formItemName === p.name ? 'var(--amrita-maroon)' : 'var(--text-secondary)',
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                  >
                    <span>{p.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleCreateRequest} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.8rem' }}>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: 700, marginBottom: '0.2rem' }}>Hardware Category</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="form-input"
                    style={{ width: '100%' }}
                  >
                    <option value="laptop">Laptop / Mobile Workstation</option>
                    <option value="monitor">External Monitor (4K / 2K)</option>
                    <option value="workstation">Dedicated AI / GPU Rig</option>
                    <option value="tablet">Graphics Tablet / iPad for Lectures</option>
                    <option value="accessories">Docking Station / Peripherals</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontWeight: 700, marginBottom: '0.2rem' }}>Allocation Period</label>
                  <select
                    value={formAllocation}
                    onChange={(e) => setFormAllocation(e.target.value)}
                    className="form-input"
                    style={{ width: '100%' }}
                  >
                    <option value="Permanent Faculty Allocation">Permanent Faculty Allocation</option>
                    <option value="Semester Loan (6 Months)">Semester Loan (6 Months)</option>
                    <option value="Research Project (1 Year)">Research Project (1 Year)</option>
                    <option value="Short Term Loan (30 Days)">Short Term Loan (30 Days)</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 700, marginBottom: '0.2rem' }}>Item Model & Description</label>
                <input
                  type="text"
                  value={formItemName}
                  onChange={(e) => setFormItemName(e.target.value)}
                  placeholder="e.g. Apple MacBook Pro 16-inch M3 Pro / Dell UltraSharp 27"
                  required
                  className="form-input"
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 700, marginBottom: '0.2rem' }}>Technical Specifications Required</label>
                <textarea
                  rows={2}
                  value={formSpecs}
                  onChange={(e) => setFormSpecs(e.target.value)}
                  placeholder="CPU, RAM, GPU, OS, Screen resolution, port requirements..."
                  className="form-textarea"
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 700, marginBottom: '0.2rem' }}>Academic & Research Justification</label>
                <textarea
                  rows={2}
                  value={formPurpose}
                  onChange={(e) => setFormPurpose(e.target.value)}
                  placeholder="e.g. Required for teaching Semester 6 Real-Time Embedded Systems lab and executing AI research grants."
                  required
                  className="form-textarea"
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: 700, marginBottom: '0.2rem' }}>Office / Cabin Room</label>
                  <input
                    type="text"
                    value={formOffice}
                    onChange={(e) => setFormOffice(e.target.value)}
                    placeholder="e.g. AB-2 Room 304"
                    className="form-input"
                    style={{ width: '100%' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: 700, marginBottom: '0.2rem' }}>Intercom Extension</label>
                  <input
                    type="text"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="e.g. 4102"
                    className="form-input"
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setShowRequestModal(false)}
                  className="btn-secondary"
                  style={{ padding: '0.45rem 0.95rem' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-amrita"
                  style={{ padding: '0.45rem 1.25rem', fontWeight: 800 }}
                >
                  {submitting ? 'Submitting...' : 'Submit Requisition to ICTS'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Modal: Admin Approval Desk */}
      {approvingItem && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem'
          }}
          onClick={() => setApprovingItem(null)}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '18px',
              maxWidth: '540px',
              width: '100%',
              padding: '1.5rem',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.75rem' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)' }}>
                  Authorize Asset & Generate Gate Pass
                </h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Beneficiary: <strong>{approvingItem.faculty_name}</strong> ({approvingItem.department})
                </span>
              </div>
              <button 
                onClick={() => setApprovingItem(null)}
                style={{ background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmApproval} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.8rem' }}>
              
              <div>
                <label style={{ display: 'block', fontWeight: 700, marginBottom: '0.2rem' }}>Hardware Being Allocated</label>
                <div style={{ padding: '0.5rem 0.75rem', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid var(--border-light)', fontWeight: 800 }}>
                  {approvingItem.item_name}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: 700, marginBottom: '0.2rem' }}>Assigned Asset Tag</label>
                  <input
                    type="text"
                    value={assignedAssetTag}
                    onChange={(e) => setAssignedAssetTag(e.target.value)}
                    required
                    className="form-input"
                    style={{ width: '100%', fontFamily: 'monospace', fontWeight: 700 }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: 700, marginBottom: '0.2rem' }}>Device Serial Number</label>
                  <input
                    type="text"
                    value={assignedSerialNo}
                    onChange={(e) => setAssignedSerialNo(e.target.value)}
                    required
                    className="form-input"
                    style={{ width: '100%', fontFamily: 'monospace', fontWeight: 700 }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 700, marginBottom: '0.2rem' }}>Collection Location Counter</label>
                <input
                  type="text"
                  value={collectionLocation}
                  onChange={(e) => setCollectionLocation(e.target.value)}
                  className="form-input"
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 700, marginBottom: '0.2rem' }}>ICTS Dispatch / Handover Note</label>
                <textarea
                  rows={2}
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  className="form-textarea"
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setApprovingItem(null)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-amrita"
                  style={{ fontWeight: 800 }}
                >
                  Approve & Issue Gate Pass
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Modal: Admin Rejection */}
      {rejectingItem && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem'
          }}
          onClick={() => setRejectingItem(null)}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              maxWidth: '460px',
              width: '100%',
              padding: '1.25rem',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
            }}
          >
            <h4 style={{ margin: '0 0 8px', fontSize: '1rem', fontWeight: 800, color: '#991b1b' }}>
              Decline Requisition
            </h4>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
              State the reason for declining {rejectingItem.item_name} requested by {rejectingItem.faculty_name}:
            </p>

            <form onSubmit={handleConfirmRejection} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <textarea
                rows={3}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="e.g. Equipment currently out of central stock. Re-apply in upcoming semester grant."
                required
                className="form-textarea"
                style={{ width: '100%', fontSize: '0.8rem' }}
              />

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setRejectingItem(null)}
                  className="btn-secondary"
                  style={{ fontSize: '0.75rem' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    backgroundColor: '#dc2626',
                    color: '#ffffff',
                    border: 'none',
                    padding: '0.45rem 0.95rem',
                    borderRadius: '8px',
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    cursor: 'pointer'
                  }}
                >
                  Confirm Decline
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Digital Verification Gate Pass Modal */}
      <IctsVerificationPassModal
        request={selectedPassRequest}
        isOpen={Boolean(selectedPassRequest)}
        onClose={() => setSelectedPassRequest(null)}
      />

    </div>
  );
}
