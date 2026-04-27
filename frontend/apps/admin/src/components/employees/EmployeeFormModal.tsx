import React, { useState } from 'react'
import { X, UserPlus, Loader2, Save, Shield, Store as StoreIcon, Lock, CheckCircle2 } from 'lucide-react'
import { AuthService, EmployeeService, Employee } from '@/lib/api'
import { useDashboardStore } from '@/store/useDashboardStore'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface EmployeeFormModalProps {
  onClose: () => void
  onSuccess: () => void
  employee?: Employee // If provided, we are in EDIT mode
}

const ROLES = [
  { id: 'FLORIST', name: 'Флорист' },
  { id: 'CASHIER', name: 'Кассир' },
  { id: 'COURIER', name: 'Курьер' },
  { id: 'MANAGER', name: 'Менеджер' },
  { id: 'ADMIN', name: 'Админ' },
]

export function EmployeeFormModal({ onClose, onSuccess, employee }: EmployeeFormModalProps) {
  const isEdit = !!employee
  const { stores } = useDashboardStore()
  const [loading, setLoading] = useState(false)
  
  // Registration data (only for NEW)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  
  // Employee data
  const [firstName, setFirstName] = useState(employee?.firstName || '')
  const [lastName, setLastName] = useState(employee?.lastName || '')
  const [phone, setPhone] = useState(employee?.phone || '')
  const [role, setRole] = useState(employee?.role || 'FLORIST')
  const [storeId, setStoreId] = useState(employee?.storeId || '')
  const [active, setActive] = useState(employee?.active ?? true)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!firstName || !lastName || !phone || !role || !storeId) {
        toast.error('Заполните все персональные данные и выберите филиал')
        return
    }

    setLoading(true)
    try {
      if (isEdit) {
        await EmployeeService.update(employee.id, {
          firstName,
          lastName,
          phone,
          role: role as any,
          storeId,
          active,
          avatarUrl: employee.avatarUrl
        })
        toast.success('Профиль обновлен')
      } else {
        if (!email || !password) {
          toast.error('Укажите email и пароль для регистрации')
          return
        }
        // 1. Register User
        const regRes = await AuthService.register({
          email,
          password,
          firstName,
          lastName,
          phone,
          role
        })
        const userId = regRes.data.userId
        
        // 2. Create Employee Profile
        await EmployeeService.create({
          userId: userId!,
          storeId,
          firstName,
          lastName,
          phone,
          role: role as any,
          hireDate: new Date().toISOString().split('T')[0]
        })
        toast.success('Сотрудник успешно создан')
      }
      onSuccess()
    } catch (err: any) {
      console.error('Submit error:', err)
      toast.error('Ошибка: ' + (err.response?.data?.message || err.message))
    } finally {
      setLoading(false)
    }
  }

  return (
      <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/40 backdrop-blur-[2px] animate-in fade-in duration-300">
        <div className="absolute inset-0" onClick={onClose} />
        
        <div className="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300 border border-neutral-200">
          <div className="p-8 pb-6 border-b border-neutral-100 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-black text-neutral-900 tracking-tighter">
                {isEdit ? 'Профиль' : 'Регистрация'}
              </h2>
              <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mt-1">
                {isEdit ? 'Управление данными сотрудника' : 'Создание новой учетной записи'}
              </p>
            </div>
            <button onClick={onClose} className="h-10 w-10 flex items-center justify-center rounded-2xl hover:bg-neutral-50 transition-all text-neutral-300 hover:text-neutral-900 border border-neutral-100">
              <X size={20} />
            </button>
          </div>
  
          <form onSubmit={handleSubmit} className="p-8 overflow-y-auto max-h-[70vh] space-y-8 custom-scrollbar">
            {!isEdit && (
                <div className="space-y-5 p-6 bg-neutral-50 rounded-2xl border border-neutral-100 shadow-inner">
                    <div className="flex items-center gap-2">
                        <Lock size={12} className="text-neutral-400" />
                        <span className="text-[9px] font-black text-neutral-400 uppercase tracking-widest">Авторизация</span>
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                        <div className="space-y-2">
                            <label className="text-[8px] font-black text-neutral-500 uppercase tracking-widest ml-1">Email в системе</label>
                            <input 
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="name@florify.ru"
                                className="w-full h-12 px-5 bg-white border border-neutral-200 rounded-xl text-xs font-bold focus:border-neutral-900 outline-none transition-all shadow-sm"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[8px] font-black text-neutral-500 uppercase tracking-widest ml-1">Временный пароль</label>
                            <input 
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full h-12 px-5 bg-white border border-neutral-200 rounded-xl text-xs font-bold focus:border-neutral-900 outline-none transition-all shadow-sm"
                            />
                        </div>
                    </div>
                </div>
            )}

            <div className="space-y-5">
              <div className="flex items-center gap-2">
                <UserPlus size={12} className="text-neutral-400" />
                <span className="text-[9px] font-black text-neutral-400 uppercase tracking-widest">Основные сведения</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[8px] font-black text-neutral-500 uppercase tracking-widest ml-1">Имя</label>
                  <input 
                    type="text"
                    value={firstName}
                    autoComplete="off"
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full h-12 px-5 bg-white border border-neutral-200 rounded-xl text-xs font-bold focus:border-neutral-900 outline-none transition-all shadow-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[8px] font-black text-neutral-500 uppercase tracking-widest ml-1">Фамилия</label>
                  <input 
                    type="text"
                    value={lastName}
                    autoComplete="off"
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full h-12 px-5 bg-white border border-neutral-200 rounded-xl text-xs font-bold focus:border-neutral-900 outline-none transition-all shadow-sm"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[8px] font-black text-neutral-500 uppercase tracking-widest ml-1">Номер телефона</label>
                <input 
                  type="text"
                  value={phone}
                  placeholder="+7 (___) ___-__-__"
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full h-12 px-5 bg-white border border-neutral-200 rounded-xl text-xs font-bold focus:border-neutral-900 outline-none transition-all shadow-sm"
                />
              </div>
            </div>

            <div className="space-y-5">
                <div className="flex items-center gap-2">
                   <Shield size={12} className="text-neutral-400" />
                   <span className="text-[9px] font-black text-neutral-400 uppercase tracking-widest">Назначение</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[8px] font-black text-neutral-500 uppercase tracking-widest ml-1">Должность</label>
                      <select 
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        className="w-full h-12 px-5 bg-white border border-neutral-200 rounded-xl text-xs font-bold focus:border-neutral-900 outline-none transition-all shadow-sm appearance-none cursor-pointer"
                      >
                        {ROLES.map(r => (
                          <option key={r.id} value={r.id}>{r.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[8px] font-black text-neutral-500 uppercase tracking-widest ml-1">Место работы</label>
                      <select 
                        value={storeId}
                        onChange={(e) => setStoreId(e.target.value)}
                        className="w-full h-12 px-5 bg-white border border-neutral-200 rounded-xl text-xs font-bold focus:border-neutral-900 outline-none transition-all shadow-sm appearance-none cursor-pointer"
                      >
                        <option value="">Выберите филиал...</option>
                        {stores.map(s => (s.id && (
                          <option key={s.id} value={s.id}>{s.name || 'Точка продаж'}</option>
                        )))}
                      </select>
                    </div>
                </div>
            </div>

            {isEdit && (
                <div className="pt-4 border-t border-neutral-50">
                    <button 
                        type="button"
                        onClick={() => setActive(!active)}
                        className={cn(
                            "w-full h-14 rounded-2xl border flex items-center justify-between px-6 transition-all group",
                            active ? "bg-emerald-50/50 border-emerald-100 text-emerald-900" : "bg-neutral-50 border-neutral-200 text-neutral-500"
                        )}
                    >
                        <div className="flex items-center gap-4">
                            <div className={cn(
                                "h-10 w-10 rounded-xl flex items-center justify-center transition-all",
                                active ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" : "bg-neutral-200 text-neutral-400"
                            )}>
                                <CheckCircle2 size={20} />
                            </div>
                            <div className="text-left">
                                <p className="text-[10px] font-black uppercase tracking-widest leading-none mb-1">Статус доступа</p>
                                <p className="text-xs font-bold opacity-60">{active ? 'Доступ в систему открыт' : 'Доступ временно заблокирован'}</p>
                            </div>
                        </div>
                        <div className={cn(
                            "w-12 h-6 rounded-full relative transition-all p-1",
                            active ? "bg-emerald-500" : "bg-neutral-300"
                        )}>
                            <div className={cn(
                                "h-4 w-4 bg-white rounded-full transition-all shadow-sm",
                                active ? "translate-x-6" : "translate-x-0"
                            )} />
                        </div>
                    </button>
                </div>
            )}
  
            <button 
              type="submit"
              disabled={loading}
              className="w-full h-14 bg-neutral-900 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-black transition-all shadow-xl shadow-black/10 disabled:opacity-50 mt-4 active:scale-95"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
              {isEdit ? 'Сохранить изменения' : 'Создать учетную запись'}
            </button>
          </form>
        </div>
      </div>
    )
}
