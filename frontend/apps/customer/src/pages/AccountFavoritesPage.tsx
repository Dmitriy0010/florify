import { useFavoritesStore } from '@/store/favoritesStore'
import { ProductCard } from '@/components/ProductCard'
import { Heart, Loader2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import type { Product } from '@/api/types'

export function AccountFavoritesPage() {
  const { items } = useFavoritesStore()

  if (items.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-[var(--color-border)] p-12 text-center space-y-6">
        <div className="h-20 w-20 bg-neutral-50 rounded-full flex items-center justify-center mx-auto text-neutral-300">
          <Heart className="h-10 w-10" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-[var(--color-text-primary)]">В избранном пока ничего нет</h2>
          <p className="text-[var(--color-text-tertiary)] max-w-sm mx-auto">
            Добавляйте понравившиеся товары в избранное, чтобы легко находить их позже.
          </p>
        </div>
        <Link to="/catalog">
          <Button variant="brand" className="rounded-xl px-8">
            Перейти в каталог
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-display font-bold text-[var(--color-text-primary)]">Избранное</h1>
        <div className="bg-neutral-50 rounded-full border border-neutral-200 px-3 py-0.5 font-medium text-neutral-600 text-sm">
          {items.length} {items.length === 1 ? 'товар' : items.length < 5 ? 'товара' : 'товаров'}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {items.map((item) => {
          // Reconstruct partial product for the ProductCard
          const product: Product = {
            id: item.productId,
            sku: '',
            name: item.name,
            categoryId: '',
            unit: 'PIECE',
            currentPrice: item.price,
            imageUrl: item.image || undefined,
            active: true,
          }
          
          return <ProductCard key={item.productId} product={product} />
        })}
      </div>
    </div>
  )
}
