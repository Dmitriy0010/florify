import { useState, useMemo } from 'react'
import {
  Truck,
  Search,
  Plus,
  Loader2,
  Phone,
  Mail,
  Building2,
  X,
  Star,
  TrendingUp,
  Package,
  AlertTriangle,
  CheckCircle2,
  ArrowUpRight,
  ChevronRight,
  MoreVertical,
  Pencil,
  Ban,
  Globe,
  CreditCard,
  FileText,
  Receipt,
  Filter
} from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { SupplierService, InvoiceService, SupplierSummary, Supplier, CreateSupplierRequest } from '@/lib/api'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { format, parseISO } from 'date-fns'
import { ru } from 'date-fns/locale'

// ─────────────────────────────────────────────────────────────────────────────
// Payment terms labels
// ─────────────────────────────────────────────────────────────────────────────
const PAYMENT_TERMS: Record<string, { label: string; color: string }> = {
  NET_7:    { label: 'NET 7',    color: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
  NET_14:   { label: 'NET 14',   color: 'bg-sky-50 text-sky-700 border-sky-100' },
  NET_30:   { label: 'NET 30',   color: 'bg-violet-50 text-violet-700 border-violet-100' },
  NET_60:   { label: 'NET 60',   color: 'bg-amber-50 text-amber-700 border-amber-100' },
  PREPAID:  { label: 'Предоплата', color: 'bg-red-50 text-red-700 border-red-100' },
  COD:      { label: 'По факту', color: 'bg-neutral-50 text-neutral-600 border-neutral-200' },
}

const getTermsConfig = (t?: string) => PAYMENT_TERMS[t ?? ''] ?? { label: t ?? '—', color: 'bg-neutral-50 text-neutral-500 border-neutral-200' }

const getRatingColor = (r?: number) => {
  if (!r) return 'text-neutral-200'
  if (r >= 4) return 'text-amber-400'
  if (r >= 3) return 'text-amber-300'
  return 'text-neutral-300'
}

import { InvoiceDetailModal } from '@/components/inventory/InvoiceDetailModal'
import { CreateInvoiceModal } from '@/components/inventory/CreateInvoiceModal'

// ─────────────────────────────────────────────────────────────────────────────
// Supplier Detail Drawer
// ─────────────────────────────────────────────────────────────────────────────
function SupplierDrawer({
  supplierId,
  onClose,
  onEdit,
  onDeactivate,
  queryClient
}: {
  supplierId: string
  onClose: () => void
  onEdit: () => void
  onDeactivate: () => void
  queryClient: any
}) {
  const [selectedInvoiceForDetail, setSelectedInvoiceForDetail] = useState<any | null>(null)

  const { data: supplier, isLoading } = useQuery({
    queryKey: ['supplier', supplierId],
    queryFn: () => SupplierService.getById(supplierId).then(r => r.data)
  })

  const { data: invoicesRes, refetch: refetchInvoices } = useQuery({
    queryKey: ['supplier-invoices', supplierId],
    queryFn: () => InvoiceService.getAll({ supplierId, size: 5 }).then(r => r.data)
  })
  const invoices = invoicesRes?.data || []

  const invoiceStatusConfig: Record<string, { label: string; color: string }> = {
    DRAFT:     { label: 'Черновик',  color: 'bg-neutral-100 text-neutral-500' },
    SUBMITTED: { label: 'В пути',    color: 'bg-blue-100 text-blue-700' },
    RECEIVED:  { label: 'Получен',   color: 'bg-emerald-100 text-emerald-700' },
    PARTIALLY_RECEIVED: { label: 'Частично', color: 'bg-amber-100 text-amber-700' },
    CANCELLED: { label: 'Отменён',   color: 'bg-red-100 text-red-600' },
  }

  return (
    <>
      <div className="fixed inset-0 z-50 flex">
        <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose} />
        <div className="relative ml-auto w-[560px] h-full bg-white shadow-2xl flex flex-col animate-in slide-in-from-right-8 duration-300 border-l border-neutral-100">
          {/* Header */}
          {isLoading ? (
            <div className="flex-1 flex items-center justify-center">
              <Loader2 className="animate-spin text-neutral-200" size={36} />
            </div>
          ) : supplier ? (
            <>
              <div className="p-8 border-b border-neutral-100">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-2xl bg-neutral-50 border border-neutral-100 flex items-center justify-center">
                      <Building2 size={24} className="text-neutral-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h2 className="text-2xl font-black text-neutral-900 tracking-tight">{supplier.name}</h2>
                        <div className={cn(
                          'px-2.5 py-1 rounded-lg border text-[9px] font-black uppercase tracking-widest',
                          supplier.active ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-neutral-50 text-neutral-400 border-neutral-200'
                        )}>
                          {supplier.active ? 'Активен' : 'Неактивен'}
                        </div>
                      </div>
                      {/* Star rating */}
                      <div className="flex items-center gap-1">
                        {[1,2,3,4,5].map(i => (
                          <Star key={i} size={14} className={cn('fill-current', i <= (supplier.rating || 0) ? 'text-amber-400' : 'text-neutral-100')} />
                        ))}
                        <span className="text-[10px] font-black text-neutral-400 ml-1">Рейтинг: {supplier.rating || 0}/5</span>
                      </div>
                    </div>
                  </div>
                  <button onClick={onClose} className="h-10 w-10 rounded-xl bg-neutral-50 hover:bg-neutral-100 flex items-center justify-center text-neutral-400 transition-all">
                    <X size={20} />
                  </button>
                </div>

                {/* Quick stats */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-neutral-50 rounded-xl p-3 border border-neutral-100">
                    <p className="text-[8px] font-black text-neutral-400 uppercase tracking-widest mb-1">Условия</p>
                    <div className={cn('inline-flex items-center px-2 py-0.5 rounded-md border text-[9px] font-black', getTermsConfig(supplier.paymentTerms ?? undefined).color)}>
                      {getTermsConfig(supplier.paymentTerms ?? undefined).label}
                    </div>
                  </div>
                  <div className="bg-neutral-50 rounded-xl p-4 shadow-sm border border-neutral-100">
                    <p className="text-[8px] font-black text-neutral-400 uppercase tracking-widest mb-1">Накладных</p>
                    <p className="text-xl font-black text-neutral-900">{invoices.length}</p>
                  </div>
                  <div className="bg-neutral-50 rounded-xl p-3 border border-neutral-100">
                    <p className="text-[8px] font-black text-neutral-400 uppercase tracking-widest mb-1">ИНН</p>
                    <p className="text-xs font-black text-neutral-600 truncate">{supplier.taxId || '—'}</p>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-8">
                {/* Contacts */}
                <div>
                  <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Phone size={14} /> Контактная информация
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { label: 'Контактное лицо', value: supplier.contactPerson },
                      { label: 'Телефон', value: supplier.phone },
                      { label: 'Email', value: supplier.email },
                      { label: 'Адрес', value: supplier.address },
                    ].map(({ label, value }) => (
                      <div key={label} className="bg-neutral-50/50 rounded-2xl p-5 border border-neutral-100/50 hover:bg-white hover:border-neutral-200 transition-all group">
                        <p className="text-[8px] font-black text-neutral-400 uppercase tracking-widest mb-1.5 group-hover:text-neutral-900">{label}</p>
                        <p className="text-base font-black text-neutral-900 tracking-tight">{value || '—'}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent invoices */}
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest flex items-center gap-2">
                      <Receipt size={14} /> Последние накладные
                    </p>
                  </div>
                  {invoices.length === 0 ? (
                    <div className="py-12 text-center bg-neutral-50 rounded-[28px] border border-neutral-100 border-dashed">
                      <p className="text-[11px] font-black text-neutral-300 uppercase tracking-widest">Накладных нет</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {invoices.slice(0, 5).map((inv: any) => {
                        const sc = invoiceStatusConfig[inv.status] ?? { label: inv.status, color: 'bg-neutral-100 text-neutral-500' }
                        return (
                          <div 
                            key={inv.id} 
                            onClick={async () => {
                              const res = await InvoiceService.getById(inv.id!)
                              setSelectedInvoiceForDetail(res.data)
                            }}
                            className="flex items-center justify-between p-5 bg-white rounded-[24px] border border-neutral-100 hover:border-neutral-900 hover:shadow-2xl hover:shadow-neutral-900/5 transition-all cursor-pointer group"
                          >
                            <div className="flex items-center gap-4">
                              <div className="h-12 w-12 rounded-2xl bg-neutral-50 flex items-center justify-center text-neutral-400 group-hover:bg-neutral-900 group-hover:text-white transition-all">
                                <FileText size={20} />
                              </div>
                              <div>
                                <p className="text-sm font-black text-neutral-900 group-hover:translate-x-1 transition-transform">Накладная #{inv.invoiceNumber || inv.id?.slice(0, 8)}</p>
                                <p className="text-[10px] font-bold text-neutral-400 mt-0.5">
                                  {inv.createdAt ? format(parseISO(inv.createdAt), 'd MMMM yyyy', { locale: ru }) : '—'}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="text-right">
                                <p className="text-base font-black text-neutral-900">
                                  {(inv.totalAmount || 0).toLocaleString()} ₽
                                </p>
                                <span className={cn('px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest mt-1 inline-block', sc.color)}>
                                  {sc.label}
                                </span>
                              </div>
                              <ChevronRight size={18} className="text-neutral-200 group-hover:text-neutral-900 transition-all" />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>

                {/* Notes */}
                {supplier.notes && (
                  <div>
                    <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                       Заметки
                    </p>
                    <div className="p-6 bg-neutral-50 rounded-[28px] border border-neutral-100 text-sm font-bold text-neutral-600 italic leading-relaxed">
                      {supplier.notes}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-8 border-t border-neutral-100 bg-neutral-50/30 space-y-3">
                <button
                  onClick={onEdit}
                  className="w-full h-14 bg-neutral-900 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-black transition-all active:scale-95 shadow-xl shadow-black/10"
                >
                  Редактировать профиль
                </button>
                {supplier.active && (
                  <button
                    onClick={onDeactivate}
                    className="w-full h-12 bg-white border-2 border-red-50 text-red-500 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:border-red-500 hover:text-red-500 transition-all active:scale-95 flex items-center justify-center gap-2"
                  >
                    <Ban size={14} /> Деактивировать поставщика
                  </button>
                )}
              </div>
            </>
          ) : null}
        </div>
      </div>

      {/* Detail Modal */}
      {selectedInvoiceForDetail && (
        <InvoiceDetailModal 
          invoice={selectedInvoiceForDetail}
          onClose={() => setSelectedInvoiceForDetail(null)}
          onRefresh={() => {
            queryClient.invalidateQueries({ queryKey: ['suppliers'] })
            queryClient.invalidateQueries({ queryKey: ['supplier', supplierId] })
            refetchInvoices()
          }}
          onEdit={(inv) => {
             // In suppliers page we don't have direct edit modal logic here easily 
             // but we can just close detail
             setSelectedInvoiceForDetail(null)
          }}
        />
      )}
    </>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Create / Edit Modal
// ─────────────────────────────────────────────────────────────────────────────
function SupplierFormModal({
  supplier,
  onClose,
  onSuccess
}: {
  supplier?: Supplier
  onClose: () => void
  onSuccess: () => void
}) {
  const isEdit = !!supplier
  const [form, setForm] = useState<CreateSupplierRequest>({
    name: supplier?.name || '',
    contactPerson: supplier?.contactPerson || '',
    phone: supplier?.phone || '',
    email: supplier?.email || '',
    address: supplier?.address || '',
    taxId: supplier?.taxId || '',
    paymentTerms: (supplier?.paymentTerms as any) || 'NET_30',
    notes: supplier?.notes || '',
  })
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name) { toast.error('Введите название поставщика'); return }
    setSaving(true)
    try {
      if (isEdit && supplier?.id) {
        await SupplierService.update(supplier.id, form)
        toast.success('Поставщик обновлён')
      } else {
        await SupplierService.create(form)
        toast.success('Поставщик создан')
      }
      onSuccess()
    } catch (e: any) {
      toast.error('Ошибка: ' + (e.response?.data?.message || e.message))
    } finally {
      setSaving(false)
    }
  }

  const field = (key: keyof CreateSupplierRequest, label: string, placeholder?: string, type = 'text') => (
    <div className="space-y-2">
      <label className="text-[9px] font-black text-neutral-400 uppercase tracking-widest">{label}</label>
      <input
        type={type}
        value={(form[key] as string) || ''}
        onChange={e => setForm({ ...form, [key]: e.target.value })}
        placeholder={placeholder}
        className="w-full h-11 px-4 bg-neutral-50 border border-neutral-200 rounded-xl text-sm font-bold outline-none focus:border-neutral-900 focus:bg-white transition-all"
      />
    </div>
  )

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col border border-neutral-200 animate-in zoom-in-95 duration-200">
        <div className="p-8 border-b border-neutral-100 flex items-center justify-between">
          <div>
            <p className="text-[9px] font-black text-neutral-400 uppercase tracking-widest mb-1">{isEdit ? 'Редактирование' : 'Новый поставщик'}</p>
            <h2 className="text-xl font-black text-neutral-900">{isEdit ? supplier?.name : 'Добавить поставщика'}</h2>
          </div>
          <button onClick={onClose} className="h-10 w-10 rounded-xl bg-neutral-50 hover:bg-neutral-100 flex items-center justify-center text-neutral-400">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-5">
          {field('name', 'Название компании *', 'ООО «Флора Опт»')}

          <div className="grid grid-cols-2 gap-4">
            {field('contactPerson', 'Контактное лицо', 'Иванов Иван')}
            {field('phone', 'Телефон', '+7 (999) 000-00-00', 'tel')}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {field('email', 'Email', 'supplier@example.com', 'email')}
            {field('taxId', 'ИНН', '1234567890')}
          </div>

          {field('address', 'Адрес', 'г. Москва, ул. ...')}

          <div className="space-y-2">
            <label className="text-[9px] font-black text-neutral-400 uppercase tracking-widest">Условия оплаты</label>
            <select
              value={form.paymentTerms as string || ''}
              onChange={e => setForm({ ...form, paymentTerms: e.target.value as any })}
              className="w-full h-11 px-4 bg-neutral-50 border border-neutral-200 rounded-xl text-sm font-bold outline-none focus:border-neutral-900 appearance-none"
            >
              {Object.entries(PAYMENT_TERMS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[9px] font-black text-neutral-400 uppercase tracking-widest">Заметки</label>
            <textarea
              value={form.notes || ''}
              onChange={e => setForm({ ...form, notes: e.target.value })}
              rows={3}
              placeholder="Особые условия работы, комментарии..."
              className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm font-bold outline-none focus:border-neutral-900 focus:bg-white transition-all resize-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 h-12 bg-neutral-50 border border-neutral-200 text-neutral-500 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-neutral-100 transition-all">
              Отмена
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 h-12 bg-neutral-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all disabled:opacity-50 flex items-center justify-center gap-2 active:scale-95"
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : null}
              {isEdit ? 'Сохранить' : 'Создать поставщика'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Row context menu
// ─────────────────────────────────────────────────────────────────────────────
function SupplierRowMenu({ onEdit, onView, onDeactivate, active }: {
  onEdit: () => void; onView: () => void; onDeactivate: () => void; active?: boolean
}) {
  const [open, setOpen] = useState(false)
  return (
    <div className="relative">
      <button onClick={e => { e.stopPropagation(); setOpen(!open) }} className="h-8 w-8 rounded-lg flex items-center justify-center text-neutral-300 hover:text-neutral-900 hover:bg-neutral-100 transition-all">
        <MoreVertical size={16} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-10 z-50 bg-white rounded-2xl shadow-2xl border border-neutral-100 py-2 w-44 animate-in zoom-in-95 duration-150 origin-top-right">
            <button onClick={() => { setOpen(false); onView() }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-neutral-700 hover:bg-neutral-50 text-left">
              <ChevronRight size={14} className="text-neutral-400" /> Открыть
            </button>
            <button onClick={() => { setOpen(false); onEdit() }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-neutral-700 hover:bg-neutral-50 text-left">
              <Pencil size={14} className="text-neutral-400" /> Редактировать
            </button>
            {active && (
              <>
                <div className="h-px bg-neutral-50 my-1 mx-3" />
                <button onClick={() => { setOpen(false); onDeactivate() }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-red-500 hover:bg-red-50 text-left">
                  <Ban size={14} /> Деактивировать
                </button>
              </>
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
export default function SuppliersPage() {
  const queryClient = useQueryClient()

  const [searchQuery, setSearchQuery] = useState('')
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('active')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [editSupplier, setEditSupplier] = useState<Supplier | null>(null)
  const [isCreateOpen, setIsCreateOpen] = useState(false)

  const { data: suppliersRes, isLoading } = useQuery({
    queryKey: ['suppliers'],
    queryFn: () => SupplierService.getAll({ size: 100 }).then(r => r.data)
  })
  const suppliers = suppliersRes?.data || []

  const deactivateMutation = useMutation({
    mutationFn: (id: string) => SupplierService.deactivate(id),
    onSuccess: () => { toast.success('Поставщик деактивирован'); queryClient.invalidateQueries({ queryKey: ['suppliers'] }); setSelectedId(null) },
    onError: (e: any) => toast.error('Ошибка: ' + (e.response?.data?.message || e.message))
  })

  const filtered = useMemo(() => suppliers.filter(s => {
    const matchSearch = !searchQuery || (s.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || (s.contactPerson || '').toLowerCase().includes(searchQuery.toLowerCase())
    const matchActive = filterActive === 'all' ? true : filterActive === 'active' ? !!s.active : !s.active
    return matchSearch && matchActive
  }), [suppliers, searchQuery, filterActive])

  const activeCount = suppliers.filter(s => s.active).length
  const inactiveCount = suppliers.filter(s => !s.active).length

  return (
    <div className="flex flex-col h-screen bg-[#F7F8FA] overflow-hidden">

      {/* ── Top bar ─────────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-neutral-100 px-8 py-5 flex items-center justify-between flex-shrink-0 shadow-sm">
        <div>
          <h1 className="text-xl font-black text-neutral-900 tracking-tight leading-none">Поставщики</h1>
          <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mt-1">
            Управление базой контрагентов и условиями поставок
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-300 group-focus-within:text-neutral-600 transition-colors" />
            <input
              type="text"
              placeholder="Поиск по названию или контакту..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-64 h-10 pl-10 pr-4 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-bold outline-none focus:border-neutral-500 focus:bg-white transition-all"
            />
            {searchQuery && <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-300 hover:text-neutral-600"><X size={14} /></button>}
          </div>
          <div className="w-px h-6 bg-neutral-100" />
          <button
            onClick={() => setIsCreateOpen(true)}
            className="h-10 px-5 bg-neutral-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all flex items-center gap-2 shadow-lg shadow-black/10 active:scale-95"
          >
            <Plus size={16} /> Новый поставщик
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">

        {/* ── Left sidebar ─────────────────────────────────────────────── */}
        <div className="w-72 flex-shrink-0 bg-white border-r border-neutral-100 flex flex-col overflow-y-auto custom-scrollbar">
          <div className="p-6 border-b border-neutral-50 space-y-4">
            <p className="text-[8px] font-black text-neutral-400 uppercase tracking-widest">База контрагентов</p>

            <div className="grid grid-cols-2 gap-3">
              <div onClick={() => setFilterActive('active')} className={cn('p-4 rounded-2xl border cursor-pointer transition-all', filterActive === 'active' ? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-neutral-50 border-neutral-100 hover:border-neutral-300')}>
                <CheckCircle2 size={16} className={filterActive === 'active' ? 'text-white/60' : 'text-emerald-500'} />
                <p className="text-2xl font-black mt-2 leading-none">{activeCount}</p>
                <p className={cn('text-[8px] font-black uppercase tracking-widest mt-1', filterActive === 'active' ? 'text-white/50' : 'text-neutral-400')}>Активных</p>
              </div>
              <div onClick={() => setFilterActive('inactive')} className={cn('p-4 rounded-2xl border cursor-pointer transition-all', filterActive === 'inactive' ? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-neutral-50 border-neutral-100 hover:border-neutral-300')}>
                <Ban size={16} className={filterActive === 'inactive' ? 'text-white/60' : 'text-neutral-400'} />
                <p className="text-2xl font-black mt-2 leading-none">{inactiveCount}</p>
                <p className={cn('text-[8px] font-black uppercase tracking-widest mt-1', filterActive === 'inactive' ? 'text-white/50' : 'text-neutral-400')}>Неактивных</p>
              </div>
            </div>

            <button onClick={() => setFilterActive('all')} className={cn('w-full h-10 rounded-2xl border text-[9px] font-black uppercase tracking-widest transition-all', filterActive === 'all' ? 'bg-neutral-900 text-white border-neutral-800' : 'bg-neutral-50 text-neutral-500 border-neutral-100 hover:border-neutral-300')}>
              Все поставщики ({suppliers.length})
            </button>
          </div>

          {/* Payment terms breakdown */}
          <div className="p-6 space-y-4">
            <p className="text-[8px] font-black text-neutral-400 uppercase tracking-widest">По условиям оплаты</p>
            {Object.entries(PAYMENT_TERMS).map(([key, { label, color }]) => {
              const count = suppliers.filter(s => s.active && s.paymentTerms === key).length
              if (!count) return null
              return (
                <div key={key} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={cn('px-2 py-0.5 rounded border text-[8px] font-black', color)}>{label}</span>
                  </div>
                  <span className="text-[11px] font-black text-neutral-600">{count}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* ── Table ────────────────────────────────────────────────────── */}
        <div className="flex-1 overflow-auto custom-scrollbar">
          {isLoading ? (
            <div className="h-full flex flex-col items-center justify-center gap-4">
              <Loader2 className="animate-spin text-neutral-200" size={48} />
              <p className="text-[11px] font-black text-neutral-300 uppercase tracking-widest">Загрузка базы поставщиков...</p>
            </div>
          ) : (
            <div>
              {/* Table header */}
              <div className="sticky top-0 z-10 bg-white border-b border-neutral-100 px-6 py-4 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                  <Truck size={16} className="text-neutral-400" />
                  <span className="text-sm font-black text-neutral-900">{filtered.length} поставщиков</span>
                </div>
                <div className="flex items-center gap-8 text-[9px] font-black text-neutral-400 uppercase tracking-widest pr-2">
                  <span className="w-52">Поставщик</span>
                  <span className="w-32">Условия</span>
                  <span className="w-36 hidden lg:block">Контакт</span>
                  <span className="w-24">Рейтинг</span>
                  <span className="w-24">Статус</span>
                  <span className="w-8" />
                </div>
              </div>

              {filtered.length === 0 ? (
                <div className="py-32 flex flex-col items-center gap-4">
                  <div className="h-16 w-16 rounded-2xl bg-neutral-50 flex items-center justify-center">
                    <Truck size={24} className="text-neutral-200" />
                  </div>
                  <p className="text-sm font-black text-neutral-300">Поставщики не найдены</p>
                </div>
              ) : (
                <div className="divide-y divide-neutral-50">
                  {filtered.map((supplier, idx) => {
                    const terms = getTermsConfig(supplier.paymentTerms ?? undefined)
                    return (
                      <div
                        key={supplier.id}
                        className={cn(
                          'flex items-center gap-8 px-6 py-4 hover:bg-neutral-50/60 transition-colors cursor-pointer group',
                          idx % 2 === 1 ? 'bg-neutral-50/20' : 'bg-white',
                          !supplier.active && 'opacity-60'
                        )}
                        onClick={() => supplier.id && setSelectedId(supplier.id)}
                      >
                        {/* Company */}
                        <div className="flex items-center gap-3 w-52 min-w-0">
                          <div className="h-10 w-10 rounded-xl bg-neutral-50 border border-neutral-200 flex items-center justify-center group-hover:bg-neutral-900 group-hover:border-neutral-900 transition-all flex-shrink-0">
                            <Building2 size={18} className="text-neutral-400 group-hover:text-white transition-colors" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-black text-neutral-900 truncate">{supplier.name}</p>
                            <p className="text-[9px] font-bold text-neutral-400 truncate">{supplier.contactPerson || '—'}</p>
                          </div>
                        </div>

                        {/* Payment terms */}
                        <div className="w-32">
                          <span className={cn('px-2.5 py-1 rounded-lg border text-[9px] font-black', terms.color)}>
                            {terms.label}
                          </span>
                        </div>

                        {/* Contact */}
                        <div className="w-36 hidden lg:flex flex-col gap-1">
                          {supplier.phone && (
                            <div className="flex items-center gap-1.5">
                              <Phone size={10} className="text-neutral-300" />
                              <span className="text-[10px] font-bold text-neutral-500 truncate">{supplier.phone}</span>
                            </div>
                          )}
                          {supplier.email && (
                            <div className="flex items-center gap-1.5">
                              <Mail size={10} className="text-neutral-300" />
                              <span className="text-[10px] font-bold text-neutral-500 truncate">{supplier.email}</span>
                            </div>
                          )}
                        </div>

                        {/* Rating */}
                        <div className="w-24 flex items-center gap-1">
                          {[1,2,3,4,5].map(i => (
                            <Star key={i} size={12} className={cn('fill-current', i <= (supplier.rating || 0) ? 'text-amber-400' : 'text-neutral-100')} />
                          ))}
                        </div>

                        {/* Status */}
                        <div className="w-24">
                          {supplier.active ? (
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-emerald-500" />
                              <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Активен</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-neutral-300" />
                              <span className="text-[9px] font-black text-neutral-400 uppercase tracking-widest">Неактивен</span>
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="ml-auto flex-shrink-0" onClick={e => e.stopPropagation()}>
                          <SupplierRowMenu
                            onView={() => supplier.id && setSelectedId(supplier.id)}
                            onEdit={async () => {
                              if (supplier.id) {
                                const res = await SupplierService.getById(supplier.id)
                                setEditSupplier(res.data)
                              }
                            }}
                            onDeactivate={() => supplier.id && deactivateMutation.mutate(supplier.id)}
                            active={supplier.active ?? false}
                          />
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
        <div className="flex items-center gap-2">
          <TrendingUp size={14} className="text-neutral-400" />
          <span className="text-[9px] font-black text-neutral-400 uppercase tracking-widest">{activeCount} активных поставщиков</span>
        </div>
        <button onClick={() => setIsCreateOpen(true)} className="flex items-center gap-2 text-[9px] font-black text-neutral-400 hover:text-neutral-900 uppercase tracking-widest transition-colors">
          <ArrowUpRight size={14} /> Добавить поставщика
        </button>
      </div>

      {/* ── Modals / Drawers ─────────────────────────────────────────────── */}
      {selectedId && (
        <SupplierDrawer
          supplierId={selectedId}
          onClose={() => setSelectedId(null)}
          onEdit={async () => {
            const res = await SupplierService.getById(selectedId)
            setEditSupplier(res.data)
            setSelectedId(null)
          }}
          onDeactivate={() => deactivateMutation.mutate(selectedId)}
          queryClient={queryClient}
        />
      )}

      {(isCreateOpen || editSupplier) && (
        <SupplierFormModal
          supplier={editSupplier ?? undefined}
          onClose={() => { setIsCreateOpen(false); setEditSupplier(null) }}
          onSuccess={() => { setIsCreateOpen(false); setEditSupplier(null); queryClient.invalidateQueries({ queryKey: ['suppliers'] }) }}
        />
      )}
    </div>
  )
}
