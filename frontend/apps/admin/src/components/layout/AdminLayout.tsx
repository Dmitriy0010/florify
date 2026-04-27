import { useAuthStore } from '../../store/useAuthStore'
import { useNavigate, Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { StoreSwitcher } from './StoreSwitcher'
import { useDashboardStore } from '../../store/useDashboardStore'
import { Search, Bell, User, X } from 'lucide-react'

export function AdminLayout() {
  const { user, logout } = useAuthStore()
  const { globalSearchTerm, setGlobalSearchTerm } = useDashboardStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }
  return (
    <div className="flex h-screen overflow-hidden bg-[#FBFBF9]">
      <Sidebar />
      
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* TopBar - More Compact */}
        <header className="h-16 flex-shrink-0 bg-white border-b border-neutral-100 flex items-center justify-between px-8 relative z-10 transition-all">
          <div className="flex items-center gap-6 flex-1">
            <StoreSwitcher />
            
            <div className="h-6 w-px bg-neutral-100 hidden lg:block" />

            <div className="relative w-full max-w-md group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-300 group-focus-within:text-[var(--color-brand)] transition-colors" />
              <input 
                type="text" 
                placeholder="Поиск..." 
                value={globalSearchTerm}
                onChange={(e) => setGlobalSearchTerm(e.target.value)}
                className="w-full h-9 pl-11 pr-10 bg-neutral-50 border-transparent rounded-lg text-xs font-medium focus:bg-white focus:border-neutral-200 transition-all outline-none"
              />
              {globalSearchTerm && (
                <button 
                  onClick={() => setGlobalSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-300 hover:text-neutral-600"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-5">
            <button className="h-9 w-9 flex items-center justify-center rounded-lg text-neutral-300 hover:text-neutral-900 hover:bg-neutral-50 transition-all relative group">
              <Bell className="h-4 w-4" />
              <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-[var(--color-brand)] rounded-full border-2 border-white group-hover:scale-125 transition-transform"></span>
            </button>
            
            <div className="h-6 w-px bg-neutral-100"></div>
            
            <div className="flex items-center gap-3 pl-1 cursor-pointer group relative">
              <div className="text-right hidden sm:flex flex-col">
                <p className="text-xs font-bold text-neutral-900 leading-none group-hover:text-[var(--color-brand)] transition-colors">
                  {user?.firstName} {user?.lastName?.charAt(0)}.
                </p>
                <p className="text-[9px] font-black text-[var(--color-brand)] uppercase tracking-wider mt-1 opacity-60">
                  {user?.roles?.[0] || 'Member'}
                </p>
              </div>
              <button 
                onClick={handleLogout}
                className="h-9 w-9 rounded-lg bg-neutral-50 flex items-center justify-center text-neutral-400 border border-neutral-100 hover:bg-neutral-900 hover:text-white hover:border-neutral-900 transition-all shadow-sm group"
                title="Выйти"
              >
                <User className="h-4 w-4" />
              </button>
            </div>
          </div>
        </header>

        {/* Main Content Area - Reduced Padding */}
        <main className="flex-1 overflow-y-auto p-8 scrollbar-hide">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
