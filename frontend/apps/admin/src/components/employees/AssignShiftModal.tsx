import React, { useState } from 'react'
import { X, Play, Loader2, Square, CalendarClock, CheckCircle } from 'lucide-react'
import { TimesheetService, Employee } from '@/lib/api'
import { toast } from 'sonner'

interface AssignShiftModalProps {
  onClose: () => void
  onSuccess: () => void
  employees: Employee[]
  defaultEmployeeId?: string
  defaultDate?: string
}

export function AssignShiftModal({ onClose, onSuccess, employees, defaultEmployeeId, defaultDate }: AssignShiftModalProps) {
  const [mode, setMode] = useState<'manual' | 'plan'>('manual')
  const [employeeId, setEmployeeId] = useState(defaultEmployeeId || '')
  
  // Planning state
  const [planDate, setPlanDate] = useState(defaultDate || new Date().toISOString().split('T')[0])
  const [planStartTime, setPlanStartTime] = useState('10:00')
  const [planEndTime, setPlanEndTime] = useState('22:00')

  const [loading, setLoading] = useState(false)
  
  const handleCheckin = async () => {
    if (!employeeId) {
      toast.error('Выберите сотрудника')
      return
    }
    setLoading(true)
    try {
      await TimesheetService.checkin(employeeId)
      toast.success('Смена успешно открыта')
      onSuccess()
    } catch (err: any) {
      toast.error('Ошибка: ' + (err.response?.data?.message || err.message))
    } finally {
      setLoading(false)
    }
  }

  const handleCheckout = async () => {
    if (!employeeId) {
      toast.error('Выберите сотрудника')
      return
    }
    setLoading(true)
    try {
      await TimesheetService.checkout(employeeId)
      toast.success('Смена успешно закрыта')
      onSuccess()
    } catch (err: any) {
      toast.error('Ошибка: ' + (err.response?.data?.message || err.message))
    } finally {
      setLoading(false)
    }
  }

  const handleSchedule = async () => {
    if (!employeeId) {
      toast.error('Выберите сотрудника')
      return
    }
    if (!planDate || !planStartTime || !planEndTime) {
      toast.error('Заполните дату и время смены')
      return
    }

    setLoading(true)
    try {
      // Create full ISO strings in local time for simplicity
      // Usually you'd want to handle timezones properly
      const startStr = `${planDate}T${planStartTime}:00.000Z`
      const endStr = `${planDate}T${planEndTime}:00.000Z`

      await TimesheetService.schedule({
        employeeId,
        date: planDate,
        scheduledStartAt: startStr,
        scheduledEndAt: endStr
      })
      toast.success('Смена успешно запланирована')
      onSuccess()
    } catch (err: any) {
      toast.error('Ошибка: ' + (err.response?.data?.message || err.message))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/40 backdrop-blur-[2px] animate-in fade-in duration-300">
      <div className="absolute inset-0" onClick={onClose} />
      
      <div className="relative bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300 border border-neutral-200">
        <div className="p-6 border-b border-neutral-100 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-neutral-900 tracking-tighter">Управление сменой</h2>
            <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mt-1">
              Ручное открытие и закрытие смен
            </p>
          </div>
          <button onClick={onClose} className="h-8 w-8 flex items-center justify-center rounded-xl hover:bg-neutral-50 transition-all text-neutral-300 hover:text-neutral-900 border border-neutral-100">
            <X size={16} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Mode switch */}
          <div className="flex bg-neutral-100 p-1 rounded-xl">
            <button
              onClick={() => setMode('manual')}
              className={`flex-1 h-8 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                mode === 'manual' ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-400 hover:text-neutral-600'
              }`}
            >
              Сейчас
            </button>
            <button
              onClick={() => setMode('plan')}
              className={`flex-1 h-8 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                mode === 'plan' ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-400 hover:text-neutral-600'
              }`}
            >
              Запланировать
            </button>
          </div>

          <div className="space-y-2">
            <label className="text-[8px] font-black text-neutral-500 uppercase tracking-widest ml-1">Сотрудник</label>
            <select 
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              className="w-full h-12 px-5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-bold focus:border-neutral-900 focus:bg-white outline-none transition-all shadow-sm appearance-none cursor-pointer"
            >
              <option value="">Выберите сотрудника...</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName} ({emp.role})</option>
              ))}
            </select>
          </div>

          {mode === 'manual' ? (
            <>
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={handleCheckin}
                  disabled={loading || !employeeId}
                  className="h-12 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800 border border-emerald-200 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all disabled:opacity-50 active:scale-95"
                >
                  {loading ? <Loader2 className="animate-spin" size={14} /> : <Play size={14} />}
                  Открыть
                </button>
                <button 
                  onClick={handleCheckout}
                  disabled={loading || !employeeId}
                  className="h-12 bg-rose-50 text-rose-700 hover:bg-rose-100 hover:text-rose-800 border border-rose-200 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all disabled:opacity-50 active:scale-95"
                >
                  {loading ? <Loader2 className="animate-spin" size={14} /> : <Square size={14} />}
                  Закрыть
                </button>
              </div>
              
              <div className="text-center pt-2">
                <p className="text-[9px] font-bold text-neutral-400">
                  Открытие смены фиксирует время прихода.<br/>Закрытие — время ухода и часы работы.
                </p>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[8px] font-black text-neutral-500 uppercase tracking-widest ml-1">Дата</label>
                <input 
                  type="date"
                  value={planDate}
                  onChange={e => setPlanDate(e.target.value)}
                  className="w-full h-10 px-4 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-bold outline-none focus:border-neutral-900 transition-all"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="text-[8px] font-black text-neutral-500 uppercase tracking-widest ml-1">Начало</label>
                  <input 
                    type="time"
                    value={planStartTime}
                    onChange={e => setPlanStartTime(e.target.value)}
                    className="w-full h-10 px-4 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-bold outline-none focus:border-neutral-900 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[8px] font-black text-neutral-500 uppercase tracking-widest ml-1">Конец</label>
                  <input 
                    type="time"
                    value={planEndTime}
                    onChange={e => setPlanEndTime(e.target.value)}
                    className="w-full h-10 px-4 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-bold outline-none focus:border-neutral-900 transition-all"
                  />
                </div>
              </div>
              <button 
                onClick={handleSchedule}
                disabled={loading || !employeeId}
                className="w-full h-12 bg-neutral-900 text-white hover:bg-black rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all disabled:opacity-50 mt-4 shadow-lg shadow-black/10 active:scale-95"
              >
                {loading ? <Loader2 className="animate-spin" size={14} /> : <CalendarClock size={14} />}
                Запланировать
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
