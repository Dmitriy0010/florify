import { Link } from 'react-router-dom'
import { ShoppingCart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useCartStore } from '@/store/cartStore'
import { toast } from 'sonner'
import type { Product } from '@/api/types'
import { cn } from '@/lib/utils'

interface ProductCardProps {
  product: Product
  className?: string
}

export function ProductCard({ product, className }: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem)
  
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
      maxQuantity: 100, // Default for now
    })
    
    toast.success('Добавлено в корзину', {
      description: product.name,
    })
  }
  
  return (
    <Card className={cn('card-hover overflow-hidden group border-[var(--color-border)]', className)}>
      <Link to={`/catalog/${product.id}`}>
        {/* Image */}
        <div className="relative aspect-[4/5] overflow-hidden bg-[var(--color-bg-sunken)]">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-[var(--color-text-tertiary)] bg-neutral-100">
              <span className="text-xs uppercase tracking-widest font-medium">Нет фото</span>
            </div>
          )}
        </div>
        
        {/* Content */}
        <div className="p-4 space-y-3">
          <div>
            <h3 className="font-display font-semibold text-base mb-1 line-clamp-1 group-hover:text-[var(--color-brand)] transition-colors">
              {product.name}
            </h3>
            <p className="text-xs text-[var(--color-text-secondary)] line-clamp-2 h-8">
              {product.description}
            </p>
          </div>
          
          <div className="flex items-center justify-between pt-2">
            <span className="text-lg font-bold text-[var(--color-text-primary)]">
              {product.currentPrice.toLocaleString('ru-RU')} ₽
            </span>
            
            <Button
              size="sm"
              variant="brand"
              onClick={handleAddToCart}
              disabled={!product.active}
              className="h-9 px-3 gap-2 rounded-md transition-all active:scale-95"
            >
              <ShoppingCart className="h-4 w-4" />
              <span className="hidden sm:inline">В корзину</span>
            </Button>
          </div>
        </div>
      </Link>
    </Card>
  )
}
