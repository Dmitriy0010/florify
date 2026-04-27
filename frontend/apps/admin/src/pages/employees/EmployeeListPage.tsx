import { useState, useMemo } from 'react'
import { 
  Users, 
  Search, 
  Plus, 
  Loader2, 
  Phone, 
  UserCircle,
  Wallet2,
  MoreVertical,
  Briefcase,
  Building2,
  Filter,
  X,
  UserMinus,
  UserCheck,
  Pencil,
  ChevronRight,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  ArrowUpRight
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { EmployeeService, Employee } from '@/lib/api'
import { EmployeeFormModal } from '@/components/employees/EmployeeFormModal'
import { SalaryConfigModal } from '@/components/employees/SalaryConfigModal'
import { EmployeeDetailModal } from '@/components/employees/EmployeeDetailModal'
import { useDashboardStore } from '@/store/useDashboardStore'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { format, parseISO } from 'date-fns'
import { ru } from 'date-fns/locale'

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────
const ROLES = [
  { id: 'FLORIST',  name: 'Флорист',       color: 'bg-violet-50 text-violet-700 border-violet-100' },
  { id: 'CASHIER',  name: 'Кассир',         color: 'bg-sky-50 text-sky-700 border-sky-100' },
  { id: 'ADMIN',    name: 'Администратор',   color: 'bg-amber-50 text-amber-700 border-amber-100' },
  { id: 'MANAGER',  name: 'Менеджер',        color: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
  { id: 'OWNER',    name: 'Владелец',        color: 'bg-neutral-900 text-white border-neutral-800' },
  { id: 'COURIER',  name: 'Курьер',          color: 'bg-orange-50 text-orange-700 border-orange-100' },
]

const getRoleConfig = (role?: string) =>
  ROLES.find(r => r.id === role?.toUpperCase()) ?? { id: 'default', name: role ?? '—', color: 'bg-neutral-50 text-neutral-500 border-neutral-200' }

// ─────────────────────────────────────────────────────────────────────────────
// Confirm dismiss dialog
// ─────────────────────────────────────────────────────────────────────────────
function DismissConfirmDialog({ 
  employee, 
  onConfirm, 
  onCancel, 
  isLoading 
}: { 
  employee: Employee
  onConfirm: () => void
  onCancel: () => void
  isLoading: boolean
}) {
  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white rounded-3xl shadow-2xl p-8 w-full max-w-sm animate-in zoom-in-95 duration-200 border border-neutral-200">
        <div className="flex items-start gap-4 mb-6">
          <div className="h-12 w-12 rounded-2xl bg-red-50 flex items-center justify-center flex-shrink-0">
            <UserMinus size={22} className="text-red-500" />
          </div>
          <div>
            <h3 className="text-lg font-black text-neutral-900 tracking-tight">Уволить сотрудника?</h3>
            <p className="text-sm font-bold text-neutral-400 mt-1">
              {employee.firstName} {employee.lastName} будет переведён в неактивные. Данные сохранятся.
            </p>
          </div>
        </div>
        <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl mb-6">
          <div className="flex items-start gap-3">
            <AlertTriangle size={16} className="text-amber-500 flex-shrink-0 mt-0.5" />
            <p className="text-[11px] font-bold text-amber-700">
              Сотрудник потеряет доступ к системе. Это действие можно отменить через редактирование профиля.
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 h-12 bg-neutral-50 border border-neutral-200 text-neutral-500 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-neutral-100 transition-all"
          >
            Отмена
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 h-12 bg-red-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2 active:scale-95 shadow-lg shadow-red-500/20"
          >
            {isLoading ? <Loader2 size={16} className="animate-spin" /> : <UserMinus size={16} />}
            Уволить
          </button>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Row context menu
// ─────────────────────────────────────────────────────────────────────────────
function RowMenu({ 
  employee, 
  onEdit, 
  onSalary, 
  onDismiss,
  onReactivate
}: { 
  employee: Employee
  onEdit: () => void
  onSalary: () => void
  onDismiss: () => void
  onReactivate: () => void
}) {
  const [open, setOpen] = useState(false)

  return (
    <div className="relative">
      <button
        onClick={e => { e.stopPropagation(); setOpen(!open) }}
        className="h-8 w-8 rounded-lg flex items-center justify-center text-neutral-300 hover:text-neutral-900 hover:bg-neutral-100 transition-all"
      >
        <MoreVertical size={16} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-10 z-50 bg-white rounded-2xl shadow-2xl border border-neutral-100 py-2 w-52 animate-in zoom-in-95 slide-in-from-top-2 duration-150 origin-top-right">
            <button
              onClick={e => { e.stopPropagation(); setOpen(false); onEdit() }}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-neutral-700 hover:bg-neutral-50 transition-colors text-left"
            >
              <Pencil size={15} className="text-neutral-400" /> Редактировать
            </button>
            <button
              onClick={e => { e.stopPropagation(); setOpen(false); onSalary() }}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-neutral-700 hover:bg-neutral-50 transition-colors text-left"
            >
              <Wallet2 size={15} className="text-neutral-400" /> Настроить тариф
            </button>
            <div className="h-px bg-neutral-50 my-1 mx-3" />
            {employee.active ? (
              <button
                onClick={e => { e.stopPropagation(); setOpen(false); onDismiss() }}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-50 transition-colors text-left"
              >
                <UserMinus size={15} /> Уволить
              </button>
            ) : (
              <button
                onClick={e => { e.stopPropagation(); setOpen(false); onReactivate() }}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-emerald-600 hover:bg-emerald-50 transition-colors text-left"
              >
                <UserCheck size={15} /> Восстановить
              </button>
            )}
          </div>
        </>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────────────────────
export default function EmployeeListPage() {
  const queryClient = useQueryClient()
  const { stores } = useDashboardStore()

  const [searchQuery, setSearchQuery] = useState('')
  const [filterRole, setFilterRole] = useState('')
  const [filterStore, setFilterStore] = useState('')
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('active')

  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editEmployee, setEditEmployee] = useState<Employee | null>(null)
  const [salaryEmployee, setSalaryEmployee] = useState<Employee | null>(null)
  const [detailEmployee, setDetailEmployee] = useState<Employee | null>(null)
  const [dismissTarget, setDismissTarget] = useState<Employee | null>(null)

  // ── Data ─────────────────────────────────────────────────────────────────
  const { data: rawData, isLoading } = useQuery({
    queryKey: ['employees-list'],
    queryFn: () => EmployeeService.getAll().then(res => {
      const d = res.data as any
      return (d.data || d.content || d || []) as Employee[]
    })
  })
  const employees = rawData || []

  // ── Dismiss mutation ─────────────────────────────────────────────────────
  const dismissMutation = useMutation({
    mutationFn: (emp: Employee) => EmployeeService.dismiss(emp),
    onSuccess: () => {
      toast.success('Сотрудник уволен')
      queryClient.invalidateQueries({ queryKey: ['employees-list'] })
      setDismissTarget(null)
    },
    onError: (e: any) => toast.error('Ошибка: ' + (e.response?.data?.message || e.message))
  })

  const reactivateMutation = useMutation({
    mutationFn: (emp: Employee) => EmployeeService.update(emp.id!, {
      storeId: emp.storeId,
      firstName: emp.firstName,
      lastName: emp.lastName,
      phone: emp.phone,
      role: emp.role,
      active: true,
      avatarUrl: emp.avatarUrl,
    }),
    onSuccess: () => {
      toast.success('Сотрудник восстановлен')
      queryClient.invalidateQueries({ queryKey: ['employees-list'] })
    },
    onError: (e: any) => toast.error('Ошибка: ' + (e.response?.data?.message || e.message))
  })

  // ── Filtered list ─────────────────────────────────────────────────────────
  const filtered = useMemo(() => employees.filter(e => {
    const name = `${e.firstName} ${e.lastName} ${e.phone || ''}`.toLowerCase()
    const matchSearch = !searchQuery || name.includes(searchQuery.toLowerCase())
    const matchRole = !filterRole || e.role === filterRole
    const matchStore = !filterStore || e.storeId === filterStore
    const matchActive =
      filterActive === 'all' ? true :
      filterActive === 'active' ? !!e.active :
      !e.active
    return matchSearch && matchRole && matchStore && matchActive
  }), [employees, searchQuery, filterRole, filterStore, filterActive])

  // ── Aggregates ────────────────────────────────────────────────────────────
  const activeCount = employees.filter(e => e.active).length
  const inactiveCount = employees.filter(e => !e.active).length
  const roleBreakdown = ROLES.map(r => ({
    ...r,
    count: employees.filter(e => e.role === r.id && e.active).length
  })).filter(r => r.count > 0)

  const getStoreName = (id?: string) => stores.find(s => s.id === id)?.name || '—'

  const hasFilters = searchQuery || filterRole || filterStore

  return (
    <div className="flex flex-col h-screen bg-[#F7F8FA] overflow-hidden">

      {/* ── Top bar ─────────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-neutral-100 px-8 py-5 flex items-center justify-between flex-shrink-0 shadow-sm">
        <div>
          <h1 className="text-xl font-black text-neutral-900 tracking-tight leading-none">Команда</h1>
          <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mt-1">
            Управление персоналом и кадровые операции
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-300 group-focus-within:text-neutral-600 transition-colors" />
            <input
              type="text"
              placeholder="Поиск по ФИО или телефону..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-64 h-10 pl-10 pr-4 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-bold outline-none focus:border-neutral-500 focus:bg-white transition-all"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-300 hover:text-neutral-600">
                <X size={14} />
              </button>
            )}
          </div>

          {/* Role filter */}
          <div className="relative">
            <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400 pointer-events-none" />
            <select
              value={filterRole}
              onChange={e => setFilterRole(e.target.value)}
              className="h-10 pl-10 pr-8 bg-neutral-50 border border-neutral-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-neutral-600 appearance-none outline-none focus:border-neutral-500 min-w-[140px]"
            >
              <option value="">Все роли</option>
              {ROLES.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
          </div>

          {/* Store filter */}
          <div className="relative">
            <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400 pointer-events-none" />
            <select
              value={filterStore}
              onChange={e => setFilterStore(e.target.value)}
              className="h-10 pl-10 pr-8 bg-neutral-50 border border-neutral-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-neutral-600 appearance-none outline-none focus:border-neutral-500 min-w-[140px]"
            >
              <option value="">Все филиалы</option>
              {stores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>

          {hasFilters && (
            <button
              onClick={() => { setSearchQuery(''); setFilterRole(''); setFilterStore('') }}
              className="h-10 w-10 bg-neutral-900 text-white rounded-xl flex items-center justify-center hover:bg-black transition-all"
            >
              <X size={16} />
            </button>
          )}

          <div className="w-px h-6 bg-neutral-100" />

          <button
            onClick={() => setIsCreateOpen(true)}
            className="h-10 px-5 bg-neutral-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all flex items-center gap-2 shadow-lg shadow-black/10 active:scale-95"
          >
            <Plus size={16} /> Добавить сотрудника
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">

        {/* ── Left sidebar: stats ──────────────────────────────────────── */}
        <div className="w-72 flex-shrink-0 bg-white border-r border-neutral-100 flex flex-col overflow-y-auto custom-scrollbar">

          {/* Overall stats */}
          <div className="p-6 border-b border-neutral-50 space-y-4">
            <p className="text-[8px] font-black text-neutral-400 uppercase tracking-widest">Состав команды</p>

            <div className="grid grid-cols-2 gap-3">
              <div
                onClick={() => setFilterActive('active')}
                className={cn(
                  'p-4 rounded-2xl border cursor-pointer transition-all',
                  filterActive === 'active' ? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-neutral-50 border-neutral-100 hover:border-neutral-300'
                )}
              >
                <CheckCircle2 size={16} className={filterActive === 'active' ? 'text-white/60' : 'text-emerald-500'} />
                <p className="text-2xl font-black mt-2 leading-none">{activeCount}</p>
                <p className={cn('text-[8px] font-black uppercase tracking-widest mt-1', filterActive === 'active' ? 'text-white/50' : 'text-neutral-400')}>Активных</p>
              </div>
              <div
                onClick={() => setFilterActive('inactive')}
                className={cn(
                  'p-4 rounded-2xl border cursor-pointer transition-all',
                  filterActive === 'inactive' ? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-neutral-50 border-neutral-100 hover:border-neutral-300'
                )}
              >
                <UserMinus size={16} className={filterActive === 'inactive' ? 'text-white/60' : 'text-neutral-400'} />
                <p className="text-2xl font-black mt-2 leading-none">{inactiveCount}</p>
                <p className={cn('text-[8px] font-black uppercase tracking-widest mt-1', filterActive === 'inactive' ? 'text-white/50' : 'text-neutral-400')}>Уволенных</p>
              </div>
            </div>

            <button
              onClick={() => setFilterActive('all')}
              className={cn(
                'w-full h-10 rounded-2xl border text-[9px] font-black uppercase tracking-widest transition-all',
                filterActive === 'all' ? 'bg-neutral-900 text-white border-neutral-800' : 'bg-neutral-50 text-neutral-500 border-neutral-100 hover:border-neutral-300'
              )}
            >
              Показать всех ({employees.length})
            </button>
          </div>

          {/* Role distribution */}
          <div className="p-6 border-b border-neutral-50 space-y-4">
            <p className="text-[8px] font-black text-neutral-400 uppercase tracking-widest">Распределение по ролям</p>
            {roleBreakdown.length === 0 ? (
              <p className="text-[9px] text-neutral-200 font-bold">Нет данных</p>
            ) : (
              <div className="space-y-3">
                {roleBreakdown.map(role => {
                  const pct = activeCount > 0 ? Math.round((role.count / activeCount) * 100) : 0
                  return (
                    <div
                      key={role.id}
                      onClick={() => setFilterRole(filterRole === role.id ? '' : role.id)}
                      className={cn('group cursor-pointer', filterRole === role.id && 'opacity-100')}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className={cn('w-2 h-2 rounded-full', role.color.includes('violet') ? 'bg-violet-500' : role.color.includes('sky') ? 'bg-sky-500' : role.color.includes('amber') ? 'bg-amber-500' : role.color.includes('emerald') ? 'bg-emerald-500' : 'bg-neutral-500')} />
                          <span className="text-[9px] font-black text-neutral-600 group-hover:text-neutral-900 transition-colors">{role.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-black text-neutral-400">{role.count}</span>
                          {filterRole === role.id && <X size={10} className="text-neutral-400" />}
                        </div>
                      </div>
                      <div className="h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                        <div
                          className={cn('h-full rounded-full transition-all', role.color.includes('violet') ? 'bg-violet-400' : role.color.includes('sky') ? 'bg-sky-400' : role.color.includes('amber') ? 'bg-amber-400' : role.color.includes('emerald') ? 'bg-emerald-400' : 'bg-neutral-500')}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Stores */}
          {stores.length > 0 && (
            <div className="p-6 space-y-4">
              <p className="text-[8px] font-black text-neutral-400 uppercase tracking-widest">По филиалам</p>
              <div className="space-y-2">
                {stores.map(store => {
                  const count = employees.filter(e => e.storeId === store.id && e.active).length
                  if (!count) return null
                  return (
                    <button
                      key={store.id}
                      onClick={() => setFilterStore(filterStore === store.id ? '' : store.id!)}
                      className={cn(
                        'w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all',
                        filterStore === store.id ? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-neutral-50 border-neutral-100 hover:border-neutral-300 text-neutral-700'
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <Building2 size={12} className={filterStore === store.id ? 'text-white/60' : 'text-neutral-400'} />
                        <span className="text-[10px] font-black truncate">{store.name}</span>
                      </div>
                      <span className={cn('text-[9px] font-black', filterStore === store.id ? 'text-white/60' : 'text-neutral-400')}>{count}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* ── Main table ───────────────────────────────────────────────── */}
        <div className="flex-1 overflow-auto custom-scrollbar">
          {isLoading ? (
            <div className="h-full flex flex-col items-center justify-center gap-4">
              <Loader2 className="animate-spin text-neutral-200" size={48} />
              <p className="text-[11px] font-black text-neutral-300 uppercase tracking-widest">Загрузка списка...</p>
            </div>
          ) : (
            <div>
              {/* Table header */}
              <div className="sticky top-0 z-10 bg-white border-b border-neutral-100 px-6 py-4 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                  <Users size={16} className="text-neutral-400" />
                  <span className="text-sm font-black text-neutral-900">
                    {filtered.length} {filterActive === 'active' ? 'активных' : filterActive === 'inactive' ? 'уволенных' : 'всего'}
                  </span>
                  {hasFilters && (
                    <span className="px-2 py-0.5 bg-amber-50 border border-amber-100 text-amber-600 rounded text-[9px] font-black uppercase tracking-widest flex items-center gap-1">
                      <Filter size={10} /> Фильтр активен
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-4 text-[9px] font-black text-neutral-400 uppercase tracking-widest">
                  <span className="w-64">Сотрудник</span>
                  <span className="w-28">Роль</span>
                  <span className="w-36 hidden lg:block">Телефон</span>
                  <span className="w-36 hidden xl:block">Филиал</span>
                  <span className="w-24">Статус</span>
                  <span className="w-24 hidden xl:block">Нанят</span>
                  <span className="w-8" />
                </div>
              </div>

              {filtered.length === 0 ? (
                <div className="py-32 flex flex-col items-center gap-4">
                  <div className="h-16 w-16 rounded-2xl bg-neutral-50 flex items-center justify-center">
                    <Users size={24} className="text-neutral-200" />
                  </div>
                  <p className="text-sm font-black text-neutral-300">
                    {filterActive === 'inactive' ? 'Уволенных сотрудников нет' : 'Сотрудники не найдены'}
                  </p>
                  {hasFilters && (
                    <button
                      onClick={() => { setSearchQuery(''); setFilterRole(''); setFilterStore('') }}
                      className="text-[10px] font-black text-neutral-400 hover:text-neutral-900 uppercase tracking-widest transition-colors underline underline-offset-4"
                    >
                      Сбросить фильтры
                    </button>
                  )}
                </div>
              ) : (
                <div className="divide-y divide-neutral-50">
                  {filtered.map((employee, idx) => {
                    const role = getRoleConfig(employee.role)
                    const isInactive = !employee.active

                    return (
                      <div
                        key={employee.id}
                        className={cn(
                          'flex items-center gap-4 px-6 py-4 hover:bg-neutral-50/60 transition-colors cursor-pointer group',
                          idx % 2 === 1 ? 'bg-neutral-50/20' : 'bg-white',
                          isInactive && 'opacity-60'
                        )}
                        onClick={() => setDetailEmployee(employee)}
                      >
                        {/* Avatar + name */}
                        <div className="flex items-center gap-4 w-64 min-w-0">
                          <div className={cn(
                            'h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all',
                            isInactive ? 'bg-neutral-100' : 'bg-neutral-50 border border-neutral-200 group-hover:border-neutral-900 group-hover:bg-neutral-900 group-hover:text-white'
                          )}>
                            <UserCircle size={20} className={cn('transition-colors', isInactive ? 'text-neutral-300' : '')} />
                          </div>
                          <div className="min-w-0">
                            <p className={cn('text-sm font-black tracking-tight truncate', isInactive ? 'text-neutral-400 line-through' : 'text-neutral-900')}>
                              {employee.firstName} {employee.lastName}
                            </p>
                          </div>
                        </div>

                        {/* Role */}
                        <div className="w-28">
                          <span className={cn('px-2.5 py-1 rounded-lg border text-[8px] font-black uppercase tracking-widest', role.color)}>
                            {role.name}
                          </span>
                        </div>

                        {/* Phone */}
                        <div className="w-36 hidden lg:flex items-center gap-2">
                          <Phone size={12} className="text-neutral-300 flex-shrink-0" />
                          <span className="text-xs font-bold text-neutral-500 truncate">{employee.phone || '—'}</span>
                        </div>

                        {/* Store */}
                        <div className="w-36 hidden xl:flex items-center gap-2">
                          <Building2 size={12} className="text-neutral-300 flex-shrink-0" />
                          <span className="text-xs font-bold text-neutral-500 truncate">{getStoreName(employee.storeId)}</span>
                        </div>

                        {/* Status */}
                        <div className="w-24">
                          {employee.active ? (
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-emerald-500" />
                              <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Активен</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-neutral-300" />
                              <span className="text-[9px] font-black text-neutral-400 uppercase tracking-widest">Уволен</span>
                            </div>
                          )}
                        </div>

                        {/* Hire date */}
                        <div className="w-24 hidden xl:block">
                          <span className="text-[10px] font-bold text-neutral-400">
                            {employee.hireDate
                              ? format(parseISO(employee.hireDate), 'd MMM yyyy', { locale: ru })
                              : '—'}
                          </span>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 ml-auto flex-shrink-0" onClick={e => e.stopPropagation()}>
                          <button
                            onClick={() => setSalaryEmployee(employee)}
                            className="h-8 px-3 rounded-lg bg-neutral-50 border border-neutral-200 text-[9px] font-black text-neutral-500 uppercase tracking-widest hover:bg-neutral-900 hover:text-white hover:border-neutral-900 transition-all hidden md:flex items-center gap-2"
                          >
                            <Wallet2 size={12} /> Тариф
                          </button>
                          <RowMenu
                            employee={employee}
                            onEdit={() => setEditEmployee(employee)}
                            onSalary={() => setSalaryEmployee(employee)}
                            onDismiss={() => setDismissTarget(employee)}
                            onReactivate={() => reactivateMutation.mutate(employee)}
                          />
                          <ChevronRight size={16} className="text-neutral-200 group-hover:text-neutral-900 transition-colors" />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Status bar ──────────────────────────────────────────────────── */}
      <div className="bg-white border-t border-neutral-100 px-8 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <TrendingUp size={14} className="text-neutral-400" />
            <span className="text-[9px] font-black text-neutral-400 uppercase tracking-widest">
              {activeCount} активных из {employees.length}
            </span>
          </div>
          {inactiveCount > 0 && (
            <div className="flex items-center gap-2">
              <AlertTriangle size={14} className="text-amber-400" />
              <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest">{inactiveCount} уволенных</span>
            </div>
          )}
        </div>
        <button
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center gap-2 text-[9px] font-black text-neutral-400 hover:text-neutral-900 uppercase tracking-widest transition-colors"
        >
          <ArrowUpRight size={14} />
          Добавить сотрудника
        </button>
      </div>

      {/* ── Modals ──────────────────────────────────────────────────────── */}
      {isCreateOpen && (
        <EmployeeFormModal
          onClose={() => setIsCreateOpen(false)}
          onSuccess={() => { setIsCreateOpen(false); queryClient.invalidateQueries({ queryKey: ['employees-list'] }) }}
        />
      )}
      {editEmployee && (
        <EmployeeFormModal
          employee={editEmployee}
          onClose={() => setEditEmployee(null)}
          onSuccess={() => { setEditEmployee(null); queryClient.invalidateQueries({ queryKey: ['employees-list'] }) }}
        />
      )}
      {salaryEmployee && (
        <SalaryConfigModal
          employee={salaryEmployee}
          onClose={() => setSalaryEmployee(null)}
        />
      )}
      {detailEmployee && (
        <EmployeeDetailModal
          employee={detailEmployee}
          onClose={() => { setDetailEmployee(null); queryClient.invalidateQueries({ queryKey: ['employees-list'] }) }}
        />
      )}
      {dismissTarget && (
        <DismissConfirmDialog
          employee={dismissTarget}
          isLoading={dismissMutation.isPending}
          onConfirm={() => dismissMutation.mutate(dismissTarget)}
          onCancel={() => setDismissTarget(null)}
        />
      )}
    </div>
  )
}
