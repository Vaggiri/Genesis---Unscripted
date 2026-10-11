import React from 'react';
import { 
  CheckCircle2, 
  Printer, 
  X, 
  Laptop, 
  Monitor, 
  Cpu, 
  Tablet, 
  Package, 
  ShieldCheck, 
  MapPin, 
  User 
} from 'lucide-react';
import YuktiLogo from './YuktiLogo';

function renderCategoryIcon(cat, size = 24) {
  switch (cat) {
    case 'laptop': return <Laptop size={size} />;
    case 'monitor': return <Monitor size={size} />;
    case 'workstation': return <Cpu size={size} />;
    case 'tablet': return <Tablet size={size} />;
    default: return <Package size={size} />;
  }
}

export default function IctsVerificationPassModal({ request, isOpen, onClose }) {
  if (!isOpen || !request) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs"
      onClick={onClose}
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
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '20px',
          maxWidth: '620px',
          width: '100%',
          maxHeight: '92vh',
          overflowY: 'auto',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.3)',
          border: '1px solid rgba(164, 18, 63, 0.15)',
          position: 'relative'
        }}
      >
        {/* Pass Top Banner */}
        <div style={{
          background: 'linear-gradient(135deg, var(--amrita-maroon) 0%, #700b2b 100%)',
          color: '#ffffff',
          padding: '1.25rem 1.5rem',
          borderTopLeftRadius: '19px',
          borderTopRightRadius: '19px',
          position: 'relative'
        }}>
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '1rem',
              right: '1rem',
              background: 'rgba(255, 255, 255, 0.18)',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              fontWeight: 800
            }}
          >
            <X size={16} />
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <YuktiLogo size={44} style={{ borderRadius: '12px', background: '#ffffff', padding: '2px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }} />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ fontSize: '0.675rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#fde68a' }}>
                  Amrita Vishwa Vidyapeetham • ICTS
                </span>
                <span style={{ fontSize: '0.625rem', padding: '0.1rem 0.4rem', borderRadius: '4px', backgroundColor: 'rgba(255,255,255,0.2)', fontWeight: 700 }}>
                  Official Pass
                </span>
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 900, margin: '2px 0 0', color: '#ffffff' }}>
                Digital Asset Handover Verification Pass
              </h3>
              <p style={{ fontSize: '0.75rem', color: '#fed7aa', margin: 0 }}>
                Information & Communication Technology Services Gate Voucher
              </p>
            </div>
          </div>
        </div>

        {/* Verification Status Ribbon */}
        <div style={{
          backgroundColor: '#ecfdf5',
          borderBottom: '1px solid #a7f3d0',
          padding: '0.65rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.5rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <CheckCircle2 size={18} color="#059669" />
            <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#065f46' }}>
              AUTHENTICATED & READY FOR ISSUE
            </span>
          </div>

          <div style={{
            fontSize: '0.75rem',
            fontFamily: 'monospace',
            fontWeight: 800,
            backgroundColor: '#ffffff',
            padding: '0.2rem 0.6rem',
            borderRadius: '6px',
            border: '1px solid #6ee7b7',
            color: '#047857'
          }}>
            {request.verification_code || 'ICTS-PASS-VERIFIED'}
          </div>
        </div>

        {/* Body Content */}
        <div style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
          
          {/* Equipment Assigned Highlight Card */}
          <div style={{
            padding: '1rem',
            borderRadius: '14px',
            backgroundColor: '#f8fafc',
            border: '1.5px solid var(--border-light)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '1rem'
          }}>
            <div style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              backgroundColor: 'var(--amrita-maroon)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              {renderCategoryIcon(request.item_category, 24)}
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '2px' }}>
                <span className="badge badge-maroon" style={{ fontSize: '0.65rem' }}>
                  {request.item_category?.toUpperCase() || 'HARDWARE'}
                </span>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  {request.allocation_type}
                </span>
              </div>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 4px' }}>
                {request.item_name}
              </h4>
              <p style={{ fontSize: '0.775rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4 }}>
                {request.specifications || 'Standard Amrita ICTS hardware bundle'}
              </p>

              {/* Hardware Serial & Asset Tag Badge */}
              <div style={{
                marginTop: '0.65rem',
                paddingTop: '0.65rem',
                borderTop: '1px dashed var(--border-light)',
                display: 'flex',
                gap: '1rem',
                flexWrap: 'wrap',
                fontSize: '0.75rem'
              }}>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Asset Tag: </span>
                  <strong style={{ fontFamily: 'monospace', color: 'var(--amrita-maroon)' }}>
                    {request.asset_tag || 'AMR-ICTS-2026-TAG'}
                  </strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Serial No: </span>
                  <strong style={{ fontFamily: 'monospace', color: 'var(--text-main)' }}>
                    {request.serial_number || 'SN-VERIFIED-01'}
                  </strong>
                </div>
              </div>
            </div>
          </div>

          {/* Two-Column Details Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '0.85rem'
          }}>
            {/* Faculty Details */}
            <div style={{
              padding: '0.85rem',
              borderRadius: '10px',
              backgroundColor: '#ffffff',
              border: '1px solid var(--border-light)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.45rem',
              fontSize: '0.78rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--amrita-maroon)', fontWeight: 800, fontSize: '0.8rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.35rem' }}>
                <User size={14} /> Faculty Beneficiary
              </div>
              <div><span style={{ color: 'var(--text-muted)' }}>Name:</span> <strong>{request.faculty_name}</strong></div>
              <div><span style={{ color: 'var(--text-muted)' }}>Emp ID:</span> <strong>{request.emp_id}</strong></div>
              <div><span style={{ color: 'var(--text-muted)' }}>Dept:</span> {request.department}</div>
              <div><span style={{ color: 'var(--text-muted)' }}>Cabin / Office:</span> {request.office_room || 'Academic Block'}</div>
            </div>

            {/* ICTS Counter Pickup Details */}
            <div style={{
              padding: '0.85rem',
              borderRadius: '10px',
              backgroundColor: '#fffbeb',
              border: '1px solid #fde68a',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.45rem',
              fontSize: '0.78rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#b45309', fontWeight: 800, fontSize: '0.8rem', borderBottom: '1px solid #fef3c7', paddingBottom: '0.35rem' }}>
                <MapPin size={14} /> Handover & Collection Location
              </div>
              <div>
                <strong style={{ color: '#92400e' }}>
                  {request.collection_location || 'ICTS Central Desk, Academic Block 1 Ground Floor (Counter 2)'}
                </strong>
              </div>
              <div style={{ color: '#78350f', fontSize: '0.72rem', lineHeight: 1.35 }}>
                Present your Amrita Faculty ID Card & this digital voucher code to the ICTS Store Manager on duty for immediate physical handover.
              </div>
            </div>
          </div>

          {/* Mock Barcode / Security Stamp */}
          <div style={{
            padding: '0.75rem',
            borderRadius: '10px',
            backgroundColor: '#f1f5f9',
            border: '1px solid var(--border-light)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.75rem'
          }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.675rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                Digital Gate Pass Barcode
              </span>
              <div style={{
                fontFamily: 'monospace',
                fontSize: '1.1rem',
                letterSpacing: '4px',
                fontWeight: 900,
                color: '#1e293b'
              }}>
                ||| | |||| || | ||| |||| |
              </div>
              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                REF: {request.id}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', backgroundColor: '#ffffff', padding: '0.35rem 0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
              <ShieldCheck size={18} color="var(--amrita-maroon)" />
              <div style={{ fontSize: '0.7rem', lineHeight: 1.2 }}>
                <strong style={{ color: 'var(--amrita-maroon)', display: 'block' }}>Digitally Certified</strong>
                <span style={{ color: 'var(--text-muted)' }}>Amrita University ICTS</span>
              </div>
            </div>
          </div>

        </div>

        {/* Modal Footer Controls */}
        <div style={{
          padding: '0.85rem 1.5rem',
          borderTop: '1px solid var(--border-light)',
          backgroundColor: '#fafafa',
          borderBottomLeftRadius: '19px',
          borderBottomRightRadius: '19px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.5rem'
        }}>
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary"
            style={{ fontSize: '0.8rem', padding: '0.45rem 0.95rem' }}
          >
            Close
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="btn-amrita"
            style={{ fontSize: '0.8rem', padding: '0.45rem 1rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
          >
            <Printer size={15} />
            <span>Print / Save Gate Pass</span>
          </button>
        </div>

      </div>
    </div>
  );
}
