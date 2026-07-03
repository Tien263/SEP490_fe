import React from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Avatar, AvatarFallback } from '../../components/sales-ui/avatar';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../components/sales-ui/dropdown-menu';
import {
  LayoutDashboard, Bell, LogOut, ChevronDown,
  Search, Settings, Package, ClipboardList
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import WarehouseOrdersPage from './WarehouseOrdersPage';
import WarehouseOrderDetailPage from './WarehouseOrderDetailPage';
import WarehouseReceiptsPage from './WarehouseReceiptsPage';

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
    label: 'Dashboard Kho',
    icon: <LayoutDashboard className="w-4 h-4" />,
    path: '/warehouse/dashboard',
  },
  {
    id: 'orders',
    label: 'Quản lý Đóng gói',
    icon: <Package className="w-4 h-4" />,
    path: '/warehouse/orders',
  },
  {
    id: 'receipts',
    label: 'Nhập nguyên liệu',
    icon: <ClipboardList className="w-4 h-4" />,
    path: '/warehouse/receipts',
  }
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

export default function WarehousePortal() {
  const navigate = useNavigate();
  const { user, logout } = useAuth() as any;
  const totalBadge = 0;

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const userName = user?.fullName || user?.email || 'Nhân viên Kho';
  const initials = userName.split(' ').slice(-2).map((n: string) => n[0]).join('').toUpperCase() || 'KHO';

  return (
    <div className="flex h-screen bg-[#F5F7FA] overflow-hidden">
      {/* Sidebar */}
      <aside className="w-[220px] min-w-[220px] flex flex-col h-full bg-slate-800">
        {/* Logo */}
        <div className="h-12 flex items-center px-4 border-b flex-shrink-0" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 bg-white rounded flex items-center justify-center flex-shrink-0">
              <span className="text-slate-800 font-black text-[10px]">VT</span>
            </div>
            <div>
              <p className="text-white font-semibold text-[13px] leading-tight">Việt Tiến ERP</p>
              <p className="text-white/40 text-[10px] leading-tight">Quản lý Kho</p>
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
              <p className="text-[10px] text-white/45 truncate">Thủ kho</p>
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
          <div className="flex-1 max-w-xs">
            <button className="w-full flex items-center gap-2 px-2.5 h-7 rounded border border-gray-300 bg-gray-50 text-[12px] text-gray-400 hover:bg-white transition-colors text-left">
              <Search className="w-3 h-3 flex-shrink-0" />
              <span className="flex-1 truncate">Tìm kiếm...</span>
            </button>
          </div>

          <div className="flex-1" />

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
                    <AvatarFallback className="text-[9px] font-semibold" style={{ backgroundColor: '#1E293B', color: 'white' }}>
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
            <Route path="orders" element={<WarehouseOrdersPage />} />
            <Route path="orders/:id" element={<WarehouseOrderDetailPage />} />
            <Route path="receipts" element={<WarehouseReceiptsPage />} />
            <Route path="*" element={<div className="p-4">Chào mừng đến với hệ thống quản lý Kho. Vui lòng chọn menu bên trái.</div>} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
