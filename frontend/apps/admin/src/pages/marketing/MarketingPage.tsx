import { useState } from 'react'
import {
  Mail,
  MessageSquare,
  Send,
  Plus,
  Loader2,
  Bell,
  Search,
  Pencil,
  CheckCircle2,
  XCircle,
  ChevronRight,
  Activity,
  Filter,
  X,
  MoreVertical,
  Users
} from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { NotificationTemplate, NotificationService, NotificationLog, CustomerService, CustomerSummary } from '@/lib/api'
import { TemplateEditModal } from '@/components/marketing/TemplateEditModal'
import { SendBlastModal } from '@/components/marketing/SendBlastModal'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { toast } from 'sonner'

// ─────────────────────────────────────────────────────────────────────────────
// Template Row
// ─────────────────────────────────────────────────────────────────────────────
function TemplateRow({ template, onEdit, idx }: {
  template: NotificationTemplate; onEdit: () => void; idx: number
}) {
  const [menuOpen, setMenuOpen] = useState(false)
  const queryClient = useQueryClient()

  const toggleMutation = useMutation({
    mutationFn: () => template.isActive
      ? NotificationService.deactivateTemplate(template.id!)
      : NotificationService.activateTemplate(template.id!),
    onSuccess: () => {
      toast.success(template.isActive ? 'Шаблон отключён' : 'Шаблон активирован')
      queryClient.invalidateQueries({ queryKey: ['notification-templates'] })
    },
    onError: () => toast.error('Ошибка изменения статуса')
  })

  return (
    <div className={cn(
      'grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-neutral-50/60 transition-colors group',
      idx % 2 === 1 ? 'bg-neutral-50/20' : 'bg-white'
    )}>
      {/* Channel icon */}
      <div className="col-span-1 flex items-center justify-center">
        <div className={cn('h-9 w-9 rounded-xl flex items-center justify-center flex-shrink-0',
          template.channel === 'EMAIL' ? 'bg-sky-50 border border-sky-100' : 'bg-violet-50 border border-violet-100'
        )}>
          {template.channel === 'EMAIL'
            ? <Mail size={16} className="text-sky-500" />
            : <MessageSquare size={16} className="text-violet-500" />
          }
        </div>
      </div>

      {/* Code */}
      <div className="col-span-2">
        <p className="text-xs font-black text-neutral-900 truncate">{template.code}</p>
        <p className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest mt-0.5">{template.channel}</p>
      </div>

      {/* Subject */}
      <div className="col-span-3">
        <p className="text-xs font-bold text-neutral-600 truncate">{template.subject || '—'}</p>
      </div>

      {/* Body preview */}
      <div className="col-span-4">
        <p className="text-[10px] font-bold text-neutral-400 truncate">{template.bodyTemplate || '—'}</p>
      </div>

      {/* Status */}
      <div className="col-span-1 flex justify-center">
        {template.isActive ? (
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Активен</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-neutral-300" />
            <span className="text-[9px] font-black text-neutral-400 uppercase tracking-widest">Откл.</span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="col-span-1 flex items-center justify-end gap-2" onClick={e => e.stopPropagation()}>
        <button onClick={onEdit}
          className="h-8 w-8 rounded-lg bg-neutral-50 border border-neutral-200 flex items-center justify-center text-neutral-400 hover:bg-neutral-900 hover:text-white hover:border-neutral-900 transition-all">
          <Pencil size={12} />
        </button>

        <div className="relative">
          <button onClick={() => setMenuOpen(!menuOpen)}
            className="h-8 w-8 rounded-lg bg-neutral-50 border border-neutral-200 flex items-center justify-center text-neutral-400 hover:bg-neutral-100 transition-all">
            <MoreVertical size={12} />
          </button>
          {menuOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 top-10 z-50 bg-white rounded-xl shadow-xl border border-neutral-100 py-1.5 w-40 animate-in zoom-in-95 duration-150 origin-top-right">
                <button onClick={() => { setMenuOpen(false); toggleMutation.mutate() }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-neutral-700 hover:bg-neutral-50">
                  {template.isActive ? <XCircle size={13} className="text-red-400" /> : <CheckCircle2 size={13} className="text-emerald-400" />}
                  {template.isActive ? 'Отключить' : 'Активировать'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Log Row
// ─────────────────────────────────────────────────────────────────────────────
function LogRow({ log, idx }: { log: NotificationLog; idx: number }) {
  const statusConfig = {
    SENT: { label: 'Отправлено', color: 'text-emerald-600', dot: 'bg-emerald-500' },
    FAILED: { label: 'Ошибка', color: 'text-red-500', dot: 'bg-red-500' },
    PENDING: { label: 'В очереди', color: 'text-amber-500', dot: 'bg-amber-500' },
  }[log.status || 'PENDING'] ?? { label: log.status || '—', color: 'text-neutral-400', dot: 'bg-neutral-300' }

  return (
    <div className={cn(
      'grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-neutral-50/60 transition-colors',
      idx % 2 === 1 ? 'bg-neutral-50/20' : 'bg-white'
    )}>
      <div className="col-span-1 flex justify-center">
        {(log.channel || '') === 'EMAIL'
          ? <Mail size={15} className="text-sky-400" />
          : <MessageSquare size={15} className="text-violet-400" />
        }
      </div>
      <div className="col-span-3">
        <p className="text-xs font-black text-neutral-900">{log.recipientContact}</p>
        <p className="text-[9px] font-bold text-neutral-300 mt-0.5">ID: {log.recipientId?.slice(0, 8)}…</p>
      </div>
      <div className="col-span-3">
        <span className="text-[10px] font-black text-neutral-600 uppercase tracking-widest">{log.templateCode}</span>
      </div>
      <div className="col-span-3">
        <span className="text-[10px] font-bold text-neutral-400 tabular-nums">
          {log.sentAt ? format(new Date(log.sentAt), 'd MMM, HH:mm', { locale: ru }) : '—'}
        </span>
      </div>
      <div className="col-span-2 flex items-center gap-1.5 justify-end">
        <div className={cn('w-1.5 h-1.5 rounded-full', statusConfig.dot)} />
        <span className={cn('text-[9px] font-black uppercase tracking-widest', statusConfig.color)}>{statusConfig.label}</span>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Customer Row (for Mailing)
// ─────────────────────────────────────────────────────────────────────────────
function CustomerRow({ 
  customer, 
  selected, 
  onToggle, 
  idx 
}: { 
  customer: CustomerSummary; 
  selected: boolean; 
  onToggle: () => void;
  idx: number 
}) {
  return (
    <div 
      className={cn(
        'grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-neutral-50/60 transition-colors cursor-pointer group',
        idx % 2 === 1 ? 'bg-neutral-50/20' : 'bg-white',
        selected && 'bg-emerald-50/30'
      )}
      onClick={onToggle}
    >
      <div className="col-span-1 flex justify-center">
        <div className={cn(
          'w-5 h-5 rounded-md border-2 transition-all flex items-center justify-center',
          selected 
            ? 'bg-neutral-900 border-neutral-900 text-white' 
            : 'border-neutral-200 group-hover:border-neutral-400'
        )}>
          {selected && <CheckCircle2 size={12} className="stroke-[3]" />}
        </div>
      </div>
      <div className="col-span-4">
        <p className="text-sm font-black text-neutral-900">{customer.firstName} {customer.lastName}</p>
        <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mt-0.5">#{customer.id?.slice(0, 8)}</p>
      </div>
      <div className="col-span-4">
        <div className="flex flex-col gap-0.5">
          {customer.phone && (
            <p className="text-xs font-bold text-neutral-600 flex items-center gap-1.5">
              <span className="text-[10px] text-neutral-300">📞</span> {customer.phone}
            </p>
          )}
          {customer.email && (
            <p className="text-xs font-bold text-neutral-400 flex items-center gap-1.5">
              <span className="text-[10px] text-neutral-300">✉️</span> {customer.email}
            </p>
          )}
        </div>
      </div>
      <div className="col-span-3 flex justify-end">
        <div className="bg-neutral-50 px-3 py-1.5 rounded-xl border border-neutral-100 flex flex-col items-end">
          <p className="text-[8px] font-black text-neutral-400 uppercase tracking-widest leading-none mb-1">Бонусы</p>
          <p className="text-xs font-black text-neutral-900 leading-none">{(customer as any).loyaltyPoints || 0} ✨</p>
        </div>
      </div>
    </div>
  )
}
export default function MarketingPage() {
  const [activeTab, setActiveTab] = useState<'clients' | 'templates' | 'logs'>('clients')
  const [selectedTemplate, setSelectedTemplate] = useState<NotificationTemplate | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [isBlastOpen, setIsBlastOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [channelFilter, setChannelFilter] = useState('')
  
  const [selectedCustomerIds, setSelectedCustomerIds] = useState<Set<string>>(new Set())

  const { data: templates = [], isLoading: isLoadingTemplates } = useQuery({
    queryKey: ['notification-templates'],
    queryFn: () => NotificationService.getTemplates().then(r => r.data),
  })

  const { data: customersData, isLoading: isLoadingCustomers } = useQuery({
    queryKey: ['mailing-customers', search],
    queryFn: () => CustomerService.list({ size: 100, phone: search }).then(r => r.data),
  })
  const customers: CustomerSummary[] = customersData?.content || []

  const { data: logsData, isLoading: isLoadingLogs } = useQuery({
    queryKey: ['notification-logs'],
    queryFn: () => NotificationService.getLogs({ size: 100 }).then(r => r.data),
  })
  const logs: NotificationLog[] = logsData?.data || []

  const filteredTemplates = templates.filter(t => {
    const matchSearch = !search || (t.code || '').toLowerCase().includes(search.toLowerCase()) || (t.subject || '').toLowerCase().includes(search.toLowerCase())
    const matchChannel = !channelFilter || t.channel === channelFilter
    return matchSearch && matchChannel
  })

  const activeCount = templates.filter(t => t.isActive).length
  const emailCount = templates.filter(t => t.channel === 'EMAIL').length
  const tgCount = templates.filter(t => t.channel === 'TELEGRAM').length
  const sentToday = logs.filter(l => {
    if (!l.sentAt) return false
    const d = new Date(l.sentAt)
    const now = new Date()
    return d.getDate() === now.getDate() && d.getMonth() === now.getMonth()
  }).length

  return (
    <div className="flex flex-col h-screen bg-[#F7F8FA] overflow-hidden">

      {/* ── Top bar ─────────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-neutral-100 px-8 py-5 flex items-center justify-between flex-shrink-0 shadow-sm">
        <div>
          <h1 className="text-xl font-black text-neutral-900 tracking-tight leading-none">Рассылки и уведомления</h1>
          <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mt-1">Шаблоны, каналы и журнал доставки</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-300 group-focus-within:text-neutral-600 transition-colors" />
            <input type="text" placeholder="Поиск шаблона..." value={search} onChange={e => setSearch(e.target.value)}
              className="w-48 h-10 pl-10 pr-4 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-bold outline-none focus:border-neutral-500 focus:bg-white transition-all" />
            {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-300 hover:text-neutral-600"><X size={14} /></button>}
          </div>

          {/* Channel filter */}
          <select value={channelFilter} onChange={e => setChannelFilter(e.target.value)}
            className="h-10 px-3 bg-neutral-50 border border-neutral-200 rounded-xl text-[10px] font-black text-neutral-500 outline-none appearance-none uppercase tracking-widest">
            <option value="">Все каналы</option>
            <option value="EMAIL">Email</option>
            <option value="TELEGRAM">Telegram</option>
          </select>

          <div className="w-px h-6 bg-neutral-100" />
          {activeTab === 'clients' ? (
            <button 
              onClick={() => setIsBlastOpen(true)}
              disabled={selectedCustomerIds.size === 0}
              className="h-10 px-5 bg-neutral-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all flex items-center gap-2 shadow-lg shadow-black/10 active:scale-95 disabled:opacity-50 disabled:bg-neutral-200 disabled:shadow-none"
            >
              <Send size={16} /> Создать рассылку ({selectedCustomerIds.size})
            </button>
          ) : (
            <button onClick={() => { setIsCreating(true); setSelectedTemplate(null) }}
              className="h-10 px-5 bg-neutral-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all flex items-center gap-2 shadow-lg shadow-black/10 active:scale-95">
              <Plus size={16} /> Новый шаблон
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">

        {/* ── Left sidebar ─────────────────────────────────────────────── */}
        <div className="w-56 flex-shrink-0 bg-white border-r border-neutral-100 flex flex-col overflow-y-auto">
          {/* Stats */}
          <div className="p-5 border-b border-neutral-50 space-y-3">
            <p className="text-[8px] font-black text-neutral-400 uppercase tracking-widest">Обзор</p>
            {[
              { label: 'Всего шаблонов', value: templates.length, icon: Bell },
              { label: 'Активных',       value: activeCount,      icon: CheckCircle2 },
              { label: 'Email',          value: emailCount,       icon: Mail },
              { label: 'Telegram',       value: tgCount,          icon: MessageSquare },
            ].map(({ label, value, icon: Icon }) => (
              <button 
                key={label} 
                onClick={() => setActiveTab('templates')}
                className="w-full flex items-center justify-between p-3 bg-neutral-50 rounded-xl border border-neutral-100 hover:border-neutral-300 hover:bg-white transition-all group/stat"
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  <Icon size={14} className="text-neutral-400 shrink-0 group-hover/stat:text-neutral-900 transition-colors" />
                  <span className="text-[10px] font-black text-neutral-600 uppercase tracking-tight truncate group-hover/stat:text-neutral-900 transition-colors">{label}</span>
                </div>
                <span className="text-sm font-black text-neutral-900">{value}</span>
              </button>
            ))}
          </div>

          {/* Logs stat */}
          <div className="p-5 border-b border-neutral-50">
            <p className="text-[8px] font-black text-neutral-400 uppercase tracking-widest mb-3">Журнал</p>
            <button 
              onClick={() => setActiveTab('logs')}
              className="w-full p-3 bg-neutral-50 rounded-xl border border-neutral-100 hover:border-neutral-300 hover:bg-white transition-all group/journal text-left"
            >
              <div className="flex items-center gap-2 mb-1">
                <Activity size={14} className="text-neutral-400 shrink-0 group-hover/journal:text-neutral-900 transition-colors" />
                <span className="text-[10px] font-black text-neutral-600 uppercase tracking-tight truncate group-hover/journal:text-neutral-900 transition-colors">Отправлено сегодня</span>
              </div>
              <p className="text-xl font-black text-neutral-900">{sentToday}</p>
            </button>
          </div>

          {/* Nav */}
          <div className="p-4 space-y-1">
            <p className="text-[8px] font-black text-neutral-400 uppercase tracking-widest mb-3">Разделы</p>
            {[
              { id: 'clients',   label: 'Клиенты', icon: Users },
              { id: 'templates', label: 'Шаблоны', icon: Bell },
              { id: 'logs',      label: 'Журнал доставки', icon: Activity },
            ].map(({ id, label, icon: Icon }) => (
              <button key={id} onClick={() => setActiveTab(id as any)}
                className={cn('w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left',
                  activeTab === id ? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-neutral-50 border-neutral-100 text-neutral-600 hover:border-neutral-300'
                )}>
                <Icon size={14} className={activeTab === id ? 'text-white/60' : 'text-neutral-400'} />
                <span className={cn('text-[10px] font-black uppercase tracking-widest', activeTab === id ? 'text-white' : 'text-neutral-600')}>{label}</span>
                <ChevronRight size={12} className={cn('ml-auto', activeTab === id ? 'text-white/40' : 'text-neutral-300')} />
              </button>
            ))}
          </div>
        </div>

        {/* ── Main content ─────────────────────────────────────────────── */}
        <div className="flex-1 overflow-auto bg-white">
          {activeTab === 'clients' ? (
            <>
              {/* Clients table header */}
              <div className="px-6 py-4 border-b border-neutral-100 bg-neutral-50/50 grid grid-cols-12 gap-4 sticky top-0 z-10 bg-white">
                <div className="col-span-1 flex justify-center">
                  <button 
                    onClick={() => {
                      if (selectedCustomerIds.size === customers.length) {
                        setSelectedCustomerIds(new Set())
                      } else {
                        setSelectedCustomerIds(new Set(customers.map(c => c.id!)))
                      }
                    }}
                    className={cn(
                      'w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all',
                      selectedCustomerIds.size === customers.length && customers.length > 0
                        ? 'bg-neutral-900 border-neutral-900 text-white' 
                        : 'border-neutral-200 hover:border-neutral-400'
                    )}
                  >
                    {selectedCustomerIds.size === customers.length && customers.length > 0 && <CheckCircle2 size={12} className="stroke-[3]" />}
                  </button>
                </div>
                <div className="col-span-4 text-[9px] font-black text-neutral-400 uppercase tracking-widest">Клиент</div>
                <div className="col-span-4 text-[9px] font-black text-neutral-400 uppercase tracking-widest">Контакты</div>
                <div className="col-span-3 text-[9px] font-black text-neutral-400 uppercase tracking-widest text-right">Статус лояльности</div>
              </div>

              {isLoadingCustomers ? (
                <div className="py-32 flex items-center justify-center">
                  <Loader2 className="animate-spin text-neutral-200" size={36} />
                </div>
              ) : customers.length === 0 ? (
                <div className="py-32 flex flex-col items-center gap-4">
                  <Users size={28} className="text-neutral-200" />
                  <p className="text-[10px] font-black text-neutral-300 uppercase tracking-widest">Клиенты не найдены</p>
                </div>
              ) : (
                <div className="divide-y divide-neutral-50">
                  {customers.map((c, idx) => (
                    <CustomerRow 
                      key={c.id} 
                      customer={c} 
                      idx={idx}
                      selected={selectedCustomerIds.has(c.id!)}
                      onToggle={(e) => {
                        e.stopPropagation()
                        const next = new Set(selectedCustomerIds)
                        if (next.has(c.id!)) next.delete(c.id!)
                        else next.add(c.id!)
                        setSelectedCustomerIds(next)
                      }}
                    />
                  ))}
                </div>
              )}
            </>
          ) : activeTab === 'templates' ? (
            <>
              {/* Table header */}
              <div className="px-6 py-4 border-b border-neutral-100 bg-neutral-50/50 grid grid-cols-12 gap-4 sticky top-0 z-10 bg-white">
                {[
                  { label: '', span: 1 },
                  { label: 'Код шаблона', span: 2 },
                  { label: 'Тема', span: 3 },
                  { label: 'Тело (превью)', span: 4 },
                  { label: 'Статус', span: 1 },
                  { label: '', span: 1 },
                ].map(({ label, span }, i) => (
                  <div key={i} className={cn('text-[9px] font-black text-neutral-400 uppercase tracking-widest', `col-span-${span}`)}>
                    {label}
                  </div>
                ))}
              </div>

              {isLoadingTemplates ? (
                <div className="py-32 flex items-center justify-center">
                  <Loader2 className="animate-spin text-neutral-200" size={36} />
                </div>
              ) : filteredTemplates.length === 0 ? (
                <div className="py-32 flex flex-col items-center gap-4">
                  <Bell size={28} className="text-neutral-200" />
                  <p className="text-[10px] font-black text-neutral-300 uppercase tracking-widest">Шаблонов нет</p>
                </div>
              ) : (
                <div className="divide-y divide-neutral-50">
                  {filteredTemplates.map((t, idx) => (
                    <TemplateRow key={t.id} template={t} onEdit={() => { setSelectedTemplate(t); setIsCreating(false) }} idx={idx} />
                  ))}
                </div>
              )}
            </>
          ) : (
            <>
              {/* Logs table header */}
              <div className="px-6 py-4 border-b border-neutral-100 bg-neutral-50/50 grid grid-cols-12 gap-4 sticky top-0 z-10 bg-white">
                {[
                  { label: '', span: 1 },
                  { label: 'Получатель', span: 3 },
                  { label: 'Шаблон', span: 3 },
                  { label: 'Время', span: 3 },
                  { label: 'Статус', span: 2 },
                ].map(({ label, span }, i) => (
                  <div key={i} className={cn('text-[9px] font-black text-neutral-400 uppercase tracking-widest', `col-span-${span}`)}>
                    {label}
                  </div>
                ))}
              </div>

              {isLoadingLogs ? (
                <div className="py-32 flex items-center justify-center">
                  <Loader2 className="animate-spin text-neutral-200" size={36} />
                </div>
              ) : logs.length === 0 ? (
                <div className="py-32 flex flex-col items-center gap-4">
                  <Activity size={28} className="text-neutral-200" />
                  <p className="text-[10px] font-black text-neutral-300 uppercase tracking-widest">Журнал пуст</p>
                </div>
              ) : (
                <div className="divide-y divide-neutral-50">
                  {logs.map((log, idx) => <LogRow key={log.id} log={log} idx={idx} />)}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* ── Status bar ──────────────────────────────────────────────────── */}
      <div className="bg-white border-t border-neutral-100 px-8 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[9px] font-black text-neutral-400 uppercase tracking-widest">{activeCount} активных шаблонов</span>
        </div>
        <button onClick={() => { setIsCreating(true); setSelectedTemplate(null) }}
          className="flex items-center gap-2 text-[9px] font-black text-neutral-400 hover:text-neutral-900 uppercase tracking-widest transition-colors">
          <Plus size={14} /> Добавить шаблон
        </button>
      </div>

      {/* Modals */}
      {(selectedTemplate || isCreating) && (
        <TemplateEditModal
          template={selectedTemplate ?? undefined}
          onClose={() => { setSelectedTemplate(null); setIsCreating(false) }}
        />
      )}

      {isBlastOpen && (
        <SendBlastModal
          selectedCustomers={customers.filter(c => selectedCustomerIds.has(c.id!))}
          templates={templates}
          onClose={() => setIsBlastOpen(false)}
          onSuccess={() => {
            setIsBlastOpen(false)
            setSelectedCustomerIds(new Set())
            setActiveTab('logs')
          }}
        />
      )}
    </div>
  )
}
