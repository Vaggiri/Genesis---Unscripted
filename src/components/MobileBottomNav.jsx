import React from 'react';
import { 
  Calendar, 
  Upload, 
  Package, 
  Sparkles, 
  Bell, 
  UserCheck, 
  Laptop, 
  Layers, 
  CheckSquare, 
  BarChart3, 
  Building, 
  Sliders 
} from 'lucide-react';

export default function MobileBottomNav({ 
  role = 'student', 
  activeTab, 
  onSelectTab, 
  unreadNotificationsCount = 0,
  pendingApprovalsCount = 0
}) {
  const getTabsForRole = () => {
    switch (role) {
      case 'student':
        return [
          { id: 'classrooms', label: 'Radar', icon: Calendar },
          { id: 'ai_bot', label: 'AI Voice', icon: Sparkles },
          { id: 'job_upload', label: '3D Jobs', icon: Upload },
          { id: 'inventory', label: 'Stock', icon: Package },
          { id: 'notifications', label: 'Alerts', icon: Bell, badge: unreadNotificationsCount }
        ];

      case 'faculty':
        return [
          { id: 'classrooms', label: 'Radar', icon: Calendar },
          { id: 'approvals', label: 'Approvals', icon: UserCheck, badge: pendingApprovalsCount },
          { id: 'icts', label: 'ICTS Gear', icon: Laptop },
          { id: 'inventory', label: 'Stock', icon: Package },
          { id: 'notifications', label: 'Alerts', icon: Bell, badge: unreadNotificationsCount }
        ];

      case 'lab_incharge':
        return [
          { id: 'queue', label: 'Queue', icon: Layers },
          { id: 'approvals', label: 'Approvals', icon: CheckSquare },
          { id: 'inventory-search', label: 'Drawers', icon: Package },
          { id: 'notifications', label: 'Alerts', icon: Bell, badge: unreadNotificationsCount },
          { id: 'utilization', label: 'Analytics', icon: BarChart3 }
        ];

      case 'admin':
        return [
          { id: 'utilization', label: 'Engine', icon: BarChart3 },
          { id: 'icts', label: 'ICTS Reqs', icon: Laptop },
          { id: 'classrooms', label: 'Rooms', icon: Building },
          { id: 'notifications', label: 'Alerts', icon: Bell, badge: unreadNotificationsCount },
          { id: 'settings', label: 'Settings', icon: Sliders }
        ];

      default:
        return [
          { id: 'classrooms', label: 'Radar', icon: Calendar },
          { id: 'notifications', label: 'Alerts', icon: Bell, badge: unreadNotificationsCount }
        ];
    }
  };

  const tabs = getTabsForRole();

  return (
    <nav className="mobile-bottom-dock" aria-label="Mobile Navigation Dock">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onSelectTab(tab.id)}
            className={`mobile-dock-btn ${isActive ? 'active' : ''}`}
          >
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon size={19} />
              {tab.badge > 0 && (
                <span className="mobile-dock-badge">
                  {tab.badge > 99 ? '99+' : tab.badge}
                </span>
              )}
            </div>
            <span>{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
