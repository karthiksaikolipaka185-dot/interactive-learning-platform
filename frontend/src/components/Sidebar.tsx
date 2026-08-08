import { Home, TrendingUp, MessageSquare, Book, Bookmark, Target, HelpCircle, BarChart3, User, Bot, Zap } from 'lucide-react';
import './Sidebar.css';

interface SidebarProps {
  activeView: string;
  onNavigate: (view: string) => void;
  user?: any;
  onLogout?: () => void;
}

const navItems = [
  { icon: Home, label: 'Home', view: 'home' },
  { icon: Target, label: 'Today\'s Mission', view: 'todays-mission' },
  { icon: Bot, label: 'AI Tutor', view: 'ai-tutor', badge: 'AI' },
  { icon: HelpCircle, label: 'Doubt Zone', view: 'doubt-zone' },
  { icon: Zap, label: 'Quick Revision', view: 'quick-revision' },
  { icon: BarChart3, label: 'Your Growth', view: 'your-growth' },
  { icon: TrendingUp, label: 'My Journey', view: 'journey' },
];

export function Sidebar({ activeView, onNavigate, user, onLogout }: SidebarProps) {
  return (
    <div className="sidebar-container">
      {/* Logo */}
      <div className="sidebar-logo-section">
        <div className="logo-icon">
          <Book size={24} />
        </div>
        <div className="logo-text">
          <div className="logo-title">NIIT ACADEMY</div>
          <div className="logo-subtitle">Mathematics</div>
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="sidebar-nav">
        <div className="nav-section-title">MENU</div>
        {navItems.map((item, index) => (
          <div
            key={index}
            onClick={() => item.view && onNavigate(item.view)}
            className={`nav-item ${activeView === item.view ? 'active' : ''}`}
          >
            <item.icon className="nav-icon" size={20} />
            <span className="nav-label">{item.label}</span>
            {item.badge && (
              <span className="nav-badge">
                {item.badge}
              </span>
            )}
          </div>
        ))}
      </nav>

      {/* User Profile */}
      <div className="sidebar-footer">
        <div className="user-profile-card">
          <div className="user-avatar">
            <User size={20} />
          </div>
          <div className="user-info">
            <div className="user-name">{user?.name || 'Karthik Sai'}</div>
            <div className="user-action" onClick={onLogout}>Log Out</div>
          </div>
        </div>
      </div>
    </div>
  );
}