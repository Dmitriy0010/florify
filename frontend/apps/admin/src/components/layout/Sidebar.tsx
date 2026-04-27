import { useState, useEffect } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { 
  LayoutDashboard, 
  ShoppingBag, 
  ClipboardList, 
  Package, 
  Users, 
  Users2, 
  Wallet, 
  LineChart, 
  ChevronLeft, 
  ChevronRight,
  Flower2,
  ChevronDown,
  Store,
  CalendarDays,
  Settings,
  Mail,
  FileText,
  Truck,
  Building2
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/store/useAuthStore'

interface NavItem {
  name: string
  icon: any
  path: string
  children?: { name: string; path: string }[]
}

const navItems: { group: string; items: NavItem[] }[] = [
  {
    group: 'Операции',
    items: [
      { name: 'Обзор смены', icon: LayoutDashboard, path: '/admin/dashboard' },
      { name: 'Точки продаж', icon: Store, path: '/admin/pos-points' },
      { name: 'Касса (POS)', icon: ShoppingBag, path: '/admin/pos' },
      { name: 'Заказы', icon: ClipboardList, path: '/admin/orders' },
      { 
        name: 'Логистика', 
        icon: Truck, 
        path: '/admin/couriers',
        children: [
          { name: 'Активные задачи', path: '/admin/couriers' },
          { name: 'Слоты доставки', path: '/admin/delivery-slots' },
          { name: 'Зоны доставки', path: '/admin/delivery-zones' },
        ]
      },
      { name: 'Рабочие смены', icon: CalendarDays, path: '/admin/shifts' },
    ]
  },
  {
    group: 'Ресурсы',
    items: [
      { 
        name: 'Склад', 
        icon: Package, 
        path: '/admin/inventory',
        children: [
          { name: 'Остатки', path: '/admin/inventory/stock' },
          { name: 'Закупки и Снабжение', path: '/admin/invoices' },
          { name: 'Инвентаризация', path: '/admin/inventory/count' },
          { name: 'Списания', path: '/admin/inventory/write-off' },
        ]
      },
      { 
        name: 'Каталог', 
        icon: Flower2, 
        path: '/admin/catalog',
        children: [
          { name: 'Товары', path: '/admin/products' },
          { name: 'Категории', path: '/admin/categories' },
        ]
      },
      { name: 'Поставщики', icon: Building2, path: '/admin/suppliers' },
    ]
  },
  {
    group: 'CRM и Команда',
    items: [
      { name: 'Клиенты', icon: Users, path: '/admin/customers' },
      { 
        name: 'Команда', 
        icon: Users2, 
        path: '/admin/employees',
        children: [
          { name: 'Список', path: '/admin/employees' },
          { name: 'График работы', path: '/admin/employees/schedule' },
          { name: 'Зарплаты', path: '/admin/salaries' },
        ]
      },
      { name: 'Программа лояльности', icon: Settings, path: '/admin/loyalty' },
    ]
  },
  {
    group: 'Бизнес',
    items: [
      { name: 'Финансовый учёт', icon: Wallet, path: '/admin/finance' },
      { name: 'Аналитика', icon: LineChart, path: '/admin/analytics' },
      { name: 'Рассылки', icon: Mail, path: '/admin/marketing' },
      { name: 'Отчёты', icon: FileText, path: '/admin/reports' },
    ]
  }
]

export function Sidebar() {
  const { user } = useAuthStore()
  const location = useLocation()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [openMenus, setOpenMenus] = useState<string[]>([])

  // Automatically open category if current path matches a child
  useEffect(() => {
    const activeGroups = navItems.flatMap(g => g.items)
      .filter(item => item.children?.some(child => location.pathname.startsWith(child.path)))
      .map(item => item.name);
    
    if (activeGroups.length > 0) {
      setOpenMenus(prev => Array.from(new Set([...prev, ...activeGroups])));
    }
  }, [location.pathname]);

  const isParentActive = (item: NavItem) => {
    if (!item.children) return false;
    return item.children.some(child => location.pathname.startsWith(child.path));
  };

  const toggleMenu = (name: string) => {
    setOpenMenus(prev => 
      prev.includes(name) ? prev.filter(m => m !== name) : [...prev, name]
    )
  }

  return (
    <aside 
      className={cn(
        "flex flex-col h-screen bg-[#1F2128] border-r border-white/5 transition-all duration-300 relative z-20 text-white",
        isCollapsed ? "w-20" : "w-[280px]"
      )}
    >
      {/* Logo Area */}
      <div className="h-20 flex items-center px-6 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 w-10 h-10 bg-[var(--color-brand)] rounded-2xl flex items-center justify-center text-white shadow-lg shadow-[var(--color-brand)]/20 rotate-3 transition-transform">
            <Flower2 className="h-6 w-6" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col">
              <span className="font-heading font-black text-xl tracking-tighter leading-none">florify</span>
              <span className="text-[10px] font-bold text-[var(--color-brand)] uppercase tracking-widest mt-1">Workspace</span>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-8 scrollbar-hide">
        {navItems.map((group) => (
          <div key={group.group} className="space-y-1.5">
            {!isCollapsed && (
              <p className="px-4 mb-2 text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">{group.group}</p>
            )}
            
            {group.items.map((item) => (
              <div key={item.path} className="space-y-1">
                <div 
                  className={cn(
                    "flex items-center justify-between group cursor-pointer",
                    isCollapsed ? "justify-center" : ""
                  )}
                >
                   <NavLink
                    to={item.children ? '#' : item.path}
                    onClick={item.children ? (e) => { e.preventDefault(); toggleMenu(item.name); } : undefined}
                    className={({ isActive }) => {
                      const isTrulyActive = item.children ? isParentActive(item) : isActive;
                      return cn(
                        "flex-1 flex items-center gap-3 px-4 py-3 rounded-xl transition-all relative overflow-hidden",
                        isTrulyActive
                          ? "bg-[var(--color-brand)] text-white shadow-lg shadow-[var(--color-brand)]/20" 
                          : "text-white/60 hover:text-white hover:bg-white/5"
                      );
                    }}
                  >
                    <item.icon className={cn(
                      "h-5 w-5 flex-shrink-0 transition-transform group-hover:scale-110",
                      isCollapsed ? "mx-auto" : ""
                    )} />
                    {!isCollapsed && (
                      <span className="text-sm font-bold truncate">{item.name}</span>
                    )}
                  </NavLink>
                  
                  {!isCollapsed && item.children && (
                    <button 
                      onClick={() => toggleMenu(item.name)}
                      className={cn(
                        "p-2 text-white/30 hover:text-white transition-transform",
                        openMenus.includes(item.name) ? "rotate-180" : ""
                      )}
                    >
                      <ChevronDown className="h-4 w-4" />
                    </button>
                  )}
                </div>

                {/* Children / Sub-items */}
                {!isCollapsed && item.children && openMenus.includes(item.name) && (
                  <div className="ml-9 space-y-1 pt-1 animate-in slide-in-from-top-2 duration-200">
                    {item.children.map(child => (
                      <NavLink
                        key={child.path}
                        to={child.path}
                        className={({ isActive }) => cn(
                          "block py-2 text-xs font-bold transition-colors",
                          isActive ? "text-[var(--color-brand)]" : "text-white/40 hover:text-white/70"
                        )}
                      >
                        {child.name}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        ))}
      </nav>

      {/* Bottom Profile / Settings */}
      <div className="p-4 border-t border-white/5">
        {!isCollapsed && (
          <div className="bg-white/5 p-4 rounded-2xl border border-white/5 mb-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-[var(--color-brand)] flex items-center justify-center text-white font-black text-xs">
                {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-black truncate">{user?.firstName} {user?.lastName?.charAt(0)}.</span>
                <div className="flex items-center gap-1.5 mt-0.5">
                   <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                   <span className="text-[10px] text-green-500 font-bold uppercase tracking-wider">{user?.roles?.[0] || 'Member'}</span>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-full h-11 flex items-center justify-center rounded-xl bg-white/5 text-white/40 hover:text-white hover:bg-white/10 transition-all border border-white/5"
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>
    </aside>
  )
}
