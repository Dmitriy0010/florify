import { Link } from 'react-router-dom'
import { ShoppingCart, Heart, Store, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useCartStore } from '@/store/cartStore'
import { useFavoritesStore } from '@/store/favoritesStore'
import { toast } from 'sonner'
import type { Product } from '@/api/types'
import { cn } from '@/lib/utils'
import { useState } from 'react'

interface ProductCardProps {
  product: Product
  className?: string
  /** true  = product has 0 stock in selected store */
  outOfStock?: boolean
  /** true  = no store selected yet (customer must pick one first) */
  noStoreSelected?: boolean
  /** called when user clicks "В корзину" without a store selected */
  onNeedStoreSelect?: () => void
}

export function ProductCard({
  product,
  className,
  outOfStock,
  noStoreSelected,
  onNeedStoreSelect,
}: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem)
  const { addItem: addFavorite, removeItem: removeFavorite, hasItem } = useFavoritesStore()
  const [imageError, setImageError] = useState(false)

  const isLiked = hasItem(product.id)

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    // Case 1: no store selected — prompt the user
    if (noStoreSelected) {
      onNeedStoreSelect?.()
      toast('Выберите магазин', {
        description: 'Чтобы добавить товар в корзину, сначала выберите магазин или адрес доставки.',
        icon: <Store className="h-4 w-4 text-[var(--color-brand)]" />,
        duration: 5000,
      })
      return
    }

    // Case 2: product not active in catalog
    if (!product.active) {
      toast.error('Товар временно недоступен')
      return
    }

    // Case 3: out of stock in selected store
    if (outOfStock) {
      toast.error('Товар закончился в выбранном магазине', {
        description: 'Попробуйте выбрать другой магазин.',
      })
      return
    }

    addItem({
      productId: product.id,
      name: product.name,
      price: product.currentPrice,
      image: product.imageUrl,
      maxQuantity: 100,
    })

    toast.success('Добавлено в корзину', {
      description: product.name,
    })
  }

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (isLiked) {
      removeFavorite(product.id)
      toast.success('Удалено из избранного', { description: product.name })
    } else {
      addFavorite({
        productId: product.id,
        name: product.name,
        price: product.currentPrice,
        image: product.imageUrl,
      })
      toast.success('Добавлено в избранное', { description: product.name })
    }
  }

  const fallbackImage =
    'https://images.unsplash.com/photo-1582794543139-8ac9cb0f7b11?q=80&w=600&auto=format&fit=crop'

  const getImageUrl = (url: string | null | undefined) => {
    if (!url) return fallbackImage
    if (url.startsWith('http') || url.startsWith('/')) return url
    return `/api/v1/media/${url}`
  }

  const imgSrc = imageError ? fallbackImage : getImageUrl(product.imageUrl)

  // Decide badge to show (priority: out-of-stock > catalog inactive)
  const unavailable = !product.active || outOfStock === true

  return (
    <Card
      className={cn(
        'group relative overflow-hidden rounded-2xl border-transparent shadow-sm hover:shadow-2xl transition-all duration-300 bg-white hover:-translate-y-1',
        unavailable && 'opacity-75',
        className
      )}
    >
      <Link to={`/catalog/${product.id}`} className="block h-full flex flex-col">
        {/* Image Container */}
        <div className="relative aspect-[4/5] overflow-hidden bg-neutral-100">
          <img
            src={imgSrc}
            alt={product.name}
            onError={() => setImageError(true)}
            className={cn(
              'h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105',
              unavailable && 'grayscale-[40%]'
            )}
          />

          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Like button */}
          <div className="absolute top-3 right-3 z-10">
            <button
              onClick={handleLike}
              className="p-2.5 rounded-full bg-white/80 backdrop-blur-sm text-gray-600 hover:text-red-500 hover:bg-white transition-all shadow-sm active:scale-95"
            >
              <Heart
                className={cn(
                  'w-4 h-4 transition-colors',
                  isLiked ? 'fill-red-500 text-red-500' : ''
                )}
              />
            </button>
          </div>

          {/* Status badges */}
          {outOfStock === true && (
            <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-slate-800/90 backdrop-blur-md text-white px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest shadow-sm">
              <AlertCircle className="w-3 h-3 shrink-0" />
              Нет в наличии
            </div>
          )}
          {!outOfStock && !product.active && (
            <div className="absolute top-3 left-3 bg-red-500/90 backdrop-blur-md text-white px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest shadow-sm">
              Недоступен
            </div>
          )}
          {noStoreSelected && outOfStock !== true && product.active && (
            <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-black/60 backdrop-blur-md text-white/80 px-2.5 py-1 rounded-md text-[10px] font-medium">
              <Store className="w-3 h-3 shrink-0" />
              Выберите магазин
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5 flex flex-col flex-grow">
          <div className="mb-auto">
            <h3 className="font-display font-semibold text-gray-900 text-base mb-1.5 line-clamp-1 group-hover:text-[var(--color-brand)] transition-colors">
              {product.name}
            </h3>
            <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
              {product.description ||
                'Идеальный подарок для ваших близких. Свежие цветы, собранные с любовью.'}
            </p>
          </div>

          <div className="flex items-center justify-between pt-4 mt-4 border-t border-gray-100/80">
            <div className="flex flex-col">
              <span className="text-sm text-gray-400 line-through mb-0.5">
                {(product.currentPrice * 1.2).toLocaleString('ru-RU')} ₽
              </span>
              <span className="text-xl font-bold text-gray-900 leading-none">
                {product.currentPrice.toLocaleString('ru-RU')} ₽
              </span>
            </div>

            <Button
              size="icon"
              variant={outOfStock ? 'outline' : 'brand'}
              onClick={handleAddToCart}
              disabled={outOfStock === true || !product.active}
              title={
                noStoreSelected
                  ? 'Выберите магазин'
                  : outOfStock
                  ? 'Нет в наличии'
                  : 'Добавить в корзину'
              }
              className={cn(
                'h-10 w-10 rounded-xl shadow-md transition-all hover:scale-105 active:scale-95',
                noStoreSelected && !outOfStock && product.active
                  ? 'shadow-none bg-slate-100 hover:bg-[var(--color-brand)] hover:text-white text-slate-500'
                  : outOfStock || !product.active
                  ? 'shadow-none cursor-not-allowed'
                  : 'shadow-brand/20'
              )}
            >
              {noStoreSelected && !outOfStock && product.active ? (
                <Store className="h-4 w-4" />
              ) : (
                <ShoppingCart className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </Link>
    </Card>
  )
}
