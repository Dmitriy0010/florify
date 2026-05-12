import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useProduct } from '@/hooks/useProducts'
import { useStockAvailability } from '@/hooks/useStockAvailability'
import { useCartStore } from '@/store/cartStore'
import { useFavoritesStore } from '@/store/favoritesStore'
import { useShopStore } from '@/store/shopStore'
import { storesApi } from '@/api/stores'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import {
  Heart,
  ShoppingCart,
  Package,
  Truck,
  Store,
  ChevronRight,
  AlertCircle,
  CheckCircle,
} from 'lucide-react'

export function ProductPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: product, isLoading, isError } = useProduct(id || '')

  const { selectedStoreId } = useShopStore()
  const { data: store } = useQuery({
    queryKey: ['store', selectedStoreId],
    queryFn: () => storesApi.getById(selectedStoreId!),
    enabled: !!selectedStoreId,
  })

  // Check stock for this single product
  const { data: availability = {} } = useStockAvailability(
    selectedStoreId,
    id ? [id] : []
  )

  const addToCart = useCartStore((state) => state.addItem)
  const { items: favoriteItems, addItem: addFavorite, removeItem: removeFavorite } = useFavoritesStore()

  const [imageError, setImageError] = useState(false)

  if (isLoading) {
    return (
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          <Skeleton className="aspect-[4/5] w-full rounded-3xl" />
          <div className="space-y-6">
            <Skeleton className="h-10 w-2/3" />
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-24 w-full" />
          </div>
        </div>
      </div>
    )
  }

  if (isError || !product) {
    return (
      <div className="container-custom py-24 text-center">
        <h2 className="text-3xl font-display font-bold mb-4">Товар не найден</h2>
        <p className="text-slate-500 mb-8">К сожалению, запрашиваемый товар не существует или был удален.</p>
        <Button onClick={() => navigate('/catalog')}>Вернуться в каталог</Button>
      </div>
    )
  }

  const isFavorite = favoriteItems.some((item) => item.id === product.id)

  // Stock state derived from availability check
  const hasAvailabilityData = Object.keys(availability).length > 0
  const outOfStock = selectedStoreId && hasAvailabilityData
    ? availability[product.id] === false
    : false
  const noStoreSelected = !selectedStoreId

  const handleToggleFavorite = () => {
    if (isFavorite) {
      removeFavorite(product.id)
    } else {
      addFavorite(product)
    }
  }

  const handleAddToCart = () => {
    if (noStoreSelected) {
      toast('Выберите магазин', {
        description: 'Чтобы добавить товар в корзину, сначала выберите магазин или адрес доставки в шапке сайта.',
        icon: <Store className="h-4 w-4 text-[var(--color-brand)]" />,
        duration: 5000,
      })
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    if (outOfStock) {
      toast.error('Товар закончился в выбранном магазине', {
        description: 'Попробуйте выбрать другой магазин.',
      })
      return
    }
    addToCart({
      productId: product.id,
      name: product.name,
      price: product.currentPrice,
      image: product.imageUrl,
      maxQuantity: 100,
    })
    toast.success('Добавлено в корзину', { description: product.name })
  }

  const fallbackImage = 'https://images.unsplash.com/photo-1591886960571-74d43a9d4166?q=80&w=2000'

  const getImageUrl = (url: string | null | undefined) => {
    if (!url) return fallbackImage
    if (url.startsWith('http') || url.startsWith('/')) return url
    return `/api/v1/media/${url}`
  }

  const imgSrc = imageError ? fallbackImage : getImageUrl(product.imageUrl)

  // Badge logic
  const renderStockBadge = () => {
    if (!product.active) {
      return <Badge variant="secondary" className="mb-4 bg-slate-200 text-slate-600">Недоступен</Badge>
    }
    if (noStoreSelected) {
      return (
        <Badge variant="secondary" className="mb-4 bg-amber-100 text-amber-700 border border-amber-200 flex items-center gap-1.5 w-fit">
          <Store className="w-3 h-3" />
          Выберите магазин для проверки наличия
        </Badge>
      )
    }
    if (outOfStock) {
      return (
        <Badge variant="secondary" className="mb-4 bg-red-50 text-red-600 border border-red-200 flex items-center gap-1.5 w-fit">
          <AlertCircle className="w-3 h-3" />
          Нет в наличии в этом магазине
        </Badge>
      )
    }
    return (
      <Badge variant="default" className="mb-4 bg-emerald-500 flex items-center gap-1.5 w-fit">
        <CheckCircle className="w-3 h-3" />
        В наличии
      </Badge>
    )
  }

  const cartButtonLabel = () => {
    if (noStoreSelected) return 'Выберите магазин'
    if (outOfStock) return 'Нет в наличии'
    return 'Добавить в корзину'
  }

  return (
    <div className="container-custom py-8 pb-24">
      {/* Breadcrumbs */}
      <nav className="flex items-center text-sm text-slate-500 mb-8">
        <Link to="/" className="hover:text-slate-900 transition-colors">Главная</Link>
        <ChevronRight className="w-4 h-4 mx-2" />
        <Link to="/catalog" className="hover:text-slate-900 transition-colors">Каталог</Link>
        <ChevronRight className="w-4 h-4 mx-2" />
        <span className="text-slate-900 font-medium truncate">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 xl:gap-20 items-start">
        {/* Left Column - Image */}
        <div className="relative group rounded-3xl overflow-hidden bg-slate-50">
          <div className="aspect-[4/5] relative">
            <img
              src={imgSrc}
              alt={product.name}
              onError={() => setImageError(true)}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            {/* Gallery indicators mock */}
            <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2 px-4 z-10">
              {[0, 1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full transition-all duration-300 ${i === 0 ? 'w-8 bg-white' : 'w-4 bg-white/40 hover:bg-white/70'}`}
                />
              ))}
            </div>
          </div>

          <button
            onClick={handleToggleFavorite}
            className="absolute top-6 right-6 p-3 bg-white/80 backdrop-blur-md rounded-full shadow-sm hover:bg-white transition-all hover:scale-110 active:scale-95"
          >
            <Heart className={`w-6 h-6 transition-colors ${isFavorite ? 'fill-rose-500 text-rose-500' : 'text-slate-600'}`} />
          </button>
        </div>

        {/* Right Column - Info */}
        <div className="flex flex-col pt-2 lg:pt-8">
          <div className="mb-6">
            {renderStockBadge()}

            <h1 className="text-4xl sm:text-5xl font-display font-bold text-slate-900 mb-6 leading-tight">
              {product.name}
            </h1>

            <div className="flex items-end gap-4 border-b border-slate-100 pb-8">
              <span className="text-4xl font-bold tracking-tight text-slate-900">
                {product.currentPrice.toLocaleString('ru-RU')} ₽
              </span>
              {outOfStock && (
                <span className="text-rose-500 border border-rose-200 bg-rose-50 px-2 py-1 text-sm font-semibold rounded-md mb-1.5">
                  Нет в наличии
                </span>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="mb-10 text-slate-600 leading-relaxed text-lg">
            <p className="line-clamp-3">
              {product.description ||
                'Букет белых тюльпанов — это классическая и элегантная композиция, символизирующая чистоту, невинность и спокойствие.'}
            </p>
            <button className="text-[var(--color-brand)] font-medium underline underline-offset-4 mt-2 hover:text-emerald-700 transition-colors">
              Смотрите полное описание
            </button>
          </div>

          {/* Alert block */}
          <div className="bg-[#FAF7F5] p-6 rounded-xl mb-10 text-slate-600 leading-relaxed text-[15px]">
            <p>
              Следует помнить, что цветы живые и композиция может немного отличаться от примера на фото по оттенку, форме, комплектации. Но не переживайте, ваша композиция будет не менее красивой!
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 mb-12">
            <Button
              size="lg"
              className="flex-1 h-14 text-lg font-bold rounded-xl shadow-lg shadow-[var(--color-brand)]/25 disabled:opacity-60 disabled:cursor-not-allowed"
              disabled={outOfStock || !product.active}
              onClick={handleAddToCart}
              variant={noStoreSelected ? 'outline' : 'default'}
            >
              {noStoreSelected ? (
                <>
                  <Store className="w-5 h-5 mr-2" />
                  Выберите магазин
                </>
              ) : outOfStock ? (
                <>
                  <AlertCircle className="w-5 h-5 mr-2" />
                  Нет в наличии
                </>
              ) : (
                <>
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Добавить в корзину
                </>
              )}
            </Button>
          </div>

          {/* Features List */}
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <Package className="w-6 h-6 text-slate-700 shrink-0" strokeWidth={1.5} />
              <p className="text-slate-600 text-sm">
                Гарантия качества в <span className="font-bold text-slate-900">ПРЕМИУМ УПАКОВКЕ</span>
              </p>
            </div>

            <div className="flex items-center gap-4">
              <Truck className="w-6 h-6 text-slate-700 shrink-0" strokeWidth={1.5} />
              <p className="text-slate-600 text-sm">
                <span className="font-bold text-slate-900">Доставка</span> по городу
              </p>
            </div>

            <div className="flex items-center gap-4">
              <Store className="w-6 h-6 text-slate-700 shrink-0" strokeWidth={1.5} />
              <p className="text-slate-600 text-sm">
                <span className="font-bold text-slate-900">Самовывоз</span> из магазина (
                {store?.name || '...'}, {store?.address || '...'})
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}