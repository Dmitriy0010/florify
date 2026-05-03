import { Link } from 'react-router-dom'
import { ShoppingCart, Heart } from 'lucide-react'
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
}

export function ProductCard({ product, className }: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem)
  const { addItem: addFavorite, removeItem: removeFavorite, hasItem } = useFavoritesStore()
  const [imageError, setImageError] = useState(false)
  
  const isLiked = hasItem(product.id)
  
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!product.active) {
      toast.error('Товар временно недоступен')
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
  
  const fallbackImage = "https://images.unsplash.com/photo-1582794543139-8ac9cb0f7b11?q=80&w=600&auto=format&fit=crop"
  
  const getImageUrl = (url: string | null | undefined) => {
    if (!url) return fallbackImage;
    if (url.startsWith('http') || url.startsWith('/')) return url;
    return `/api/v1/media/${url}`;
  };

  const imgSrc = imageError ? fallbackImage : getImageUrl(product.imageUrl)

  return (
    <Card className={cn(
      'group relative overflow-hidden rounded-2xl border-transparent shadow-sm hover:shadow-2xl transition-all duration-300 bg-white hover:-translate-y-1', 
      className
    )}>
      <Link to={`/catalog/${product.id}`} className="block h-full flex flex-col">
        {/* Image Container */}
        <div className="relative aspect-[4/5] overflow-hidden bg-neutral-100">
          <img
            src={imgSrc}
            alt={product.name}
            onError={() => setImageError(true)}
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
          
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Badges / Like button */}
          <div className="absolute top-3 right-3 z-10">
            <button
              onClick={handleLike}
              className="p-2.5 rounded-full bg-white/80 backdrop-blur-sm text-gray-600 hover:text-red-500 hover:bg-white transition-all shadow-sm active:scale-95"
            >
              <Heart className={cn("w-4 h-4 transition-colors", isLiked ? "fill-red-500 text-red-500" : "")} />
            </button>
          </div>
          
          {!product.active && (
            <div className="absolute top-3 left-3 bg-red-500/90 backdrop-blur-md text-white px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest shadow-sm">
              Нет в наличии
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
              {product.description || 'Идеальный подарок для ваших близких. Свежие цветы, собранные с любовью.'}
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
              variant="brand"
              onClick={handleAddToCart}
              disabled={!product.active}
              className="h-10 w-10 rounded-xl shadow-md shadow-brand/20 transition-all hover:scale-105 active:scale-95"
            >
              <ShoppingCart className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Link>
    </Card>
  )
}
