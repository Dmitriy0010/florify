import { useState, useEffect } from 'react'
import { 
  History, 
  Timer,
  Sun,
  Moon,
  TrendingUp,
  Clock,
  ChevronLeft,
  ChevronRight,
  Calendar,
  CheckCircle2,
  AlertCircle,
  BarChart3
} from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { TimesheetService, TimesheetEntry } from '@/lib/api'
import { cn } from '@/lib/utils'
import { 
  format, 
  differenceInSeconds, 
  differenceInMinutes,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  isToday,
  parseISO,
  subMonths,
  addMonths
} from 'date-fns'
import { ru } from 'date-fns/locale'
import { toast } from 'sonner'
import { useAuthStore } from '@/store/useAuthStore'

// ─────────────────────────────────────────────────────────────────────────────
// Mini calendar heatmap
// ─────────────────────────────────────────────────────────────────────────────
function MonthHeatmap({ entries, monthDate }: { entries: TimesheetEntry[], monthDate: Date }) {
  const start = startOfMonth(monthDate)
  const end = endOfMonth(monthDate)
  const days = eachDayOfInterval({ start, end })
  const firstDayOfWeek = (start.getDay() + 6) % 7 // Mon-based

  return (
    <div>
      {/* Day labels */}
      <div className="grid grid-cols-7 mb-2">
        {['Пн','Вт','Ср','Чт','Пт','Сб','Вс'].map(d => (
          <div key={d} className="text-center">
            <span className="text-[7px] font-black text-neutral-300 uppercase tracking-widest">{d}</span>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {/* Empty padding */}
        {Array.from({ length: firstDayOfWeek }).map((_, i) => <div key={`pad-${i}`} />)}
        {days.map(day => {
          const entry = entries.find(e => isSameDay(parseISO(e.date), day))
          const hours = entry?.hoursWorked || 0
          const isActive = entry && !entry.checkoutAt

          return (
            <div
              key={day.toISOString()}
              title={`${format(day, 'd MMMM', { locale: ru })}${entry ? ` · ${hours.toFixed(1)}ч` : ''}`}
              className={cn(
                'h-7 rounded-md flex items-center justify-center transition-all relative group cursor-default',
                isActive ? 'ring-2 ring-emerald-400 bg-emerald-100' :
                entry && hours >= 8 ? 'bg-neutral-900 text-white' :
                entry && hours >= 4 ? 'bg-neutral-500 text-white' :
                entry && hours > 0 ? 'bg-neutral-200 text-neutral-600' :
                isToday(day) ? 'bg-violet-100 text-violet-600 ring-1 ring-violet-300' :
                'bg-neutral-50 text-neutral-300 hover:bg-neutral-100'
              )}
            >
              <span className="text-[9px] font-black">{format(day, 'd')}</span>
              {/* Tooltip */}
              {entry && (
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-neutral-900 text-white text-[8px] font-black px-2 py-1 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                  {hours.toFixed(1)}ч
                </div>
              )}
            </div>
          )
        })}
      </div>
      <div className="flex items-center gap-3 mt-3">
        <span className="text-[7px] font-black text-neutral-400 uppercase tracking-widest">Меньше</span>
        {[0, 0.5, 4, 8].map((h, i) => (
          <div key={i} className={cn(
            'w-4 h-4 rounded',
            h === 0 ? 'bg-neutral-100' : h === 0.5 ? 'bg-neutral-200' : h === 4 ? 'bg-neutral-500' : 'bg-neutral-900'
          )} />
        ))}
        <span className="text-[7px] font-black text-neutral-400 uppercase tracking-widest">Больше</span>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────────────────────
export default function ShiftsPage() {
  const [monthDate, setMonthDate] = useState(new Date())
  const currentMonth = format(monthDate, 'yyyy-MM')
  const [elapsedTime, setElapsedTime] = useState<number>(0)
  const queryClient = useQueryClient()
  const { user } = useAuthStore()
  const currentUserId = user?.id || ''

  // ── Data ─────────────────────────────────────────────────────────────────
  const { data: rawEntries = [], isLoading } = useQuery({
    queryKey: ['timesheet', currentMonth, currentUserId],
    queryFn: () => TimesheetService.list({ employeeId: currentUserId, month: currentMonth }).then(res => res.data),
    enabled: !!currentUserId
  })

  const entries: TimesheetEntry[] = rawEntries as TimesheetEntry[]
  const activeShift = entries.find(e => !e.checkoutAt)

  const sorted = [...entries].sort((a, b) =>
    new Date(b.checkinAt ?? '').getTime() - new Date(a.checkinAt ?? '').getTime()
  )

  // ── Computed stats ────────────────────────────────────────────────────────
  const totalHours = entries.reduce((acc, e) => acc + (e.hoursWorked || 0), 0)
  const avgHours = entries.length ? totalHours / entries.length : 0
  const daysWorked = new Set(entries.map(e => e.date)).size
  const workdaysInMonth = eachDayOfInterval({
    start: startOfMonth(monthDate),
    end: endOfMonth(monthDate)
  }).filter(d => d.getDay() !== 0 && d.getDay() !== 6).length
  const attendancePct = Math.round((daysWorked / workdaysInMonth) * 100)

  // ── Timer ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    let interval: any
    if (activeShift) {
      interval = setInterval(() => {
        setElapsedTime(differenceInSeconds(new Date(), parseISO(activeShift.checkinAt ?? new Date().toISOString())))
      }, 1000)
    } else { setElapsedTime(0) }
    return () => clearInterval(interval)
  }, [activeShift?.id])

  const formatTimer = (s: number) => {
    const h = Math.floor(s / 3600)
    const m = Math.floor((s % 3600) / 60)
    const sec = s % 60
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`
  }

  const formatDur = (hours?: number) => {
    if (!hours) return '—'
    const h = Math.floor(hours)
    const m = Math.round((hours - h) * 60)
    return m > 0 ? `${h}ч ${m}м` : `${h}ч`
  }

  // ── Mutations ─────────────────────────────────────────────────────────────
  const checkinMutation = useMutation({
    mutationFn: () => TimesheetService.checkin(currentUserId),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['timesheet'] }); toast.success('Смена открыта!') },
    onError: (e: any) => toast.error('Ошибка: ' + (e.response?.data?.message || e.message))
  })
  const checkoutMutation = useMutation({
    mutationFn: () => TimesheetService.checkout(currentUserId),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['timesheet'] }); toast.info('Смена закрыта. Запись сохранена.') },
    onError: (e: any) => toast.error('Ошибка: ' + (e.response?.data?.message || e.message))
  })

  const prevMonth = () => setMonthDate(subMonths(monthDate, 1))
  const nextMonth = () => setMonthDate(addMonths(monthDate, 1))

  const shiftMinutes = differenceInMinutes(new Date(), parseISO(activeShift?.checkinAt ?? new Date().toISOString()))

  return (
    <div className="flex flex-col h-screen bg-[#F7F8FA] overflow-hidden">

      {/* ── Top bar ─────────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-neutral-100 px-8 py-5 flex items-center justify-between flex-shrink-0 shadow-sm">
        <div>
          <h1 className="text-xl font-black text-neutral-900 tracking-tight leading-none">Мои смены</h1>
          <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mt-1">
            Учёт рабочего времени и личный табель
          </p>
        </div>

        {/* Month navigator */}
        <div className="flex items-center bg-neutral-50 rounded-xl border border-neutral-100 overflow-hidden">
          <button onClick={prevMonth} className="h-10 w-10 flex items-center justify-center hover:bg-neutral-100 transition-all text-neutral-500">
            <ChevronLeft size={18} />
          </button>
          <div className="h-10 px-6 flex items-center border-x border-neutral-200">
            <span className="text-[11px] font-black uppercase tracking-widest text-neutral-700 capitalize">
              {format(monthDate, 'LLLL yyyy', { locale: ru })}
            </span>
          </div>
          <button onClick={nextMonth} className="h-10 w-10 flex items-center justify-center hover:bg-neutral-100 transition-all text-neutral-500">
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">

        {/* ── Left panel ──────────────────────────────────────────────── */}
        <div className="w-80 flex-shrink-0 bg-white border-r border-neutral-100 flex flex-col overflow-y-auto custom-scrollbar">

          {/* ── Shift status (read-only for admin) ── */}
          <div className={cn(
            'p-8 border-b border-neutral-100 flex flex-col items-center text-center transition-all',
            activeShift ? 'bg-gradient-to-b from-neutral-950 to-neutral-900 text-white' : 'bg-neutral-50'
          )}>
            {/* Status ring */}
            <div className={cn(
              'relative h-28 w-28 mb-6 flex items-center justify-center rounded-full transition-all duration-700',
              activeShift
                ? 'bg-white/10 shadow-2xl shadow-black/30'
                : 'bg-white border-2 border-neutral-200'
            )}>
              {activeShift && (
                <>
                  <div className="absolute inset-0 rounded-full border-2 border-white/10 animate-ping" style={{ animationDuration: '3s' }} />
                  <div className="absolute inset-2 rounded-full border border-white/10 animate-ping" style={{ animationDuration: '2s' }} />
                </>
              )}
              {activeShift
                ? <CheckCircle2 size={36} className="text-emerald-400" />
                : <AlertCircle size={36} className="text-neutral-400" />
              }
            </div>

            <p className={cn('text-[10px] font-black uppercase tracking-[0.25em] mb-2', activeShift ? 'text-white/50' : 'text-neutral-400')}>
              {activeShift ? 'Смена идёт' : 'Смена не открыта'}
            </p>

            {activeShift ? (
              <>
                <p className="text-4xl font-black text-white tracking-tighter font-mono mb-1">{formatTimer(elapsedTime)}</p>
                <p className="text-[10px] text-white/40 font-bold mb-6">
                  Начало: {format(parseISO(activeShift.checkinAt ?? ''), 'HH:mm')}
                </p>
                {/* Progress bar */}
                <div className="w-full">
                  <div className="flex justify-between text-[8px] font-black text-white/30 mb-1.5">
                    <span>0ч</span>
                    <span>{Math.round(shiftMinutes / 60 * 10) / 10}ч из 8ч</span>
                  </div>
                  <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className={cn('h-full rounded-full transition-all', shiftMinutes >= 480 ? 'bg-emerald-400' : 'bg-white/60')}
                      style={{ width: `${Math.min((shiftMinutes / 480) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              </>
            ) : (
              <p className="text-xs font-bold text-neutral-400 mb-2">Смена не открыта. Флорист должен открыть смену в приложении.</p>
            )}

            {/* Info notice */}
            <div className={cn(
              'mt-4 w-full px-3 py-2 rounded-xl text-[10px] font-bold text-center',
              activeShift ? 'bg-white/10 text-white/50' : 'bg-neutral-100 text-neutral-500'
            )}>
              Управление сменой — функция флориста
            </div>
          </div>

          {/* ── Month stats ─────────────────────────────────────────── */}
          <div className="p-6 border-b border-neutral-50 space-y-4">
            <p className="text-[8px] font-black text-neutral-400 uppercase tracking-widest">Итоги месяца</p>

            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: Clock, label: 'Всего часов', value: totalHours.toFixed(1), sub: 'ч' },
                { icon: Calendar, label: 'Смен', value: entries.length, sub: 'шт' },
                { icon: Timer, label: 'Ср. смена', value: avgHours.toFixed(1), sub: 'ч' },
                { icon: TrendingUp, label: 'Явка', value: `${attendancePct}`, sub: '%' },
              ].map(({ icon: Icon, label, value, sub }) => (
                <div key={label} className="bg-neutral-50 rounded-2xl p-4 border border-neutral-100">
                  <div className="flex items-center gap-1.5 mb-2">
                    <Icon size={12} className="text-neutral-400" />
                    <p className="text-[7px] font-black text-neutral-400 uppercase tracking-widest">{label}</p>
                  </div>
                  <p className="text-xl font-black text-neutral-900 leading-none">
                    {value}<span className="text-xs font-bold text-neutral-400 ml-1">{sub}</span>
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* ── Heatmap ─────────────────────────────────────────────── */}
          <div className="p-6 border-t border-neutral-50">
            <p className="text-[8px] font-black text-neutral-400 uppercase tracking-widest mb-4">Активность</p>
            <MonthHeatmap entries={entries} monthDate={monthDate} />
          </div>
        </div>

        {/* ── Right: history table ─────────────────────────────────── */}
        <div className="flex-1 overflow-auto custom-scrollbar p-8" >
          <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-neutral-50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <History size={16} className="text-neutral-400" />
                <h3 className="text-sm font-black text-neutral-900">Журнал смен</h3>
                <span className="px-2 py-0.5 bg-neutral-100 rounded text-[9px] font-black text-neutral-500">{entries.length}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded bg-neutral-900" />
                  <span className="text-[8px] font-black text-neutral-400">8ч+</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded bg-neutral-400" />
                  <span className="text-[8px] font-black text-neutral-400">4–8ч</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded bg-neutral-200" />
                  <span className="text-[8px] font-black text-neutral-400">&#60;4ч</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="flex h-2 w-2"><span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-emerald-400 opacity-75"/><span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"/></span>
                  <span className="text-[8px] font-black text-neutral-400">Активна</span>
                </div>
              </div>
            </div>

            {isLoading ? (
              <div className="py-24 flex flex-col items-center gap-4">
                <Loader2 className="animate-spin text-neutral-200" size={40} />
                <p className="text-[10px] font-black text-neutral-300 uppercase tracking-widest">Загрузка записей...</p>
              </div>
            ) : sorted.length === 0 ? (
              <div className="py-24 flex flex-col items-center gap-4">
                <div className="h-16 w-16 rounded-2xl bg-neutral-50 flex items-center justify-center">
                  <BarChart3 size={24} className="text-neutral-200" />
                </div>
                <p className="text-sm font-black text-neutral-300">Смен за этот месяц нет</p>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-neutral-50 bg-neutral-50/30">
                    <th className="px-6 py-4 text-[9px] font-black text-neutral-400 uppercase tracking-wider text-left">Дата</th>
                    <th className="px-6 py-4 text-[9px] font-black text-neutral-400 uppercase tracking-wider text-left">Начало</th>
                    <th className="px-6 py-4 text-[9px] font-black text-neutral-400 uppercase tracking-wider text-left">Конец</th>
                    <th className="px-6 py-4 text-[9px] font-black text-neutral-400 uppercase tracking-wider text-left">Итого</th>
                    <th className="px-6 py-4 text-[9px] font-black text-neutral-400 uppercase tracking-wider text-center">Оценка</th>
                    <th className="px-6 py-4 text-[9px] font-black text-neutral-400 uppercase tracking-wider text-left">Статус</th>
                  </tr>
                </thead>
                <tbody>
                  {sorted.map((entry, idx) => {
                    const isActive = !entry.checkoutAt
                    const hours = entry.hoursWorked || 0
                    const quality = hours >= 8 ? 'great' : hours >= 4 ? 'good' : hours > 0 ? 'short' : 'active'

                    return (
                      <tr
                        key={entry.id}
                        className={cn(
                          'border-b border-neutral-50 hover:bg-neutral-50/40 transition-colors',
                          idx % 2 === 1 ? 'bg-neutral-50/20' : 'bg-white',
                          isActive && 'bg-emerald-50/30 hover:bg-emerald-50/50'
                        )}
                      >
                        {/* Date */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              'w-1.5 h-8 rounded-full flex-shrink-0',
                              isActive ? 'bg-emerald-400' :
                              quality === 'great' ? 'bg-neutral-900' :
                              quality === 'good' ? 'bg-neutral-400' : 'bg-neutral-200'
                            )} />
                            <div>
                              <p className="text-sm font-black text-neutral-900">
                                {format(parseISO(entry.date), 'd MMMM', { locale: ru })}
                              </p>
                              <p className="text-[9px] font-bold text-neutral-400 capitalize">
                                {format(parseISO(entry.date), 'EEEE', { locale: ru })}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Check-in */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="h-7 w-7 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0">
                              <Sun size={14} className="text-amber-500" />
                            </div>
                            <span className="text-sm font-black text-neutral-900">
                              {format(parseISO(entry.checkinAt ?? ''), 'HH:mm')}
                            </span>
                          </div>
                        </td>

                        {/* Check-out */}
                        <td className="px-6 py-4">
                          {entry.checkoutAt ? (
                            <div className="flex items-center gap-2">
                              <div className="h-7 w-7 rounded-lg bg-sky-50 flex items-center justify-center flex-shrink-0">
                                <Moon size={14} className="text-sky-500" />
                              </div>
                              <span className="text-sm font-black text-neutral-900">
                                {format(parseISO(entry.checkoutAt), 'HH:mm')}
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <span className="flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-emerald-400 opacity-75" />
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                              </span>
                              <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">В процессе</span>
                            </div>
                          )}
                        </td>

                        {/* Duration */}
                        <td className="px-6 py-4">
                          {isActive ? (
                            <span className="text-sm font-black text-emerald-600">{formatTimer(elapsedTime)}</span>
                          ) : (
                            <span className="text-sm font-black text-neutral-900">{formatDur(entry.hoursWorked)}</span>
                          )}
                        </td>

                        {/* Quality bar */}
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-16 h-2 bg-neutral-100 rounded-full overflow-hidden">
                              <div
                                className={cn(
                                  'h-full rounded-full',
                                  quality === 'great' ? 'bg-neutral-900' :
                                  quality === 'good' ? 'bg-neutral-400' : 'bg-neutral-200'
                                )}
                                style={{ width: `${Math.min((hours / 8) * 100, 100)}%` }}
                              />
                            </div>
                            <span className="text-[9px] font-black text-neutral-400 w-8">{hours > 0 ? `${hours.toFixed(0)}ч` : '—'}</span>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4">
                          {isActive ? (
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-lg">
                              <CheckCircle2 size={12} />
                              <span className="text-[9px] font-black uppercase tracking-widest">Открыта</span>
                            </div>
                          ) : (
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-neutral-50 border border-neutral-100 text-neutral-400 rounded-lg">
                              <AlertCircle size={12} />
                              <span className="text-[9px] font-black uppercase tracking-widest">Закрыта</span>
                            </div>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
