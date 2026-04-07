import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, FolderKanban, Calendar, MessageSquare, 
  Settings, LogOut, Menu, X, Terminal, ChevronRight 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/admin/projects', label: 'Proyectos', icon: FolderKanban },
  { path: '/admin/appointments', label: 'Citas', icon: Calendar },
  { path: '/admin/messages', label: 'Mensajes', icon: MessageSquare },
  { path: '/admin/settings', label: 'Configuración', icon: Settings },
];

export default function AdminLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    await logout();
    navigate('/admin');
  };

  const currentPage = navItems.find(item => item.path === location.pathname)?.label || 'Dashboard';

  return (
    <div className="min-h-screen bg-[#0A0A0A]" data-testid="admin-layout">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed top-0 left-0 h-full w-64 bg-[#141414] border-r border-[#262626] z-50 transform transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        data-testid="admin-sidebar"
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-[#262626]">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 flex items-center justify-center border border-[#262626]">
              <Terminal className="w-4 h-4 text-[#FF2A00]" />
            </div>
            <span className="font-bold text-sm">Daniel.Ortega</span>
          </Link>
          <button 
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-[#A3A3A3] hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors ${
                  isActive 
                    ? 'bg-[#FF2A00]/10 text-[#FF2A00] border-l-2 border-[#FF2A00]' 
                    : 'text-[#A3A3A3] hover:text-white hover:bg-[#1C1C1C]'
                }`}
                data-testid={`admin-nav-${item.label.toLowerCase()}`}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User Info & Logout */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-[#262626]">
          <div className="flex items-center gap-3 px-4 py-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-[#FF2A00] flex items-center justify-center text-white font-bold text-sm">
              {user?.name?.charAt(0) || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.name || 'Admin'}</p>
              <p className="text-xs text-[#525252] truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 text-sm font-medium text-[#A3A3A3] hover:text-[#FF2A00] hover:bg-[#1C1C1C] transition-colors"
            data-testid="admin-logout-button"
          >
            <LogOut className="w-5 h-5" />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Top Bar */}
        <header className="h-16 bg-[#141414] border-b border-[#262626] flex items-center justify-between px-4 lg:px-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-[#A3A3A3] hover:text-white"
              data-testid="admin-menu-toggle"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-[#525252]">Admin</span>
              <ChevronRight className="w-4 h-4 text-[#525252]" />
              <span className="text-white font-medium">{currentPage}</span>
            </div>
          </div>
          <Link 
            to="/" 
            className="text-sm text-[#A3A3A3] hover:text-[#FF2A00] transition-colors"
            target="_blank"
          >
            Ver Sitio →
          </Link>
        </header>

        {/* Page Content */}
        <main className="p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
