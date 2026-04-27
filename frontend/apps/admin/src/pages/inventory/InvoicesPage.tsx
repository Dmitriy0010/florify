import { useState } from 'react'
import { 
  FileText, 
  Search, 
  Filter, 
  Plus, 
  Loader2, 
  ChevronRight,
  Truck,
  ArrowUpDown,
  History
} from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { InvoiceService, StoreService } from '@/lib/api'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'

import { InvoiceDetailModal } from '@/components/inventory/InvoiceDetailModal'
import { CreateInvoiceModal } from '@/components/inventory/CreateInvoiceModal'
import { Invoice } from '@/lib/api'

export default function InvoicesPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null)
  
  const { data: invoicesRes, isLoading, refetch } = useQuery({
    queryKey: ['invoices'],
    queryFn: () => InvoiceService.getAll().then(res => res.data)
  })

  const { data: storesRes } = useQuery({
    queryKey: ['stores'],
    queryFn: () => StoreService.getAll().then(res => res.data)
  })

  const storesMap = Object.fromEntries((storesRes || []).map(s => [s.id, s.name]))

  const invoices = invoicesRes?.data || []
  
  const filteredInvoices = invoices
    .filter(inv => {
      const matchesSearch = (inv.invoiceNumber || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                            (inv.supplierName || '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'ALL' || inv.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    })
  
  const getStatusBadge = (status: string) => {
    const baseClass = "px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 border";
    switch (status) {
      case 'RECEIVED': 
        return <span className={cn(baseClass, "bg-emerald-50 text-emerald-700 border-emerald-200")}>
          Проведено
        </span>
      case 'PARTIALLY_RECEIVED': 
        return <span className={cn(baseClass, "bg-amber-50 text-amber-700 border-amber-200")}>
          Частично
        </span>
      case 'SUBMITTED': 
        return <span className={cn(baseClass, "bg-blue-50 text-blue-700 border-blue-200 animate-pulse")}>
          В пути
        </span>
      case 'CANCELLED': 
        return <span className={cn(baseClass, "bg-neutral-50 text-neutral-500 border-neutral-200")}>
          Отменено
        </span>
      case 'DRAFT': 
      default: 
        return <span className={cn(baseClass, "bg-neutral-100 text-neutral-600 border-neutral-200")}>
          Черновик
        </span>
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500 py-6 px-4">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900 tracking-tight">Журнал поставок</h1>
          <p className="text-sm text-neutral-500 mt-1">Реестр входящих накладных и закупочных документов</p>
        </div>

        <button 
          onClick={() => setIsCreateModalOpen(true)}
          className="h-10 px-4 bg-neutral-900 text-white rounded-lg text-sm font-medium hover:bg-neutral-800 transition-all flex items-center gap-2"
        >
           <Plus size={18} />
           Оформить закупку
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white border border-neutral-200 rounded-xl p-4 flex flex-col md:flex-row gap-4 shadow-sm items-center">
        <div className="relative flex-1 group w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <input 
            type="text" 
            placeholder="Поиск по номеру накладной или поставщику..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-10 pr-4 bg-neutral-50 border border-neutral-200 rounded-lg text-sm focus:bg-white focus:border-neutral-900 transition-all outline-none text-neutral-900"
          />
        </div>
        
        <div className="flex items-center gap-1.5 p-1 bg-neutral-50 rounded-lg border border-neutral-200 w-full md:w-auto">
           {['ALL', 'DRAFT', 'SUBMITTED', 'RECEIVED'].map((status) => (
             <button
               key={status}
               onClick={() => setStatusFilter(status)}
               className={cn(
                 "px-4 py-1.5 rounded-md text-xs font-semibold transition-all whitespace-nowrap",
                 statusFilter === status 
                   ? "bg-white text-neutral-900 shadow-sm border border-neutral-200" 
                   : "text-neutral-500 hover:text-neutral-700"
               )}
             >
               {status === 'ALL' ? 'Все' : 
                status === 'DRAFT' ? 'Черновик' :
                status === 'SUBMITTED' ? 'В пути' : 'Принято'}
             </button>
           ))}
        </div>
      </div>

      {/* Main CRM Grid */}
      <div className="bg-white border border-neutral-200 rounded-xl shadow-sm overflow-hidden min-h-[400px]">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-neutral-50/50 border-b border-neutral-200">
              <th className="px-6 py-4 text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">Документ</th>
              <th className="px-6 py-4 text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">Поставщик</th>
              <th className="px-6 py-4 text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">Склад</th>
              <th className="px-6 py-4 text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">Дата</th>
              <th className="px-6 py-4 text-[11px] font-semibold text-neutral-500 uppercase tracking-wider text-center">Статус</th>
              <th className="px-6 py-4 text-[11px] font-semibold text-neutral-500 uppercase tracking-wider text-right">Сумма (₽)</th>
              <th className="px-6 py-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {isLoading ? (
              <tr>
                <td colSpan={7} className="py-32 text-center text-neutral-400 italic text-sm">Загрузка данных...</td>
              </tr>
            ) : filteredInvoices.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-32 text-center text-neutral-400 italic text-sm">Ничего не найдено</td>
              </tr>
            ) : filteredInvoices.map((invoice) => (
              <tr 
                key={invoice.id} 
                onClick={() => setSelectedInvoice(invoice)}
                className="group hover:bg-neutral-50/50 transition-colors cursor-pointer"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-neutral-50 flex items-center justify-center text-neutral-400 group-hover:text-neutral-900 transition-colors">
                      <FileText size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-neutral-900">{invoice.invoiceNumber || '—'}</p>
                      <p className="text-[11px] text-neutral-400 font-medium">Накладная</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm font-medium text-neutral-700">{(invoice.supplierName || '—')}</p>
                </td>
                <td className="px-6 py-4">
                  <p className="text-xs font-bold text-neutral-500 bg-neutral-50 px-2 py-1 rounded inline-block truncate max-w-[120px]">
                    {storesMap[invoice.storeId!] || '—'}
                  </p>
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm text-neutral-600 tabular-nums">
                    {invoice.createdAt ? format(new Date(invoice.createdAt), 'dd MMM yyyy', { locale: ru }) : '—'}
                  </p>
                </td>
                <td className="px-6 py-4">
                  <div className="flex justify-center">
                    {getStatusBadge(invoice.status || 'DRAFT')}
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <p className="text-sm font-bold text-neutral-900 tabular-nums">
                    {(invoice.totalAmount || 0).toLocaleString('ru-RU')}
                  </p>
                </td>
                <td className="px-6 py-4 text-right">
                   <ChevronRight size={16} className="text-neutral-300 group-hover:text-neutral-900 ml-auto transition-colors" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer Meta */}
      <div className="flex items-center gap-2 px-2 opacity-50">
         <History size={12} />
         <span className="text-[10px] font-medium tracking-tight uppercase">Procurement Module v2.4.1</span>
      </div>

      {/* Modals */}
      {(isCreateModalOpen || editingInvoice) && (
        <CreateInvoiceModal 
          editInvoice={editingInvoice}
          onClose={() => {
            setIsCreateModalOpen(false)
            setEditingInvoice(null)
          }}
          onSuccess={() => {
            setIsCreateModalOpen(false)
            setEditingInvoice(null)
            refetch()
          }}
        />
      )}

      {selectedInvoice && (
        <InvoiceDetailModal 
          invoice={selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
          onRefresh={refetch}
          onEdit={(inv) => {
            setSelectedInvoice(null)
            setEditingInvoice(inv)
          }}
        />
      )}
    </div>
  )
}
