import React, { useState } from 'react'
import { X, Save, Loader2, Bell, AlertCircle } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { NotificationService, NotificationTemplate } from '@/lib/api'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface TemplateEditModalProps {
  template?: NotificationTemplate
  onClose: () => void
}

export function TemplateEditModal({ template, onClose }: TemplateEditModalProps) {
  const queryClient = useQueryClient()
  const [formData, setFormData] = useState({
    code: template?.code || '',
    channel: (template?.channel || 'EMAIL') as 'EMAIL' | 'TELEGRAM',
    subject: template?.subject || '',
    bodyTemplate: template?.bodyTemplate || '',
    isActive: template?.isActive ?? true
  })

  const mutation = useMutation({
    mutationFn: (data: any) =>
      template?.id
        ? NotificationService.updateTemplate(template.id, data)
        : NotificationService.createTemplate({
            code: formData.code,
            channel: formData.channel,
            subject: formData.subject,
            bodyTemplate: formData.bodyTemplate,
            isActive: formData.isActive
          }),
    onSuccess: () => {
      toast.success(template ? 'Шаблон обновлён' : 'Шаблон создан')
      queryClient.invalidateQueries({ queryKey: ['notification-templates'] })
      onClose()
    },
    onError: () => toast.error('Ошибка при сохранении')
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    mutation.mutate(formData)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300 overflow-hidden">
        {/* Header */}
        <div className="p-10 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/50">
           <div className="flex items-center gap-4">
              <div className="h-12 w-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-neutral-100 text-[var(--color-brand)]">
                 <Bell size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-black text-neutral-900 tracking-tight">
                  {template ? 'Редактор шаблона' : 'Новый шаблон'}
                </h2>
                <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mt-1">
                  {template ? `Код: ${template.code}` : 'Создать уведомление'}
                </p>
              </div>
           </div>
           <button onClick={onClose} className="text-neutral-300 hover:text-neutral-900 transition-colors">
             <X size={28} />
           </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-10 space-y-8 scrollbar-hide">
           {/* Code field (only for create) */}
           {!template && (
             <div className="grid grid-cols-2 gap-6">
               <div className="space-y-2">
                 <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Код шаблона *</label>
                 <input
                   required
                   value={formData.code}
                   onChange={e => setFormData({ ...formData, code: e.target.value })}
                   placeholder="ORDER_CONFIRMED"
                   className="w-full h-12 px-5 bg-neutral-50 border border-neutral-100 rounded-xl text-sm font-bold focus:bg-white focus:border-[var(--color-brand)] transition-all outline-none uppercase"
                 />
               </div>
               <div className="space-y-2">
                 <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Канал</label>
                 <select value={formData.channel} onChange={e => setFormData({ ...formData, channel: e.target.value as any })}
                   className="w-full h-12 px-5 bg-neutral-50 border border-neutral-100 rounded-xl text-sm font-bold focus:bg-white focus:border-[var(--color-brand)] transition-all outline-none appearance-none">
                   <option value="EMAIL">Email</option>
                   <option value="TELEGRAM">Telegram</option>
                 </select>
               </div>
             </div>
           )}

           {/* General Settings */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                 <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Канал</label>
                 <div className="w-full h-12 px-5 bg-neutral-50 border border-neutral-100 rounded-xl flex items-center text-xs font-bold text-neutral-400">
                    {template?.channel || formData.channel}
                 </div>
              </div>
              <div className="space-y-2">
                 <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Статус шаблона</label>
                 <div className="flex p-1 bg-neutral-50 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, isActive: true })}
                      className={cn(
                        "flex-1 py-2 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all",
                        formData.isActive ? "bg-white text-green-600 shadow-sm" : "text-neutral-400"
                      )}
                    >Активен</button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, isActive: false })}
                      className={cn(
                        "flex-1 py-2 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all",
                        !formData.isActive ? "bg-white text-red-500 shadow-sm" : "text-neutral-400"
                      )}
                    >Отключен</button>
                 </div>
              </div>
           </div>

           {/* Subject */}
           {(formData.channel === 'EMAIL' || template?.channel === 'EMAIL') && (
             <div className="space-y-2">
                <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Тема письма</label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={e => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full h-12 px-5 bg-neutral-50 border border-neutral-100 rounded-2xl text-sm font-bold focus:bg-white focus:border-[var(--color-brand)] transition-all outline-none"
                  placeholder="Напр. Ваш заказ {orderNumber} принят"
                />
             </div>
           )}

           {/* Body */}
           <div className="space-y-4">
              <div className="flex justify-between items-center px-1">
                 <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Текст сообщения</label>
                 <span className="text-[9px] font-bold text-neutral-300 italic">Переменные: {"{name}"}, {"{orderNumber}"}</span>
              </div>
              <textarea
                value={formData.bodyTemplate}
                onChange={e => setFormData({ ...formData, bodyTemplate: e.target.value })}
                rows={8}
                className="w-full p-6 bg-neutral-50 border border-neutral-100 rounded-3xl text-sm font-medium leading-relaxed focus:bg-white focus:border-[var(--color-brand)] transition-all outline-none resize-none"
                placeholder="Введите текст шаблона..."
              />
           </div>

           {/* Preview */}
           <div className="p-6 bg-[var(--color-brand-light)]/30 border border-[var(--color-brand-light)] rounded-3xl">
              <div className="flex items-center gap-2 mb-3">
                 <AlertCircle size={14} className="text-[var(--color-brand)]" />
                 <p className="text-[10px] font-black text-[var(--color-brand)] uppercase tracking-widest">Предпросмотр</p>
              </div>
              <p className="text-xs font-medium text-neutral-600 italic">
                {formData.bodyTemplate.replace(/\{name\}/g, 'Иван').replace(/\{orderNumber\}/g, 'FL-1234') || 'Введите текст для предпросмотра...'}
              </p>
           </div>
        </form>

        {/* Footer */}
        <div className="p-10 border-t border-neutral-100 bg-neutral-50/50 flex gap-4">
           <button
             onClick={handleSubmit}
             disabled={mutation.isPending}
             className="flex-1 h-14 bg-neutral-900 text-white rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-black/10 flex items-center justify-center gap-2 disabled:opacity-50"
           >
              {mutation.isPending ? <Loader2 className="animate-spin" /> : <Save size={16} />}
              {template ? 'Сохранить изменения' : 'Создать шаблон'}
           </button>
           <button onClick={onClose} className="h-14 px-8 bg-white border border-neutral-100 text-neutral-400 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest hover:bg-neutral-50 hover:text-neutral-900 transition-all">
              Отмена
           </button>
        </div>
      </div>
    </div>
  )
}
