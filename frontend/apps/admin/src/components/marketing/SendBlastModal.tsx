import { useState } from 'react'
import {
  X,
  Send,
  Loader2,
  Users,
  MessageSquare,
  Mail,
  AlertCircle
} from 'lucide-react'
import { NotificationService, CustomerSummary, NotificationTemplate } from '@/lib/api'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface SendBlastModalProps {
  selectedCustomers: CustomerSummary[]
  templates: NotificationTemplate[]
  onClose: () => void
  onSuccess: () => void
}

export function SendBlastModal({ selectedCustomers, templates, onClose, onSuccess }: SendBlastModalProps) {
  const [channel, setChannel] = useState<'EMAIL' | 'TELEGRAM'>('EMAIL')
  const [templateCode, setTemplateCode] = useState('')
  const [customSubject, setCustomSubject] = useState('')
  const [customBody, setCustomBody] = useState('')
  const [sending, setSending] = useState(false)

  const selectedTemplate = templates.find(t => t.code === templateCode)

  const handleSend = async () => {
    if (selectedCustomers.length === 0) {
      toast.error('Выберите хотя бы одного клиента')
      return
    }

    if (!templateCode && (!customSubject || !customBody)) {
      toast.error('Выберите шаблон или введите текст сообщения')
      return
    }

    setSending(true)
    try {
      const response = await NotificationService.sendBlast({
        recipientIds: selectedCustomers.map(c => c.id!),
        channel,
        templateCode,
        customSubject: customSubject || undefined,
        customBody: customBody || undefined,
      })
      const result = response.data as { total: number; success: number; failure: number }
      if (result.failure > 0) {
        toast.warning(`Рассылка завершена: ${result.success} успешно, ${result.failure} ошибок`)
      } else {
        toast.success(`Рассылка успешно отправлена ${result.success} клиентам`)
      }
      onSuccess()
    } catch (error: any) {
      toast.error('Ошибка при запуске рассылки: ' + (error.response?.data?.message || error.message))
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-white rounded-[32px] shadow-2xl w-full max-w-2xl flex flex-col border border-neutral-100 animate-in zoom-in-95 duration-200 overflow-hidden">
        {/* Header */}
        <div className="p-8 border-b border-neutral-50 flex items-center justify-between bg-neutral-50/50">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-neutral-900 flex items-center justify-center text-white shadow-lg shadow-black/10">
              <Send size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black text-neutral-900 tracking-tight">Новая рассылка</h2>
              <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mt-0.5 flex items-center gap-1.5">
                <Users size={12} /> {selectedCustomers.length} получателей выбрано
              </p>
            </div>
          </div>
          <button onClick={onClose} className="h-10 w-10 rounded-xl bg-white border border-neutral-100 hover:bg-neutral-50 flex items-center justify-center text-neutral-400 transition-all">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
          {/* Channel Selection */}
          <div className="space-y-3">
            <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Канал связи</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setChannel('EMAIL')}
                className={cn(
                  'h-14 rounded-2xl border-2 flex items-center justify-center gap-3 font-black text-xs uppercase tracking-widest transition-all',
                  channel === 'EMAIL' 
                    ? 'bg-neutral-900 border-neutral-900 text-white shadow-lg shadow-black/10' 
                    : 'bg-white border-neutral-100 text-neutral-400 hover:border-neutral-200'
                )}
              >
                <Mail size={18} /> Email
              </button>
              <button
                onClick={() => setChannel('TELEGRAM')}
                className={cn(
                  'h-14 rounded-2xl border-2 flex items-center justify-center gap-3 font-black text-xs uppercase tracking-widest transition-all',
                  channel === 'TELEGRAM' 
                    ? 'bg-neutral-900 border-neutral-900 text-white shadow-lg shadow-black/10' 
                    : 'bg-white border-neutral-100 text-neutral-400 hover:border-neutral-200'
                )}
              >
                <MessageSquare size={18} /> Telegram
              </button>
            </div>
          </div>

          {/* Template Selection */}
          <div className="space-y-3">
            <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Шаблон сообщения</label>
            <select
              value={templateCode}
              onChange={(e) => setTemplateCode(e.target.value)}
              className="w-full h-12 px-4 bg-neutral-50 border border-neutral-200 rounded-xl text-sm font-bold outline-none focus:border-neutral-900 focus:bg-white transition-all appearance-none"
            >
              <option value="">Без шаблона (ручной ввод)</option>
              {templates.filter(t => t.channel === channel && t.isActive).map(t => (
                <option key={t.id} value={t.code}>{t.code} — {t.subject || 'Без темы'}</option>
              ))}
            </select>
          </div>

          {!templateCode ? (
            <>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Тема сообщения</label>
                <input
                  type="text"
                  value={customSubject}
                  onChange={(e) => setCustomSubject(e.target.value)}
                  placeholder="Например: Спешите! Скидки 20% на все букеты"
                  className="w-full h-12 px-4 bg-neutral-50 border border-neutral-200 rounded-xl text-sm font-bold outline-none focus:border-neutral-900 focus:bg-white transition-all"
                />
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Текст сообщения</label>
                <textarea
                  value={customBody}
                  onChange={(e) => setCustomBody(e.target.value)}
                  rows={4}
                  placeholder="Введите текст сообщения..."
                  className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm font-bold outline-none focus:border-neutral-900 focus:bg-white transition-all resize-none"
                />
              </div>
            </>
          ) : (
            <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-100">
              <div className="flex gap-3">
                <AlertCircle size={20} className="text-emerald-500 shrink-0" />
                <div>
                  <p className="text-sm font-black text-emerald-900">Выбран шаблон: {selectedTemplate?.code}</p>
                  <p className="text-xs font-bold text-emerald-700/70 mt-1 leading-relaxed">
                    {selectedTemplate?.bodyTemplate}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-8 border-t border-neutral-50 flex gap-4 bg-neutral-50/30">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 h-14 bg-white border border-neutral-200 text-neutral-400 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-neutral-50 transition-all active:scale-95"
          >
            Отмена
          </button>
          <button
            onClick={handleSend}
            disabled={sending || selectedCustomers.length === 0}
            className="flex-[2] h-14 bg-neutral-900 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-black transition-all flex items-center justify-center gap-2 shadow-xl shadow-black/10 active:scale-95 disabled:opacity-50"
          >
            {sending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
            Запустить рассылку
          </button>
        </div>
      </div>
    </div>
  )
}
