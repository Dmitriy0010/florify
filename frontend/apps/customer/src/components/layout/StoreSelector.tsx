import { useEffect, useState } from 'react'
import { MapPin } from 'lucide-react'
import { storesApi, type Store } from '@/api/stores'
import { useShopStore } from '@/store/shopStore'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export function StoreSelector() {
  const [stores, setStores] = useState<Store[]>([])
  const { selectedStoreId, setSelectedStoreId } = useShopStore()

  useEffect(() => {
    storesApi.getAll().then((data) => {
      setStores(data)
      // If no store is selected yet, select the first one by default
      if (!selectedStoreId && data.length > 0) {
        setSelectedStoreId(data[0].id)
      }
    })
  }, [selectedStoreId, setSelectedStoreId])

  if (stores.length === 0) return null

  return (
    <div className="flex items-center gap-2">
      <MapPin className="h-4 w-4 text-[var(--color-brand)]" />
      <Select value={selectedStoreId || ''} onValueChange={setSelectedStoreId}>
        <SelectTrigger className="w-[200px] h-9 border-none bg-transparent hover:bg-neutral-50 font-medium focus:ring-0">
          <SelectValue placeholder="Выберите магазин">
             {stores.find(s => s.id === selectedStoreId)?.name || "Выберите магазин"}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {stores.map((store) => (
            <SelectItem key={store.id} value={store.id}>
              {store.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
