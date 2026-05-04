import { useParams, Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, ShoppingCart, Truck, ShieldCheck, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { productsApi } from '@/api/products'
import { useCartStore } from '@/store/cartStore'
import { toast } from 'sonner'
import { useState } from 'react'

export function ProductPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const addItem = useCartStore((state) => state.addItem)
  const [imageError, setImageError] = useState(false)
  
  const { data: product, isLoading, isError } = useQuery({
    queryKey: ['product', id],
    queryFn: () => productsApi.getById(id!),
    enabled: !!id,
  })

  if (isLoading) {
    return (
      <div className="container-custom py-12">
        <Skeleton className="h-8 w-32 mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <Skeleton className="aspect-square rounded-2xl" />
          <div className="space-y-6">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-12 w-48" />
          </div>
        </div>
      </div>
    )
  }

  if (isError || !product) {
    return (
      <div className="container-custom py-24 text-center">
        <h2 className="text-2xl font-bold mb-4">Товар не найден</h2>
        <Button variant="outline" onClick={() => navigate('/catalog')}>
          Вернуться в каталог
        </Button>
      </div>
    )
  }

  const handleAddToCart = () => {
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

  const fallbackImage = "https://images.unsplash.com/photo-1582794543139-8ac9cb0f7b11?q=80&w=600&auto=format&fit=crop"

  const getImageUrl = (url: string | null | undefined) => {
    if (!url) return fallbackImage;
    if (url.startsWith('http') || url.startsWith('/')) return url;
    return `/api/v1/media/${url}`;
  };

  const imgSrc = imageError ? fallbackImage : getImageUrl(product.imageUrl)

  return (
    <div className="container-custom py-8">
      <Link 
        to="/catalog" 
        className="inline-flex items-center gap-2 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-brand)] mb-8 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Назад в каталог
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16">
        {/* Product Image Gallery */}
        <div className="space-y-4">
          <div className="relative aspect-square overflow-hidden rounded-3xl bg-neutral-100 shadow-xl border border-white/20">
            <img
              src={imgSrc}
              alt={product.name}
              onError={() => setImageError(true)}
              className="w-full h-full object-cover"
            />
            {!product.active && (
              <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider shadow-lg">
                Нет в наличии
              </div>
            )}
          </div>
        </div>

        {/* Product Info */}
        <div className="flex flex-col justify-center">
          <h1 className="text-4xl lg:text-5xl font-display font-bold text-gray-900 mb-4 leading-tight">
            {product.name}
          </h1>
          
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center text-amber-400">
              <Star className="w-5 h-5 fill-current" />
              <Star className="w-5 h-5 fill-current" />
              <Star className="w-5 h-5 fill-current" />
              <Star className="w-5 h-5 fill-current" />
              <Star className="w-5 h-5 fill-current" />
            </div>
            <span className="text-sm text-gray-500">(12 отзывов)</span>
          </div>

          <div className="text-3xl font-bold text-[var(--color-brand)] mb-8">
            {product.currentPrice.toLocaleString('ru-RU')} ₽
          </div>

          <p className="text-gray-600 text-lg mb-10 leading-relaxed">
            {product.description || 'Нежный и красивый букет, созданный нашими флористами с любовью и заботой.'}
          </p>

          <Button 
            size="lg" 
            variant="brand" 
            className="w-full sm:w-auto h-14 px-10 text-lg rounded-2xl shadow-xl shadow-brand/20 hover:shadow-brand/40 transition-all hover:-translate-y-1"
            onClick={handleAddToCart}
            disabled={!product.active}
          >
            <ShoppingCart className="mr-3 h-5 w-5" />
            В корзину
          </Button>

          {/* Features */}
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-6 pt-8 border-t border-gray-100">
            <div className="flex gap-4">
              <div className="bg-green-50 p-3 rounded-xl text-green-600">
                <Truck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Быстрая доставка</h4>
                <p className="text-sm text-gray-500">От 60 минут по городу</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="bg-blue-50 p-3 rounded-xl text-blue-600">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Гарантия свежести</h4>
                <p className="text-sm text-gray-500">Заменим если завянет</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}