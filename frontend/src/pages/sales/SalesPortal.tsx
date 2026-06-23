import React from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Avatar, AvatarFallback } from '../../components/sales-ui/avatar';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../components/sales-ui/dropdown-menu';
import {
  LayoutDashboard, MessageSquare, Bell, LogOut, ChevronDown,
  Search, Settings, ShoppingCart
} from 'lucide-react';
import SalesDashboardPage from './SalesDashboardPage';
import SalesNegotiationPage from './SalesNegotiationPage';
import DirectPurchasePage from './DirectPurchasePage';
import { useAuth } from '../../context/AuthContext';

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
  badge?: number;
}

const NAV_ITEMS: NavItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: <LayoutDashboard className="w-4 h-4" />,
    path: '/sales/dashboard',
  },
  {
    id: 'negotiation',
    label: 'Báo giá & Đàm phán giá',
    icon: <MessageSquare className="w-4 h-4" />,
    path: '/sales/negotiation',
    badge: 3,
  },
  {
    id: 'direct-purchase',
    label: 'Mua hàng trực tiếp',
    icon: <ShoppingCart className="w-4 h-4" />,
    path: '/sales/direct-purchase',
  },
];

function NavItemRow({ item, onNavigate }: { item: NavItem; onNavigate: (path: string) => void }) {
  const location = useLocation();
  const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');

  return (
    <button
      onClick={() => onNavigate(item.path)}
      className={[
        'w-full flex items-center gap-2 px-2.5 py-1.5 rounded text-left transition-colors text-[12px] font-medium group',
        isActive
          ? 'bg-white/15 text-white'
          : 'text-white/55 hover:bg-white/8 hover:text-white/80',
      ].join(' ')}
    >
      <span className={`flex-shrink-0 ${isActive ? 'text-white' : 'text-white/45 group-hover:text-white/70'}`}>
        {item.icon}
      </span>
      <span className="flex-1 truncate">{item.label}</span>
      {item.badge && item.badge > 0 && (
        <span className="text-[9px] px-1.5 py-0.5 rounded bg-red-500 text-white font-semibold flex-shrink-0">
          {item.badge}
        </span>
      )}
    </button>
  );
}

export default function SalesPortal() {
  const navigate = useNavigate();
  const { user, logout } = useAuth() as any;
  const totalBadge = 5;

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const userName = user?.fullName || user?.email || 'Nhân viên Sales';
  const initials = userName.split(' ').slice(-2).map((n: string) => n[0]).join('').toUpperCase() || 'NV';

  return (
    <div className="flex h-screen bg-[#F5F7FA] overflow-hidden">
      {/* Sidebar */}
      <aside className="w-[220px] min-w-[220px] flex flex-col h-full" style={{ backgroundColor: '#1F3B64' }}>
        {/* Logo */}
        <div className="h-12 flex items-center px-4 border-b flex-shrink-0" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 bg-white rounded flex items-center justify-center flex-shrink-0">
              <span className="text-[#1F3B64] font-black text-[10px]">VT</span>
            </div>
            <div>
              <p className="text-white font-semibold text-[13px] leading-tight">Việt Tiến ERP</p>
              <p className="text-white/40 text-[10px] leading-tight">Nhân viên bán hàng</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-1.5 py-2 space-y-px">
          {NAV_ITEMS.map(item => (
            <NavItemRow key={item.id} item={item} onNavigate={navigate} />
          ))}
        </nav>

        {/* User info */}
        <div className="p-2.5 flex-shrink-0" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="flex items-center gap-2 px-1">
            <Avatar className="w-7 h-7 flex-shrink-0">
              <AvatarFallback className="text-[10px] font-semibold" style={{ backgroundColor: 'rgba(255,255,255,0.15)', color: 'white' }}>
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-semibold text-white truncate">{userName}</p>
              <p className="text-[10px] text-white/45 truncate">NV Bán Hàng</p>
            </div>
            <button onClick={handleLogout} className="text-white/30 hover:text-red-400 transition-colors flex-shrink-0" title="Đăng xuất">
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-11 bg-white border-b border-gray-200 flex items-center px-4 gap-3 flex-shrink-0">
          {/* Search */}
          <div className="flex-1 max-w-xs">
            <button className="w-full flex items-center gap-2 px-2.5 h-7 rounded border border-gray-300 bg-gray-50 text-[12px] text-gray-400 hover:bg-white transition-colors text-left">
              <Search className="w-3 h-3 flex-shrink-0" />
              <span className="flex-1 truncate">Tìm kiếm...</span>
            </button>
          </div>

          <div className="flex-1" />

          {/* Actions */}
          <div className="flex items-center gap-0.5">
            <button
              className="relative p-1.5 rounded text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
            >
              <Bell className="w-4 h-4" />
              {totalBadge > 0 && (
                <span className="absolute top-0.5 right-0.5 w-3.5 h-3.5 bg-red-500 text-white text-[8px] rounded-full flex items-center justify-center font-bold">
                  {totalBadge}
                </span>
              )}
            </button>
            <button className="p-1.5 rounded text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors">
              <Settings className="w-4 h-4" />
            </button>

            <div className="w-px h-5 bg-gray-200 mx-1" />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-1.5 px-2 py-1 rounded hover:bg-gray-100 transition-colors">
                  <Avatar className="w-6 h-6">
                    <AvatarFallback className="text-[9px] font-semibold" style={{ backgroundColor: '#1F3B64', color: 'white' }}>
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-[12px] font-medium text-gray-700">{userName.split(' ').pop()}</span>
                  <ChevronDown className="w-3 h-3 text-gray-400" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem className="text-sm text-red-600 cursor-pointer" onClick={handleLogout}>
                  <LogOut className="w-4 h-4 mr-2" /> Đăng xuất
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <Routes>
            <Route path="dashboard" element={<SalesDashboardPage />} />
            <Route path="negotiation" element={<SalesNegotiationPage />} />
            <Route path="direct-purchase" element={<DirectPurchasePage />} />
            <Route path="*" element={<SalesDashboardPage />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
