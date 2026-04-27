import { useState, useMemo } from 'react'
import {
  Banknote,
  Plus,
  Loader2,
  CheckCircle2,
  TrendingUp,
  CreditCard,
  UserCircle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Download,
  Filter,
  Search,
  X,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  Clock,
  Wallet,
  FileText,
  Pencil
} from 'lucide-react'
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'
import { SalaryService, EmployeeService, Employee, SalaryStatement } from '@/lib/api'
import { cn } from '@/lib/utils'
import { format, subMonths, addMonths, parseISO } from 'date-fns'
import { ru } from 'date-fns/locale'
import { toast } from 'sonner'

// ─────────────────────────────────────────────────────────────────────────────
// Status config
// ─────────────────────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  DRAFT:    { label: 'Черновик',   bg: 'bg-neutral-50',  text: 'text-neutral-500', border: 'border-neutral-200', dot: 'bg-neutral-400', step: 1 },
  APPROVED: { label: 'Утверждено', bg: 'bg-sky-50',      text: 'text-sky-700',     border: 'border-sky-200',     dot: 'bg-sky-500',     step: 2 },
  PAID:     { label: 'Выплачено',  bg: 'bg-emerald-50',  text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500', step: 3 },
}

// ─────────────────────────────────────────────────────────────────────────────
// Statement Detail Drawer
// ─────────────────────────────────────────────────────────────────────────────
function StatementDrawer({
  statement,
  employee,
  onClose,
  onApprove,
  onPay,
  onAdjust
}: {
  statement: SalaryStatement
  employee?: Employee
  onClose: () => void
  onApprove: () => void
  onPay: () => void
  onAdjust: (bonus: number, deduction: number) => void
}) {
  const [bonusInput, setBonusInput] = useState('')
  const [deductionInput, setDeductionInput] = useState('')
  const [showAdjust, setShowAdjust] = useState(false)
  const status = STATUS_CONFIG[(statement.status as keyof typeof STATUS_CONFIG)] ?? STATUS_CONFIG.DRAFT
  const totalBonus = (statement as any).salesBonus || (statement as any).orderBonus || (statement as any).manualBonus
    ? ((statement as any).salesBonus || 0) + ((statement as any).orderBonus || 0) + ((statement as any).manualBonus || 0)
    : 0
  const deductions = (statement as any).deductions || 0

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose} />
      <div className="relative ml-auto w-[520px] h-full bg-white shadow-2xl flex flex-col animate-in slide-in-from-right-8 duration-300">
        {/* Header */}
        <div className="p-8 border-b border-neutral-100 flex items-start justify-between">
          <div>
            <p className="text-[9px] font-black text-neutral-400 uppercase tracking-widest mb-2">Расчётный лист</p>
            <h2 className="text-2xl font-black text-neutral-900 tracking-tight leading-none">
              {statement.period}
            </h2>
          </div>
          <button onClick={onClose} className="h-10 w-10 rounded-xl bg-neutral-50 hover:bg-neutral-100 flex items-center justify-center text-neutral-400 hover:text-neutral-900 transition-all">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-6">
          {/* Employee */}
          {employee && (
            <div className="flex items-center gap-4 p-5 bg-neutral-50 rounded-2xl border border-neutral-100">
              <div className="h-12 w-12 rounded-xl bg-white border border-neutral-200 flex items-center justify-center">
                <UserCircle size={24} className="text-neutral-400" />
              </div>
              <div>
                <p className="text-sm font-black text-neutral-900">{employee.firstName} {employee.lastName}</p>
                <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">{employee.role}</p>
              </div>
              <div className={cn('ml-auto px-3 py-1.5 rounded-xl border text-[9px] font-black uppercase tracking-widest flex items-center gap-2', status.bg, status.text, status.border)}>
                <div className={cn('w-1.5 h-1.5 rounded-full', status.dot)} />
                {status.label}
              </div>
            </div>
          )}

          {/* Workflow progress */}
          <div className="flex items-center gap-2 px-2">
            {['Черновик', 'Утверждено', 'Выплачено'].map((s, i) => {
              const stepNum = i + 1
              const current = status.step
              return (
                <div key={s} className="flex items-center gap-2 flex-1">
                  <div className={cn(
                    'flex flex-col items-center gap-1 flex-1',
                  )}>
                    <div className={cn(
                      'h-8 w-8 rounded-full flex items-center justify-center text-[11px] font-black transition-all',
                      stepNum < current ? 'bg-emerald-500 text-white' :
                      stepNum === current ? 'bg-neutral-900 text-white' :
                      'bg-neutral-100 text-neutral-400'
                    )}>
                      {stepNum < current ? <CheckCircle2 size={16} /> : stepNum}
                    </div>
                    <span className={cn('text-[8px] font-black uppercase tracking-widest', stepNum === current ? 'text-neutral-900' : 'text-neutral-400')}>{s}</span>
                  </div>
                  {i < 2 && <div className={cn('h-0.5 flex-1 mb-5 rounded-full transition-all', stepNum < current ? 'bg-emerald-500' : 'bg-neutral-100')} />}
                </div>
              )
            })}
          </div>

          {/* Breakdown */}
          <div className="bg-white rounded-2xl border border-neutral-100 overflow-hidden">
            <div className="px-6 py-4 bg-neutral-50/50 border-b border-neutral-100">
              <p className="text-[9px] font-black text-neutral-500 uppercase tracking-widest">Структура начисления</p>
            </div>
            <div className="divide-y divide-neutral-50">
              {[
                { label: 'Оклад (база)', value: (statement as any).baseSalary || 0, icon: Wallet, color: 'text-neutral-700' },
                { label: 'Бонус с продаж', value: (statement as any).salesBonus || 0, icon: TrendingUp, color: 'text-emerald-500' },
                { label: 'Бонус за заказы', value: (statement as any).orderBonus || 0, icon: BarChart3, color: 'text-sky-500' },
                { label: 'Ручные надбавки', value: (statement as any).manualBonus || 0, icon: ArrowUpRight, color: 'text-violet-500' },
                { label: 'Удержания / штрафы', value: -(deductions), icon: ArrowDownRight, color: 'text-red-500' },
              ].map(row => (
                <div key={row.label} className="flex items-center justify-between px-6 py-4 hover:bg-neutral-50/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={cn('h-8 w-8 rounded-lg bg-neutral-50 flex items-center justify-center', row.color)}>
                      <row.icon size={16} />
                    </div>
                    <span className="text-sm font-bold text-neutral-600">{row.label}</span>
                  </div>
                  <span className={cn('text-sm font-black', row.value < 0 ? 'text-red-500' : row.value > 0 ? 'text-neutral-900' : 'text-neutral-300')}>
                    {row.value !== 0 ? `${row.value > 0 ? '+' : ''}${row.value.toLocaleString()} ₽` : '—'}
                  </span>
                </div>
              ))}

              {/* Total */}
              <div className="flex items-center justify-between px-6 py-5 bg-neutral-900">
                <span className="text-[10px] font-black text-white/60 uppercase tracking-widest">ИТОГО К ВЫПЛАТЕ</span>
                <span className="text-2xl font-black text-white tracking-tighter">{(statement.totalPayout || 0).toLocaleString()} ₽</span>
              </div>
            </div>
          </div>

          {/* Adjustments section */}
          <div>
            <button
              onClick={() => setShowAdjust(!showAdjust)}
              className="w-full flex items-center justify-between p-5 bg-neutral-50 rounded-2xl border border-neutral-100 hover:border-neutral-300 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-white border border-neutral-200 flex items-center justify-center">
                  <Pencil size={14} className="text-neutral-400" />
                </div>
                <span className="text-[10px] font-black text-neutral-600 uppercase tracking-widest">Ручные корректировки</span>
              </div>
              <ChevronDown size={16} className={cn('text-neutral-400 transition-transform', showAdjust && 'rotate-180')} />
            </button>

            {showAdjust && (
              <div className="mt-3 p-5 bg-white rounded-2xl border border-neutral-200 space-y-4 animate-in slide-in-from-top-2 duration-200">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[8px] font-black text-neutral-500 uppercase tracking-widest">Надбавка (₽)</label>
                    <input
                      type="number"
                      value={bonusInput}
                      onChange={e => setBonusInput(e.target.value)}
                      placeholder="0"
                      className="w-full h-11 px-4 bg-neutral-50 border border-neutral-200 rounded-xl text-sm font-bold outline-none focus:border-emerald-500 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[8px] font-black text-neutral-500 uppercase tracking-widest">Удержание (₽)</label>
                    <input
                      type="number"
                      value={deductionInput}
                      onChange={e => setDeductionInput(e.target.value)}
                      placeholder="0"
                      className="w-full h-11 px-4 bg-neutral-50 border border-neutral-200 rounded-xl text-sm font-bold outline-none focus:border-red-500 transition-all"
                    />
                  </div>
                </div>
                <button
                  onClick={() => {
                    onAdjust(Number(bonusInput) || 0, Number(deductionInput) || 0)
                    setBonusInput('')
                    setDeductionInput('')
                    setShowAdjust(false)
                  }}
                  className="w-full h-11 bg-neutral-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all active:scale-95"
                >
                  Применить корректировку
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-6 border-t border-neutral-100 space-y-3">
          {statement.status === 'DRAFT' && (
            <button
              onClick={onApprove}
              className="w-full h-14 bg-sky-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-sky-700 transition-all flex items-center justify-center gap-3 active:scale-95 shadow-lg shadow-sky-500/20"
            >
              <CheckCircle2 size={18} />
              Утвердить ведомость
            </button>
          )}
          {statement.status === 'APPROVED' && (
            <button
              onClick={onPay}
              className="w-full h-14 bg-emerald-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all flex items-center justify-center gap-3 active:scale-95 shadow-lg shadow-emerald-500/20"
            >
              <CreditCard size={18} />
              Зафиксировать выплату
            </button>
          )}
          {statement.status === 'PAID' && (
            <div className="h-14 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center justify-center gap-3">
              <CheckCircle2 size={18} className="text-emerald-500" />
              <span className="text-[11px] font-black text-emerald-700 uppercase tracking-widest">Выплата произведена</span>
            </div>
          )}
          <button className="w-full h-11 bg-neutral-50 border border-neutral-200 text-neutral-500 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-neutral-100 hover:text-neutral-900 transition-all flex items-center justify-center gap-2">
            <Download size={14} />
            Скачать PDF
          </button>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────────────────────
export default function SalariesPage() {
  const queryClient = useQueryClient()
  const [periodDate, setPeriodDate] = useState(new Date())
  const period = format(periodDate, 'yyyy-MM')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [selectedStatement, setSelectedStatement] = useState<SalaryStatement | null>(null)

  // ── Data fetching ────────────────────────────────────────────────────────
  const { data: statementsRes, isLoading: stmtLoading } = useQuery({
    queryKey: ['salary-statements', period],
    queryFn: () => SalaryService.getStatements({ period }).then(res => res.data)
  })

  const { data: employeesRes, isLoading: empLoading } = useQuery({
    queryKey: ['employees-all'],
    queryFn: () => EmployeeService.getAll().then(res => {
      const d = res.data as any
      return (d.data || d.content || d || []) as Employee[]
    })
  })

  const statements = statementsRes?.data || []
  const employees = employeesRes || []
  const isLoading = stmtLoading || empLoading

  const getEmployee = (id: string) => employees.find(e => e.id === id || e.userId === id)

  // ── Mutations ────────────────────────────────────────────────────────────
  const calculateMutation = useMutation({
    mutationFn: ({ employeeId, periodStr }: { employeeId: string; periodStr: string }) =>
      SalaryService.calculate({ employeeId, period: periodStr }),
    onSuccess: () => { toast.success('Расчёт выполнен'); queryClient.invalidateQueries({ queryKey: ['salary-statements'] }) },
    onError: (e: any) => toast.error('Ошибка: ' + (e.response?.data?.message || e.message))
  })

  const approveMutation = useMutation({
    mutationFn: (id: string) => SalaryService.approve(id),
    onSuccess: () => { toast.success('Ведомость утверждена'); queryClient.invalidateQueries({ queryKey: ['salary-statements'] }); setSelectedStatement(null) }
  })

  const payMutation = useMutation({
    mutationFn: (id: string) => SalaryService.paid(id),
    onSuccess: () => { toast.success('Выплата зафиксирована'); queryClient.invalidateQueries({ queryKey: ['salary-statements'] }); setSelectedStatement(null) }
  })

  const adjustMutation = useMutation({
    mutationFn: ({ id, bonus, deduction }: { id: string; bonus: number; deduction: number }) =>
      SalaryService.adjust(id, { manualBonus: bonus, deductions: deduction }),
    onSuccess: () => { toast.success('Корректировка применена'); queryClient.invalidateQueries({ queryKey: ['salary-statements'] }) }
  })

  // ── Aggregates ───────────────────────────────────────────────────────────
  const totalPending = statements.filter((s: any) => s.status !== 'PAID').reduce((sum: number, s: any) => sum + (s.totalPayout || 0), 0)
  const totalPaid = statements.filter((s: any) => s.status === 'PAID').reduce((sum: number, s: any) => sum + (s.totalPayout || 0), 0)
  const totalBonus = statements.reduce((sum: number, s: any) => sum + ((s.salesBonus || 0) + (s.orderBonus || 0) + (s.manualBonus || 0)), 0)
  const pendingApproval = statements.filter((s: any) => s.status === 'DRAFT').length
  const approvedCount = statements.filter((s: any) => s.status === 'APPROVED').length

  // ── Filter ───────────────────────────────────────────────────────────────
  const filtered = useMemo(() => statements.filter((s: any) => {
    const emp = getEmployee(s.employeeId)
    const name = `${emp?.firstName || ''} ${emp?.lastName || ''}`.toLowerCase()
    const matchSearch = !searchQuery || name.includes(searchQuery.toLowerCase())
    const matchStatus = !filterStatus || s.status === filterStatus
    return matchSearch && matchStatus
  }), [statements, searchQuery, filterStatus, employees])

  const prevPeriod = () => setPeriodDate(subMonths(periodDate, 1))
  const nextPeriod = () => setPeriodDate(addMonths(periodDate, 1))

  return (
    <div className="flex flex-col h-screen bg-[#F7F8FA] overflow-hidden">

      {/* ── Top Bar ─────────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-neutral-100 px-8 py-5 flex items-center justify-between flex-shrink-0 shadow-sm">
        <div className="flex items-center gap-6">
          <div>
            <h1 className="text-xl font-black text-neutral-900 tracking-tight leading-none">Расчёт зарплат</h1>
            <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mt-1">
              Управление выплатами, начислениями и бонусами
            </p>
          </div>

          {/* Period navigator */}
          <div className="flex items-center bg-neutral-50 rounded-xl border border-neutral-100 overflow-hidden">
            <button onClick={prevPeriod} className="h-10 w-10 flex items-center justify-center hover:bg-neutral-100 transition-all text-neutral-500">
              <ChevronLeft size={18} />
            </button>
            <div className="h-10 px-6 flex items-center border-x border-neutral-200">
              <span className="text-[11px] font-black uppercase tracking-widest text-neutral-700 capitalize">
                {format(periodDate, 'LLLL yyyy', { locale: ru })}
              </span>
            </div>
            <button onClick={nextPeriod} className="h-10 w-10 flex items-center justify-center hover:bg-neutral-100 transition-all text-neutral-500">
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
              className="w-52 h-10 pl-10 pr-4 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-bold outline-none focus:border-neutral-500 focus:bg-white transition-all"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-300 hover:text-neutral-600">
                <X size={14} />
              </button>
            )}
          </div>

          {/* Status filter */}
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="h-10 px-4 bg-neutral-50 border border-neutral-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-neutral-600 appearance-none outline-none min-w-[140px]"
          >
            <option value="">Все статусы</option>
            {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>

          <div className="w-px h-6 bg-neutral-100" />

          <button
            onClick={() => {
              // Calculate for all active employees (iterative, one by one)
              employees.forEach(emp => {
                if (emp.id) calculateMutation.mutate({ employeeId: emp.id, periodStr: period })
              })
            }}
            disabled={calculateMutation.isPending}
            className="h-10 px-5 bg-neutral-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all flex items-center gap-2 shadow-lg shadow-black/10 active:scale-95 disabled:opacity-50"
          >
            {calculateMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
            Рассчитать период
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto custom-scrollbar">
        <div className="p-8 space-y-8">

          {/* ── KPI Cards ──────────────────────────────────────────────── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Total to pay */}
            <div className="bg-white rounded-2xl border border-neutral-100 p-6 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                  <Banknote size={20} className="text-emerald-500" />
                </div>
                <ArrowUpRight size={16} className="text-neutral-300 group-hover:text-emerald-500 transition-colors" />
              </div>
              <p className="text-[9px] font-black text-neutral-400 uppercase tracking-widest mb-1">К выплате</p>
              <p className="text-2xl font-black text-neutral-900 tracking-tighter">{totalPending.toLocaleString()} ₽</p>
              <p className="text-[9px] font-bold text-neutral-300 mt-1">За {format(periodDate, 'LLLL', { locale: ru })}</p>
            </div>

            {/* Paid */}
            <div className="bg-white rounded-2xl border border-neutral-100 p-6 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="h-10 w-10 rounded-xl bg-sky-50 flex items-center justify-center">
                  <CheckCircle2 size={20} className="text-sky-500" />
                </div>
                <ArrowUpRight size={16} className="text-neutral-300 group-hover:text-sky-500 transition-colors" />
              </div>
              <p className="text-[9px] font-black text-neutral-400 uppercase tracking-widest mb-1">Выплачено</p>
              <p className="text-2xl font-black text-neutral-900 tracking-tighter">{totalPaid.toLocaleString()} ₽</p>
              <p className="text-[9px] font-bold text-neutral-300 mt-1">{statements.filter((s: any) => s.status === 'PAID').length} ведомостей</p>
            </div>

            {/* Bonuses */}
            <div className="bg-white rounded-2xl border border-neutral-100 p-6 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="h-10 w-10 rounded-xl bg-violet-50 flex items-center justify-center">
                  <TrendingUp size={20} className="text-violet-500" />
                </div>
                <ArrowUpRight size={16} className="text-neutral-300 group-hover:text-violet-500 transition-colors" />
              </div>
              <p className="text-[9px] font-black text-neutral-400 uppercase tracking-widest mb-1">Бонусов начислено</p>
              <p className="text-2xl font-black text-neutral-900 tracking-tighter">{totalBonus.toLocaleString()} ₽</p>
              <p className="text-[9px] font-bold text-neutral-300 mt-1">Включая продажи</p>
            </div>

            {/* Pending/Alerts */}
            <div className={cn(
              'rounded-2xl border p-6 shadow-sm relative overflow-hidden group hover:shadow-md transition-all',
              pendingApproval > 0 ? 'bg-amber-50 border-amber-100' : 'bg-white border-neutral-100'
            )}>
              <div className="flex items-center justify-between mb-4">
                <div className={cn('h-10 w-10 rounded-xl flex items-center justify-center', pendingApproval > 0 ? 'bg-amber-100' : 'bg-neutral-50')}>
                  <AlertTriangle size={20} className={pendingApproval > 0 ? 'text-amber-500' : 'text-neutral-400'} />
                </div>
              </div>
              <p className="text-[9px] font-black text-neutral-400 uppercase tracking-widest mb-1">Ожидают действий</p>
              <p className="text-2xl font-black text-neutral-900 tracking-tighter">{pendingApproval + approvedCount}</p>
              <p className="text-[9px] font-bold text-neutral-400 mt-1">{pendingApproval} черновиков · {approvedCount} утверждённых</p>
            </div>
          </div>

          {/* ── Pipeline Progress ──────────────────────────────────────── */}
          <div className="bg-white rounded-2xl border border-neutral-100 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <p className="text-[9px] font-black text-neutral-500 uppercase tracking-widest">Прогресс выплат за период</p>
              <p className="text-[9px] font-bold text-neutral-400">
                {statements.length} ведомостей всего
              </p>
            </div>
            <div className="flex gap-1 h-3 rounded-full overflow-hidden">
              {statements.length > 0 ? (
                <>
                  <div
                    className="bg-neutral-200 transition-all"
                    style={{ width: `${(statements.filter((s: any) => s.status === 'DRAFT').length / statements.length) * 100}%` }}
                  />
                  <div
                    className="bg-sky-400 transition-all"
                    style={{ width: `${(statements.filter((s: any) => s.status === 'APPROVED').length / statements.length) * 100}%` }}
                  />
                  <div
                    className="bg-emerald-500 transition-all"
                    style={{ width: `${(statements.filter((s: any) => s.status === 'PAID').length / statements.length) * 100}%` }}
                  />
                </>
              ) : (
                <div className="bg-neutral-100 w-full" />
              )}
            </div>
            <div className="flex items-center gap-6 mt-3">
              {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                <div key={k} className="flex items-center gap-2">
                  <div className={cn('w-2 h-2 rounded-full', v.dot)} />
                  <span className="text-[9px] font-black text-neutral-500">{v.label} · {statements.filter((s: any) => s.status === k).length}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Main table ─────────────────────────────────────────────── */}
          <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-neutral-50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText size={16} className="text-neutral-400" />
                <h3 className="text-sm font-black text-neutral-900">Ведомости</h3>
                <span className="px-2 py-0.5 bg-neutral-100 rounded text-[9px] font-black text-neutral-500">{filtered.length}</span>
              </div>
              <button className="flex items-center gap-2 text-[9px] font-black text-neutral-400 hover:text-neutral-900 uppercase tracking-widest transition-colors">
                <Download size={14} />
                Экспорт
              </button>
            </div>

            {isLoading ? (
              <div className="py-24 flex flex-col items-center gap-4">
                <Loader2 className="animate-spin text-neutral-200" size={40} />
                <p className="text-[10px] font-black text-neutral-300 uppercase tracking-widest">Загрузка ведомостей...</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="py-24 flex flex-col items-center gap-4">
                <div className="h-16 w-16 rounded-2xl bg-neutral-50 flex items-center justify-center">
                  <FileText size={24} className="text-neutral-200" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-black text-neutral-300">Ведомостей нет</p>
                  <p className="text-[10px] font-bold text-neutral-200 mt-1">
                    {statements.length === 0 ? 'Нажмите «Рассчитать период»' : 'Попробуйте изменить фильтры'}
                  </p>
                </div>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-neutral-50 bg-neutral-50/30">
                    <th className="px-6 py-4 text-[9px] font-black text-neutral-400 uppercase tracking-wider text-left">Сотрудник</th>
                    <th className="px-6 py-4 text-[9px] font-black text-neutral-400 uppercase tracking-wider text-left">Период</th>
                    <th className="px-6 py-4 text-[9px] font-black text-neutral-400 uppercase tracking-wider text-right">Оклад</th>
                    <th className="px-6 py-4 text-[9px] font-black text-neutral-400 uppercase tracking-wider text-right">Бонусы</th>
                    <th className="px-6 py-4 text-[9px] font-black text-neutral-400 uppercase tracking-wider text-right">Итого</th>
                    <th className="px-6 py-4 text-[9px] font-black text-neutral-400 uppercase tracking-wider text-center">Статус</th>
                    <th className="px-6 py-4" />
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((s: any, idx: number) => {
                    const emp = getEmployee(s.employeeId)
                    const status = STATUS_CONFIG[s.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.DRAFT
                    const bonus = (s.salesBonus || 0) + (s.orderBonus || 0) + (s.manualBonus || 0)

                    return (
                      <tr
                        key={s.id}
                        className={cn(
                          'border-b border-neutral-50 hover:bg-neutral-50/40 transition-colors cursor-pointer group',
                          idx % 2 === 1 ? 'bg-neutral-50/20' : 'bg-white'
                        )}
                        onClick={() => setSelectedStatement(s)}
                      >
                        {/* Employee */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-neutral-100 flex items-center justify-center flex-shrink-0 group-hover:bg-neutral-200 transition-all">
                              <UserCircle size={20} className="text-neutral-400" />
                            </div>
                            <div>
                              <p className="text-sm font-black text-neutral-900">
                                {emp ? `${emp.firstName} ${emp.lastName}` : s.employeeId?.slice(0, 8) + '…'}
                              </p>
                              {emp && (
                                <p className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest">{emp.role}</p>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Period */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Clock size={12} className="text-neutral-300" />
                            <span className="text-[10px] font-black text-neutral-600 capitalize">
                              {s.period}
                            </span>
                          </div>
                        </td>

                        {/* Base salary */}
                        <td className="px-6 py-4 text-right">
                          <span className="text-sm font-bold text-neutral-700">{(s.baseSalary || 0).toLocaleString()} ₽</span>
                        </td>

                        {/* Bonus */}
                        <td className="px-6 py-4 text-right">
                          {bonus > 0 ? (
                            <span className="text-sm font-black text-emerald-600">+{bonus.toLocaleString()} ₽</span>
                          ) : (
                            <span className="text-sm text-neutral-300">—</span>
                          )}
                        </td>

                        {/* Total */}
                        <td className="px-6 py-4 text-right">
                          <span className="text-sm font-black text-neutral-900">{(s.totalPayout || 0).toLocaleString()} ₽</span>
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4">
                          <div className="flex justify-center">
                            <div className={cn(
                              'flex items-center gap-2 px-3 py-1.5 rounded-lg border text-[9px] font-black uppercase tracking-widest',
                              status.bg, status.text, status.border
                            )}>
                              <div className={cn('w-1.5 h-1.5 rounded-full', status.dot)} />
                              {status.label}
                            </div>
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            {s.status === 'DRAFT' && (
                              <button
                                onClick={e => { e.stopPropagation(); approveMutation.mutate(s.id) }}
                                className="h-8 px-4 bg-sky-500 text-white rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-sky-600 transition-all active:scale-95"
                              >
                                Утвердить
                              </button>
                            )}
                            {s.status === 'APPROVED' && (
                              <button
                                onClick={e => { e.stopPropagation(); payMutation.mutate(s.id) }}
                                className="h-8 px-4 bg-emerald-500 text-white rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all active:scale-95"
                              >
                                Оплатить
                              </button>
                            )}
                            <ChevronDown size={16} className="text-neutral-300 group-hover:text-neutral-900 transition-colors rotate-[-90deg]" />
                          </div>
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

      {/* ── Statement Detail Drawer ──────────────────────────────────────── */}
      {selectedStatement && (
        <StatementDrawer
          statement={selectedStatement}
          employee={getEmployee((selectedStatement as any).employeeId)}
          onClose={() => setSelectedStatement(null)}
          onApprove={() => approveMutation.mutate(selectedStatement.id!)}
          onPay={() => payMutation.mutate(selectedStatement.id!)}
          onAdjust={(bonus, deduction) => adjustMutation.mutate({ id: selectedStatement.id!, bonus, deduction })}
        />
      )}
    </div>
  )
}
