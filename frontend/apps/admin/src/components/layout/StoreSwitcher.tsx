import { useEffect, useState, useRef } from 'react'
import { Store, ChevronDown, Check, Loader2 } from 'lucide-react'
import { useDashboardStore } from '@/store/useDashboardStore'
import { cn } from '@/lib/utils'

export function StoreSwitcher() {
  const { stores, currentStoreId, setStoreId, fetchStores, isStoresLoading } = useDashboardStore()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchStores()
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const currentStore = stores.find(s => s.id === currentStoreId)

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-3 px-4 py-2.5 rounded-2xl transition-all duration-300 border",
          isOpen 
            ? "bg-white border-[var(--color-brand)] shadow-lg ring-4 ring-[var(--color-brand)]/5" 
            : "bg-neutral-50 border-transparent hover:bg-neutral-100"
        )}
      >
        <div className={cn(
          "h-8 w-8 rounded-xl flex items-center justify-center transition-colors duration-300",
          isOpen ? "bg-[var(--color-brand)] text-white" : "bg-white text-[var(--color-brand)] shadow-sm"
        )}>
          {isStoresLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Store className="h-4 w-4" />}
        </div>
        
        <div className="text-left hidden md:block">
          <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400 leading-none mb-1">Филиал</p>
          <p className={cn(
            "text-sm font-bold leading-none",
            currentStore ? "text-neutral-900" : "text-red-500"
          )}>
            {currentStore ? currentStore.name : 'Выберите филиал'}
          </p>
        </div>

        <ChevronDown className={cn(
          "h-4 w-4 text-neutral-400 transition-transform duration-300",
          isOpen && "rotate-180"
        )} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-3 w-72 bg-white rounded-[2rem] border border-neutral-100 shadow-2xl p-3 animate-in zoom-in-95 duration-200 z-50 overflow-hidden">
          <div className="px-4 py-3 mb-2">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-300">Список филиалов</h4>
          </div>
          
          <div className="space-y-1">
            <button
              onClick={() => { setStoreId(null); setIsOpen(false); }}
              className={cn(
                "w-full flex items-center justify-between px-4 py-3 rounded-2xl transition-all group",
                !currentStoreId ? "bg-red-50 text-red-600" : "hover:bg-neutral-50"
              )}
            >
              <div className="flex items-center gap-3">
                <div className={cn(
                  "h-8 w-8 rounded-lg flex items-center justify-center border transition-colors",
                  !currentStoreId ? "border-red-200 bg-white" : "border-neutral-100 bg-neutral-50 group-hover:bg-white"
                )}>
                  <Store className="h-4 w-4" />
                </div>
                <span className="text-sm font-bold text-neutral-400">Сбросить выбор</span>
              </div>
              {!currentStoreId && <Check className="h-4 w-4" />}
            </button>

            <div className="h-px bg-neutral-50 mx-4 my-2" />

            {stores.map((store) => (
              <button
                key={store.id}
                onClick={() => { setStoreId(store.id); setIsOpen(false); }}
                className={cn(
                  "w-full flex items-center justify-between px-4 py-3 rounded-2xl transition-all group",
                  currentStoreId === store.id ? "bg-[var(--color-brand-light)] text-[var(--color-brand)]" : "hover:bg-neutral-50"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "h-8 w-8 rounded-lg flex items-center justify-center border transition-colors",
                    currentStoreId === store.id ? "border-[var(--color-brand)] bg-white" : "border-neutral-100 bg-neutral-50 group-hover:bg-white"
                  )}>
                    <Store className="h-4 w-4" />
                  </div>
                  <div className="text-left">
                    <span className="text-sm font-bold block">{store.name}</span>
                    <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest leading-none">
                      {store.active ? 'Активен' : 'Неактивен'}
                    </span>
                  </div>
                </div>
                {currentStoreId === store.id && <Check className="h-4 w-4" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
