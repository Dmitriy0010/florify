import { useState, useEffect, useMemo } from 'react'
import { 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  Users, 
  UserCircle,
  Search,
  Plus,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  ZapIcon,
  CalendarClock,
  X
} from 'lucide-react'
import { EmployeeService, TimesheetService, Employee, TimesheetEntry } from '@/lib/api'
import { cn } from '@/lib/utils'
import { 
  format, 
  addDays, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameDay, 
  isToday,
  differenceInMinutes,
  parseISO
} from 'date-fns'
import { ru } from 'date-fns/locale'
import { toast } from 'sonner'

// ───────────────────────────────────────────────────────────────────────────
// Types
// ───────────────────────────────────────────────────────────────────────────
type ViewMode = 'week' | 'day'

// ───────────────────────────────────────────────────────────────────────────
// Helpers
// ───────────────────────────────────────────────────────────────────────────
const getRoleLabel = (role?: string) => {
  const r = role?.toUpperCase()
  if (r === 'FLORIST') return 'Флорист'
  if (r === 'CASHIER') return 'Кассир'
  if (r === 'ADMIN') return 'Администратор'
  if (r === 'MANAGER') return 'Менеджер'
  if (r === 'OWNER') return 'Владелец'
  return role || 'Сотрудник'
}

const ROLE_COLORS: Record<string, { bg: string; text: string; dot: string; bar: string }> = {
  FLORIST:  { bg: 'bg-violet-50',  text: 'text-violet-700',  dot: 'bg-violet-500',  bar: 'bg-violet-500' },
  CASHIER:  { bg: 'bg-sky-50',     text: 'text-sky-700',     dot: 'bg-sky-500',     bar: 'bg-sky-500'    },
  ADMIN:    { bg: 'bg-amber-50',   text: 'text-amber-700',   dot: 'bg-amber-500',   bar: 'bg-amber-500'  },
  MANAGER:  { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500', bar: 'bg-emerald-500'},
  OWNER:    { bg: 'bg-neutral-900',text: 'text-white',       dot: 'bg-neutral-400', bar: 'bg-neutral-600'},
  DEFAULT:  { bg: 'bg-neutral-50', text: 'text-neutral-600', dot: 'bg-neutral-400', bar: 'bg-neutral-400'},
}

const getRoleColor = (role?: string) => ROLE_COLORS[role?.toUpperCase() || ''] ?? ROLE_COLORS.DEFAULT

// ───────────────────────────────────────────────────────────────────────────
// ShiftCard component
// ───────────────────────────────────────────────────────────────────────────
function ShiftCard({ shift, role }: { shift: TimesheetEntry; role?: string }) {
  const colors = getRoleColor(role)
  const isOpen = !shift.checkoutAt

  const checkin = parseISO(shift.checkinAt)
  const duration = shift.checkoutAt 
    ? differenceInMinutes(parseISO(shift.checkoutAt), checkin)
    : differenceInMinutes(new Date(), checkin)
  const hours = Math.floor(duration / 60)
  const minutes = duration % 60

  return (
    <div className={cn(
      'relative rounded-xl px-3 py-2 border transition-all hover:shadow-lg hover:-translate-y-0.5 cursor-pointer group/shift overflow-hidden',
      colors.bg,
      'border-transparent hover:border-white'
    )}>
      {/* Left accent bar */}
      <div className={cn('absolute left-0 top-0 bottom-0 w-1 rounded-l-xl', colors.bar)} />

      {/* Live pulse for open shifts */}
      {isOpen && (
        <span className="absolute top-2 right-2 flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
        </span>
      )}

      <div className="pl-2">
        <div className={cn('text-[10px] font-black tracking-wider', colors.text)}>
          {format(checkin, 'HH:mm')}
          {shift.checkoutAt ? (
            <span className="opacity-60"> → {format(parseISO(shift.checkoutAt), 'HH:mm')}</span>
          ) : (
            <span className="opacity-60"> → ...</span>
          )}
        </div>
        <div className={cn('text-[9px] font-bold mt-0.5 opacity-60', colors.text)}>
          {hours}ч {minutes > 0 ? `${minutes}м` : ''}
          {isOpen && <span className="ml-1.5 font-black text-emerald-600 opacity-100">● В смене</span>}
        </div>
      </div>
    </div>
  )
}

// ───────────────────────────────────────────────────────────────────────────
// DaySummaryCell  – маленькие аватарки-теги в day view
// ───────────────────────────────────────────────────────────────────────────
function EmptyCell({ onAdd }: { onAdd?: () => void }) {
  return (
    <div
      className="h-20 rounded-xl border-2 border-dashed border-neutral-100 flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 hover:!opacity-100 transition-all hover:border-neutral-300 hover:bg-neutral-50/60"
      onClick={onAdd}
    >
      <Plus size={16} className="text-neutral-300" />
    </div>
  )
}

// ───────────────────────────────────────────────────────────────────────────
// Main page
// ───────────────────────────────────────────────────────────────────────────
export default function TeamSchedulePage() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [shifts, setShifts] = useState<TimesheetEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }))
  const [searchQuery, setSearchQuery] = useState('')
  const [filterRole, setFilterRole] = useState('')
  const [viewMode] = useState<ViewMode>('week')
  const [selectedDay, setSelectedDay] = useState<Date>(new Date())

  const weekDays = useMemo(() => eachDayOfInterval({
    start: currentWeekStart,
    end: endOfWeek(currentWeekStart, { weekStartsOn: 1 })
  }), [currentWeekStart])

  useEffect(() => { loadData() }, [currentWeekStart])

  const loadData = async () => {
    setIsLoading(true)
    try {
      const monthStr = format(currentWeekStart, 'yyyy-MM')
      const [empRes, shiftRes] = await Promise.all([
        EmployeeService.getAll(),
        TimesheetService.list({ month: monthStr })
      ])
      const empData = (empRes.data as any).data || (empRes.data as any).content || empRes.data || []
      setEmployees(empData)
      setShifts(shiftRes.data || [])
    } catch (err) {
      console.error(err)
      toast.error('Ошибка загрузки данных расписания')
    } finally {
      setIsLoading(false)
    }
  }

  const getShiftsFor = (employeeId: string, day: Date) =>
    shifts.filter(s => s.employeeId === employeeId && isSameDay(parseISO(s.date), day))

  const filteredEmployees = useMemo(() => employees.filter(e => {
    const name = `${e.firstName} ${e.lastName}`.toLowerCase()
    const matchSearch = name.includes(searchQuery.toLowerCase())
    const matchRole = !filterRole || e.role === filterRole
    return matchSearch && matchRole
  }), [employees, searchQuery, filterRole])

  // ── Stats ──────────────────────────────────────────────────────────────
  const todayShifts = shifts.filter(s => isSameDay(parseISO(s.date), selectedDay))
  const activeNow = shifts.filter(s => !s.checkoutAt && isSameDay(parseISO(s.date), new Date()))
  const totalHoursWeek = shifts
    .filter(s => weekDays.some(d => isSameDay(parseISO(s.date), d)))
    .reduce((acc, s) => acc + (s.hoursWorked || 0), 0)
  const shiftCoverage = Math.round(
    (weekDays.filter(d => shifts.some(s => isSameDay(parseISO(s.date), d))).length / 7) * 100
  )

  const prevWeek = () => setCurrentWeekStart(addDays(currentWeekStart, -7))
  const nextWeek = () => setCurrentWeekStart(addDays(currentWeekStart, 7))
  const goToday = () => {
    setCurrentWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }))
    setSelectedDay(new Date())
  }

  const uniqueRoles = [...new Set(employees.map(e => e.role).filter(Boolean))]

  return (
    <div className="flex flex-col h-screen bg-[#F7F8FA] overflow-hidden">

      {/* ── Top Navigation Bar ─────────────────────────────────────────── */}
      <div className="bg-white border-b border-neutral-100 px-8 py-5 flex items-center justify-between gap-6 flex-shrink-0 shadow-sm">
        <div className="flex items-center gap-6">
          <div>
            <h1 className="text-xl font-black text-neutral-900 tracking-tight leading-none">График работы</h1>
            <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mt-1">
              {format(currentWeekStart, 'd MMMM', { locale: ru })} — {format(weekDays[6], 'd MMMM yyyy', { locale: ru })}
            </p>
          </div>

          {/* Week navigator */}
          <div className="flex items-center bg-neutral-50 rounded-xl border border-neutral-100 overflow-hidden">
            <button onClick={prevWeek} className="h-10 w-10 flex items-center justify-center hover:bg-neutral-100 transition-all text-neutral-500">
              <ChevronLeft size={18} />
            </button>
            <button 
              onClick={goToday}
              className="h-10 px-5 text-[10px] font-black uppercase tracking-widest text-neutral-600 hover:text-neutral-900 transition-colors border-x border-neutral-200"
            >
              Сегодня
            </button>
            <button onClick={nextWeek} className="h-10 w-10 flex items-center justify-center hover:bg-neutral-100 transition-all text-neutral-500">
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-300 group-focus-within:text-neutral-600 transition-colors" />
            <input
              type="text"
              placeholder="Поиск сотрудника..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-56 h-10 pl-10 pr-4 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-bold outline-none focus:border-neutral-500 focus:bg-white transition-all"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-300 hover:text-neutral-600">
                <X size={14} />
              </button>
            )}
          </div>

          {/* Role filter */}
          <select
            value={filterRole}
            onChange={e => setFilterRole(e.target.value)}
            className="h-10 px-4 bg-neutral-50 border border-neutral-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-neutral-600 appearance-none outline-none focus:border-neutral-500 min-w-[130px]"
          >
            <option value="">Все роли</option>
            {uniqueRoles.map(r => <option key={r} value={r}>{getRoleLabel(r)}</option>)}
          </select>

          <div className="w-px h-6 bg-neutral-100" />

          {/* Add shift button */}
          <button className="h-10 px-5 bg-neutral-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all flex items-center gap-2 shadow-lg shadow-black/10 active:scale-95">
            <Plus size={16} />
            Назначить смену
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">

        {/* ── Left sidebar: KPIs ────────────────────────────────────────── */}
        <div className="w-72 flex-shrink-0 bg-white border-r border-neutral-100 flex flex-col overflow-y-auto custom-scrollbar">

          {/* Day picker strip */}
          <div className="p-4 border-b border-neutral-50">
            <p className="text-[8px] font-black text-neutral-400 uppercase tracking-widest mb-3 px-1">Выберите день</p>
            <div className="grid grid-cols-7 gap-1">
              {weekDays.map(day => (
                <button
                  key={day.toISOString()}
                  onClick={() => setSelectedDay(day)}
                  className={cn(
                    'flex flex-col items-center py-2.5 px-1 rounded-xl transition-all group',
                    isSameDay(day, selectedDay) ? 'bg-neutral-900 text-white shadow-lg shadow-black/20' :
                    isToday(day) ? 'bg-violet-50 text-violet-700 border border-violet-200' :
                    'hover:bg-neutral-50 text-neutral-400 hover:text-neutral-900'
                  )}
                >
                  <span className="text-[7px] font-black uppercase tracking-widest opacity-70 leading-none">
                    {format(day, 'EE', { locale: ru }).toUpperCase().slice(0, 2)}
                  </span>
                  <span className={cn('text-base font-black tracking-tighter mt-1 leading-none', isSameDay(day, selectedDay) ? 'text-white' : '')}>
                    {format(day, 'd')}
                  </span>
                  {/* Dots indicating shifts */}
                  <div className="flex gap-0.5 mt-1.5">
                    {shifts.some(s => isSameDay(parseISO(s.date), day)) && (
                      <div className={cn('w-1 h-1 rounded-full', isSameDay(day, selectedDay) ? 'bg-white/60' : 'bg-violet-400')} />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Stats for selected day */}
          <div className="p-4 space-y-3">
            <p className="text-[8px] font-black text-neutral-400 uppercase tracking-widest px-1">
              {format(selectedDay, 'd MMMM', { locale: ru })}
            </p>

            {/* Staff on selected day */}
            <div className="bg-neutral-50 rounded-2xl p-4 border border-neutral-100">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Users size={14} className="text-neutral-400" />
                  <p className="text-[9px] font-black text-neutral-500 uppercase tracking-widest">На смене</p>
                </div>
                <span className="text-xl font-black text-neutral-900">{todayShifts.length}</span>
              </div>
              <div className="space-y-2">
                {todayShifts.slice(0, 4).map(s => {
                  const emp = employees.find(e => e.id === s.employeeId)
                  const colors = getRoleColor(emp?.role)
                  return emp ? (
                    <div key={s.id} className="flex items-center gap-2.5">
                      <div className={cn('h-6 w-6 rounded-lg flex items-center justify-center flex-shrink-0', colors.bg)}>
                        <UserCircle size={14} className={colors.text} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] font-black text-neutral-900 truncate leading-tight">
                          {emp.firstName} {emp.lastName}
                        </p>
                        <p className="text-[8px] font-bold text-neutral-400">
                          {format(parseISO(s.checkinAt), 'HH:mm')}
                          {s.checkoutAt ? ` — ${format(parseISO(s.checkoutAt), 'HH:mm')}` : ' • в смене'}
                        </p>
                      </div>
                    </div>
                  ) : null
                })}
                {todayShifts.length === 0 && (
                  <p className="text-[9px] text-neutral-300 font-bold text-center py-2">Смен не запланировано</p>
                )}
              </div>
            </div>

            {/* Active right now */}
            <div className={cn(
              'rounded-2xl p-4 border',
              activeNow.length > 0 ? 'bg-emerald-50 border-emerald-100' : 'bg-neutral-50 border-neutral-100'
            )}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {activeNow.length > 0
                    ? <span className="flex h-2 w-2"><span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-emerald-400 opacity-75" /><span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" /></span>
                    : <div className="h-2 w-2 rounded-full bg-neutral-300" />
                  }
                  <p className="text-[9px] font-black uppercase tracking-widest text-neutral-500">Сейчас на работе</p>
                </div>
                <span className={cn('text-xl font-black', activeNow.length > 0 ? 'text-emerald-700' : 'text-neutral-300')}>
                  {activeNow.length}
                </span>
              </div>
            </div>
          </div>

          {/* Week summary stats */}
          <div className="p-4 border-t border-neutral-50 space-y-3">
            <p className="text-[8px] font-black text-neutral-400 uppercase tracking-widest px-1">Итоги недели</p>

            <div className="grid grid-cols-2 gap-2">
              <div className="bg-neutral-50 rounded-2xl p-4 border border-neutral-100">
                <div className="flex items-center gap-1.5 mb-2">
                  <Clock size={12} className="text-neutral-400" />
                  <p className="text-[7px] font-black text-neutral-400 uppercase tracking-widest">Всего часов</p>
                </div>
                <p className="text-xl font-black text-neutral-900 tracking-tighter">{totalHoursWeek.toFixed(0)}</p>
              </div>
              <div className="bg-neutral-50 rounded-2xl p-4 border border-neutral-100">
                <div className="flex items-center gap-1.5 mb-2">
                  <TrendingUp size={12} className="text-neutral-400" />
                  <p className="text-[7px] font-black text-neutral-400 uppercase tracking-widest">Охват</p>
                </div>
                <p className="text-xl font-black text-neutral-900 tracking-tighter">{shiftCoverage}%</p>
              </div>
            </div>

            <div className="bg-neutral-50 rounded-2xl p-4 border border-neutral-100">
              <div className="flex items-center gap-2 mb-3">
                <Users size={12} className="text-neutral-400" />
                <p className="text-[8px] font-black text-neutral-500 uppercase tracking-widest">Распределение ролей</p>
              </div>
              {uniqueRoles.map(role => {
                const count = employees.filter(e => e.role === role).length
                const pct = Math.round((count / employees.length) * 100)
                const colors = getRoleColor(role)
                return (
                  <div key={role} className="mb-2 last:mb-0">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5">
                        <div className={cn('w-1.5 h-1.5 rounded-full', colors.dot)} />
                        <span className="text-[8px] font-black text-neutral-600">{getRoleLabel(role)}</span>
                      </div>
                      <span className="text-[8px] font-black text-neutral-400">{count}</span>
                    </div>
                    <div className="h-1 bg-neutral-100 rounded-full overflow-hidden">
                      <div className={cn('h-full rounded-full transition-all', colors.bar)} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Alerts */}
          {employees.filter(e => !e.active).length > 0 && (
            <div className="p-4 border-t border-neutral-50">
              <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle size={14} className="text-amber-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[9px] font-black text-amber-700 uppercase tracking-widest">Внимание</p>
                    <p className="text-[9px] font-bold text-amber-600 mt-1">
                      {employees.filter(e => !e.active).length} сотрудников заблокированы
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Main schedule grid ────────────────────────────────────────── */}
        <div className="flex-1 overflow-auto custom-scrollbar">
          {isLoading ? (
            <div className="h-full flex flex-col items-center justify-center gap-4">
              <Loader2 className="animate-spin text-neutral-200" size={48} />
              <p className="text-[11px] font-black text-neutral-300 uppercase tracking-widest">Загрузка расписания...</p>
            </div>
          ) : (
            <table className="w-full border-collapse" style={{ minWidth: '900px' }}>
              {/* ── Header row: days ──────────────────────────────────── */}
              <thead className="sticky top-0 z-20">
                <tr>
                  {/* Employee column header */}
                  <th className="bg-white border-b border-r border-neutral-100 p-4 w-64 text-left">
                    <div className="flex items-center gap-2">
                      <Users size={14} className="text-neutral-400" />
                      <span className="text-[9px] font-black text-neutral-500 uppercase tracking-widest">
                        {filteredEmployees.length} сотрудников
                      </span>
                    </div>
                  </th>

                  {/* Day columns */}
                  {weekDays.map(day => {
                    const hasShifts = filteredEmployees.some(e => getShiftsFor(e.id!, day).length > 0)
                    const dayShiftCount = shifts.filter(s => isSameDay(parseISO(s.date), day)).length
                    return (
                      <th
                        key={day.toISOString()}
                        onClick={() => setSelectedDay(day)}
                        className={cn(
                          'border-b border-r border-neutral-100 p-0 text-center cursor-pointer transition-all group',
                          isToday(day) ? 'bg-violet-50/60' : 'bg-white hover:bg-neutral-50',
                          isSameDay(day, selectedDay) ? 'bg-sky-50/40' : ''
                        )}
                      >
                        <div className="py-3 px-2">
                          <p className={cn(
                            'text-[8px] font-black uppercase tracking-widest mb-1',
                            isToday(day) ? 'text-violet-500' : 'text-neutral-400'
                          )}>
                            {format(day, 'EE', { locale: ru })}
                          </p>
                          <div className={cn(
                            'text-2xl font-black tracking-tighter leading-none mx-auto w-10 h-10 flex items-center justify-center rounded-xl transition-all',
                            isToday(day) ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/30' :
                            isSameDay(day, selectedDay) ? 'bg-sky-100 text-sky-700' :
                            'text-neutral-700 group-hover:bg-neutral-100'
                          )}>
                            {format(day, 'd')}
                          </div>
                          {hasShifts && (
                            <div className="flex items-center justify-center gap-1 mt-2">
                              <div className={cn('h-1 w-1 rounded-full', isToday(day) ? 'bg-violet-400' : 'bg-neutral-300')} />
                              <span className="text-[7px] font-black text-neutral-300 uppercase">{dayShiftCount}</span>
                            </div>
                          )}
                        </div>
                      </th>
                    )
                  })}
                </tr>
              </thead>

              {/* ── Body: one row per employee ───────────────────────── */}
              <tbody>
                {filteredEmployees.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-24 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <Search size={32} className="text-neutral-200" />
                        <p className="text-sm font-black text-neutral-300">Сотрудники не найдены</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredEmployees.map((employee, idx) => {
                    const colors = getRoleColor(employee.role)
                    const weekShifts = weekDays.flatMap(d => getShiftsFor(employee.id!, d))
                    const weekHours = weekShifts.reduce((acc, s) => acc + (s.hoursWorked || 0), 0)

                    return (
                      <tr
                        key={employee.id}
                        className={cn(
                          'group border-b border-neutral-100 hover:bg-white/60 transition-colors',
                          idx % 2 === 0 ? 'bg-white' : 'bg-[#F9FAFB]'
                        )}
                      >
                        {/* Employee info cell */}
                        <td className={cn(
                          'border-r border-neutral-100 p-4 sticky left-0 z-10 transition-colors',
                          idx % 2 === 0 ? 'bg-white' : 'bg-[#F9FAFB]',
                          'group-hover:bg-white'
                        )}>
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              'h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0 border',
                              colors.bg, 'border-transparent'
                            )}>
                              <UserCircle size={22} className={colors.text} />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-black text-neutral-900 tracking-tight leading-tight truncate">
                                {employee.firstName} {employee.lastName}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className={cn(
                                  'text-[7px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border',
                                  colors.bg, colors.text, 'border-transparent'
                                )}>
                                  {getRoleLabel(employee.role)}
                                </span>
                                {weekHours > 0 && (
                                  <span className="text-[7px] font-black text-neutral-400 flex items-center gap-1">
                                    <Clock size={8} />
                                    {weekHours.toFixed(0)}ч
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Day cells */}
                        {weekDays.map(day => {
                          const dayShifts = getShiftsFor(employee.id!, day)
                          return (
                            <td
                              key={day.toISOString()}
                              className={cn(
                                'border-r border-neutral-100 p-2 align-top transition-colors min-w-[120px]',
                                isToday(day) ? 'bg-violet-50/20' : '',
                                isSameDay(day, selectedDay) ? 'bg-sky-50/20' : ''
                              )}
                            >
                              <div className="space-y-1.5 min-h-[56px]">
                                {dayShifts.map(s => (
                                  <ShiftCard key={s.id} shift={s} role={employee.role} />
                                ))}
                                {dayShifts.length === 0 && <EmptyCell />}
                              </div>
                            </td>
                          )
                        })}
                      </tr>
                    )
                  })
                )}
              </tbody>

              {/* ── Footer row: daily totals (pinned at bottom inside scroll) */}
              {!isLoading && filteredEmployees.length > 0 && (
                <tfoot>
                  <tr className="bg-neutral-50 border-t-2 border-neutral-200">
                    <td className="sticky left-0 bg-neutral-50 border-r border-neutral-200 p-4">
                      <div className="flex items-center gap-2">
                        <ZapIcon size={14} className="text-neutral-400" />
                        <span className="text-[9px] font-black text-neutral-500 uppercase tracking-widest">Итого смен</span>
                      </div>
                    </td>
                    {weekDays.map(day => {
                      const count = filteredEmployees.filter(e => getShiftsFor(e.id!, day).length > 0).length
                      const dayHours = shifts
                        .filter(s => isSameDay(parseISO(s.date), day))
                        .reduce((acc, s) => acc + (s.hoursWorked || 0), 0)
                      return (
                        <td key={day.toISOString()} className="border-r border-neutral-200 p-4 text-center">
                          {count > 0 ? (
                            <>
                              <p className="text-base font-black text-neutral-900">{count}</p>
                              <p className="text-[8px] font-bold text-neutral-400">{dayHours.toFixed(0)}ч</p>
                            </>
                          ) : (
                            <p className="text-sm font-black text-neutral-200">—</p>
                          )}
                        </td>
                      )
                    })}
                  </tr>
                </tfoot>
              )}
            </table>
          )}
        </div>
      </div>

      {/* ── Bottom status bar ───────────────────────────────────────────── */}
      <div className="bg-white border-t border-neutral-100 px-8 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-5">
            {Object.entries(ROLE_COLORS).filter(([k]) => k !== 'DEFAULT').map(([role, colors]) => (
              <div key={role} className="flex items-center gap-1.5">
                <div className={cn('w-2.5 h-2.5 rounded-full', colors.bar)} />
                <span className="text-[9px] font-black text-neutral-400 uppercase tracking-widest">{getRoleLabel(role)}</span>
              </div>
            ))}
          </div>

          <div className="w-px h-4 bg-neutral-100" />

          <div className="flex items-center gap-2">
            <div className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </div>
            <span className="text-[9px] font-black text-neutral-400 uppercase tracking-widest">Активная смена</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <CalendarClock size={14} className="text-neutral-400" />
            <span className="text-[9px] font-black text-neutral-400 uppercase tracking-widest">
              Последнее обновление: {format(new Date(), 'HH:mm', { locale: ru })}
            </span>
          </div>
          <button 
            onClick={loadData}
            className="flex items-center gap-1.5 text-[9px] font-black text-neutral-500 hover:text-neutral-900 uppercase tracking-widest transition-colors"
          >
            <ArrowRight size={12} />
            Обновить
          </button>
        </div>
      </div>

    </div>
  )
}
