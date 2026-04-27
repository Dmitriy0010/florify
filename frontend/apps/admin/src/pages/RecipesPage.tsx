import { useState } from 'react'
import { 
  UtensilsCrossed, 
  Plus, 
  Flower2,
  ChevronRight,
  Trash2,
  CheckCircle2,
  Loader2,
  X,
  Layers
} from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { RecipeService, CatalogService, RecipeItem } from '@/lib/api'
import { toast } from 'sonner'

export default function RecipesPage() {
  const queryClient = useQueryClient()
  const [searchQuery] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Fetch real recipes
  const { data: recipesData = [], isLoading } = useQuery({
    queryKey: ['recipes'],
    queryFn: () => RecipeService.getRecipes().then(res => res.data)
  })

  // Fetch products for name mapping
  const { data: products = [] } = useQuery({
    queryKey: ['catalog-products'],
    queryFn: () => CatalogService.getProducts({ size: 1000 }).then(res => res.data.data)
  })

  const recipes = recipesData.map(r => ({
    ...r,
    productName: products.find(p => p.id === r.productId)?.name || 'Загрузка...',
    items: r.items.map(it => ({
        ...it,
        ingredientName: products.find(p => p.id === it.ingredientId)?.name || 'Загрузка...',
        unit: products.find(p => p.id === it.ingredientId)?.unit || 'шт'
    }))
  }))

  const deleteMutation = useMutation({
    mutationFn: (id: string) => RecipeService.deleteRecipe(id),
    onSuccess: () => {
      toast.success('Рецепт удален')
      queryClient.invalidateQueries({ queryKey: ['recipes'] })
    }
  })

  const filteredRecipes = recipes.filter(r => 
    r.productName.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-neutral-900 tracking-tight">Рецепты и Составы</h1>
          <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest flex items-center gap-2">
            <Layers size={14} className="text-[var(--color-brand)]" />
            Технологические карты букетов (BOM)
          </p>
        </div>

        <button 
          onClick={() => setIsModalOpen(true)}
          className="h-11 px-8 bg-neutral-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-lg shadow-black/10 flex items-center gap-2"
        >
           <Plus className="h-4 w-4" />
           Создать спецификацию
        </button>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="py-40 flex flex-col items-center justify-center gap-4">
           <Loader2 className="animate-spin text-neutral-200" size={40} />
           <p className="text-[10px] font-black text-neutral-300 uppercase tracking-widest">Загрузка спецификаций...</p>
        </div>
      ) : recipes.length === 0 ? (
        <div className="py-32 text-center border-2 border-dashed border-neutral-100 rounded-[3rem] opacity-30 flex flex-col items-center gap-6">
           <UtensilsCrossed size={60} strokeWidth={1} />
           <div className="space-y-1">
              <p className="text-[10px] font-black uppercase tracking-[0.3em]">Рецепты не добавлены</p>
              <p className="text-[8px] font-bold uppercase tracking-widest">Начните с создания первой тех-карты</p>
           </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredRecipes.map((recipe) => (
            <div key={recipe.id} className="bg-white p-8 rounded-[3rem] border border-neutral-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group overflow-hidden relative">
               <div className="flex justify-between items-start mb-8 relative z-10">
                  <div className="h-14 w-14 rounded-2xl bg-neutral-50 flex items-center justify-center text-neutral-400 group-hover:bg-[var(--color-brand-light)] group-hover:text-[var(--color-brand)] transition-colors border border-neutral-100">
                    <Flower2 className="h-7 w-7" />
                  </div>
                  <button onClick={() => deleteMutation.mutate(recipe.id)} className="h-10 w-10 flex items-center justify-center text-neutral-200 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                     <Trash2 size={18} />
                  </button>
               </div>
               
               <div className="space-y-6 relative z-10">
                  <div>
                    <h3 className="text-lg font-black text-neutral-900 leading-tight group-hover:text-[var(--color-brand)] transition-colors">{recipe.productName}</h3>
                    <p className="text-[9px] font-black text-neutral-300 uppercase tracking-widest mt-1">Основной продукт</p>
                  </div>
                  
                  <div className="space-y-3 py-4 border-y border-neutral-50">
                    <p className="text-[9px] font-black text-neutral-400 uppercase tracking-widest">Состав ({recipe.items.length} комп.)</p>
                    <div className="space-y-2">
                       {recipe.items.slice(0, 3).map((item, i) => (
                         <div key={i} className="flex items-center justify-between text-xs font-bold text-neutral-500">
                           <span className="truncate max-w-[150px]">{item.ingredientName}</span>
                           <span className="text-neutral-400 tabular-nums">{item.quantity} {item.unit}</span>
                         </div>
                       ))}
                       {recipe.items.length > 3 && (
                         <p className="text-[10px] font-black text-[var(--color-brand)] uppercase tracking-widest pt-1">
                           + еще {recipe.items.length - 3} компонентов
                         </p>
                       )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                     <div className="flex items-center gap-2">
                        <CheckCircle2 size={14} className="text-green-500" />
                        <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Активен</span>
                     </div>
                     <button className="h-10 w-10 bg-neutral-900 text-white rounded-xl flex items-center justify-center hover:bg-black transition-all shadow-sm">
                        <ChevronRight className="h-5 w-5" />
                     </button>
                  </div>
               </div>
               
               <UtensilsCrossed className="absolute -right-6 -bottom-6 h-32 w-32 text-neutral-50 opacity-[0.03] group-hover:opacity-[0.08] transition-all rotate-12" />
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <CreateRecipeModal 
          onClose={() => setIsModalOpen(false)} 
          onSuccess={() => {
            setIsModalOpen(false)
            queryClient.invalidateQueries({ queryKey: ['recipes'] })
          }}
        />
      )}
    </div>
  )
}

function CreateRecipeModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [selectedProductId, setSelectedProductId] = useState('')
  const [items, setItems] = useState<Omit<RecipeItem, 'ingredientName' | 'unit'>[]>([])
  
  const { data: products = [] } = useQuery({
    queryKey: ['catalog-products'],
    queryFn: () => CatalogService.getProducts({ size: 1000 }).then(res => res.data.data)
  })

  const createMutation = useMutation({
    mutationFn: (data: any) => RecipeService.createRecipe(data),
    onSuccess: () => {
      toast.success('Технологическая карта сохранена')
      onSuccess()
    }
  })

  const addItem = () => setItems([...items, { ingredientId: '', quantity: 1 }])
  const removeItem = (index: number) => setItems(items.filter((_, i) => i !== index))
  const updateItem = (index: number, field: string, value: any) => {
    setItems(items.map((it, i) => i === index ? { ...it, [field]: value } : it))
  }

  const handleSave = () => {
    const targetProduct = products.find(p => p.id === selectedProductId)
    if (!targetProduct) return toast.error('Выберите основной продукт')
    if (items.some(it => !it.ingredientId)) return toast.error('Выберите все компоненты')

    createMutation.mutate({
      productId: selectedProductId,
      items: items.map(it => ({
        ingredientId: it.ingredientId,
        quantity: it.quantity
      }))
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl flex flex-col h-[80vh] animate-in zoom-in-95 duration-300 overflow-hidden">
        <div className="p-10 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/50">
           <div className="flex items-center gap-4">
              <div className="h-12 w-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-neutral-100 text-[var(--color-brand)]">
                 <UtensilsCrossed size={24} />
              </div>
              <h2 className="text-2xl font-black text-neutral-900 tracking-tight">Новый состав</h2>
           </div>
           <button onClick={onClose} className="text-neutral-300 hover:text-neutral-900"><X size={28} /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-10 space-y-10 scrollbar-hide">
           {/* Target Product */}
           <div className="space-y-4">
              <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Целевой продукт (для кого рецепт?)</label>
              <select 
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="w-full h-14 px-6 bg-neutral-50 border border-neutral-100 rounded-2xl text-sm font-bold focus:bg-white focus:border-[var(--color-brand)] transition-all outline-none appearance-none"
              >
                <option value="">Выберите товар из каталога...</option>
                {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
           </div>

           {/* Components */}
           <div className="space-y-6">
              <div className="flex justify-between items-center">
                 <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Компоненты состава</label>
                 <button onClick={addItem} className="text-[10px] font-black text-[var(--color-brand)] uppercase tracking-widest hover:underline flex items-center gap-1.5">
                    <Plus size={10} /> Добавить компонент
                 </button>
              </div>

              <div className="space-y-3">
                 {items.map((item, i) => (
                   <div key={i} className="flex gap-3 animate-in slide-in-from-right-4 duration-300">
                      <select 
                        value={item.ingredientId}
                        onChange={(e) => updateItem(i, 'ingredientId', e.target.value)}
                        className="flex-1 h-12 px-4 bg-neutral-50 border border-neutral-100 rounded-xl text-xs font-bold outline-none"
                      >
                        <option value="">Выберите цветок/декор...</option>
                        {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                      </select>
                      <div className="w-24 group relative">
                        <input 
                          type="number"
                          step="1"
                          value={item.quantity}
                          onChange={(e) => updateItem(i, 'quantity', Number(e.target.value))}
                          className="w-full h-12 px-4 bg-neutral-50 border border-neutral-100 rounded-xl text-xs font-bold text-center outline-none"
                        />
                         <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-white px-1.5 text-[8px] font-black text-neutral-300 uppercase">Кол-во</div>
                      </div>
                      <button onClick={() => removeItem(i)} className="h-12 w-12 flex items-center justify-center text-neutral-300 hover:text-red-500 transition-colors">
                        <Trash2 size={18} />
                      </button>
                   </div>
                 ))}
                 {items.length === 0 && (
                   <div className="py-12 text-center border-2 border-dashed border-neutral-50 rounded-3xl opacity-20 flex flex-col items-center gap-2">
                      <Plus size={24} />
                      <p className="text-[10px] font-black uppercase tracking-widest">Список пуст</p>
                   </div>
                 )}
              </div>
           </div>
        </div>

        <div className="p-10 border-t border-neutral-100 bg-neutral-50/50 flex gap-4">
           <button 
             onClick={handleSave}
             disabled={createMutation.isPending}
             className="flex-1 h-14 bg-neutral-900 text-white rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-black/10 flex items-center justify-center gap-2"
           >
              {createMutation.isPending ? <Loader2 className="animate-spin" /> : <SaveIcon className="w-4 h-4" />}
              Сохранить спецификацию
           </button>
           <button onClick={onClose} className="h-14 px-8 bg-white border border-neutral-100 text-neutral-400 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest hover:bg-neutral-50 hover:text-neutral-900 transition-all">
              Отмена
           </button>
        </div>
      </div>
    </div>
  )
}

function SaveIcon({ className }: { className?: string }) {
  return (
    <svg 
      className={className} 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
      <polyline points="17 21 17 13 7 13 7 21" />
      <polyline points="7 3 7 8 15 8" />
    </svg>
  )
}
