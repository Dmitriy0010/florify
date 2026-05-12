import { useEffect, useState, useMemo, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, Store, MapPin } from 'lucide-react'
import { ProductCard } from '@/components/ProductCard'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useProducts, useCategories } from '@/hooks/useProducts'
import { useStockAvailability } from '@/hooks/useStockAvailability'
import type { ProductsFilters } from '@/api/types'
import { useShopStore } from '@/store/shopStore'
import { useQuery } from '@tanstack/react-query'
import { storesApi } from '@/api/stores'

export function CatalogPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { selectedStoreId } = useShopStore()

  // State for filters
  const [filters, setFilters] = useState<ProductsFilters>({
    categoryId: searchParams.get('categoryId') || undefined,
    searchTerm: searchParams.get('q') || undefined,
    page: 0,
    size: 20,
    active: true,
  })

  // Sync storeId from shopStore to filters
  useEffect(() => {
    setFilters((prev) => ({ ...prev, page: 0 }))
  }, [selectedStoreId])

  const [sort, setSort] = useState('popularity-desc')

  const { data: productsData, isLoading } = useProducts(filters)
  const { data: categories } = useCategories()
  const { data: stores } = useQuery({
    queryKey: ['stores'],
    queryFn: () => storesApi.getAll(),
  })

  // Sorted/filtered products
  const sortedProducts = useMemo(() => {
    if (!productsData?.data) return []
    let content = [...productsData.data]
    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase()
      content = content.filter(
        (p) =>
          p.name.toLowerCase().includes(term) ||
          (p.description && p.description.toLowerCase().includes(term))
      )
    }
    if (sort === 'price-asc') return content.sort((a, b) => a.currentPrice - b.currentPrice)
    if (sort === 'price-desc') return content.sort((a, b) => b.currentPrice - a.currentPrice)
    if (sort === 'name-asc') return content.sort((a, b) => a.name.localeCompare(b.name))
    return content
  }, [productsData, sort, filters.searchTerm])

  // Batch stock availability check — only when store is selected
  const productIds = useMemo(() => sortedProducts.map((p) => p.id), [sortedProducts])
  const { data: availability = {} } = useStockAvailability(selectedStoreId, productIds)

  const selectedStore = stores?.find((s) => s.id === selectedStoreId)

  const handleCategoryChange = (categoryId: string | undefined) => {
    setFilters((prev) => ({ ...prev, categoryId, page: 0 }))
    if (!categoryId) {
      searchParams.delete('categoryId')
    } else {
      searchParams.set('categoryId', categoryId)
    }
    setSearchParams(searchParams)
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setFilters((prev) => ({ ...prev, searchTerm: value || undefined, page: 0 }))
    if (!value) {
      searchParams.delete('q')
    } else {
      searchParams.set('q', value)
    }
    setSearchParams(searchParams)
  }

  const handleNeedStoreSelect = useCallback(() => {
    // Scroll to top where store selector lives (in the layout header)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  return (
    <div className="container-custom py-12">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-12">
        <div className="flex-1">
          <h1 className="text-4xl font-display font-bold mb-3 tracking-tight">Наш каталог</h1>
          <p className="text-[var(--color-text-secondary)] text-lg max-w-lg">
            От изящных комплиментов до роскошных авторских композиций — найдите идеальный букет.
          </p>
        </div>

        {/* Search and Sort */}
        <div className="w-full lg:w-auto flex flex-col md:flex-row items-start lg:items-end gap-4">
          <div className="w-full md:w-[300px] flex flex-col gap-2">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--color-text-tertiary)] ml-1">
              Поиск
            </span>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Искать товары..."
                className="pl-9 h-12 rounded-xl border-[var(--color-border)] hover:border-[var(--color-brand)] focus-visible:ring-[var(--color-brand)] transition-all bg-white"
                value={filters.searchTerm || ''}
                onChange={handleSearch}
              />
            </div>
          </div>

          <div className="w-full md:w-auto flex flex-col items-start md:items-end gap-2">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--color-text-tertiary)] ml-1">
              Сортировать по
            </span>
            <Select value={sort} onValueChange={setSort}>
              <SelectTrigger className="w-full md:w-[240px] bg-white border-[var(--color-border)] h-12 rounded-xl px-4 shadow-sm hover:border-[var(--color-brand)] transition-all">
                <SelectValue>
                  {sort === 'popularity-desc' && 'По популярности'}
                  {sort === 'price-asc' && 'Сначала дешевле'}
                  {sort === 'price-desc' && 'Сначала дороже'}
                  {sort === 'name-asc' && 'По названию (А-Я)'}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="popularity-desc">По популярности</SelectItem>
                <SelectItem value="price-asc">Сначала дешевле</SelectItem>
                <SelectItem value="price-desc">Сначала дороже</SelectItem>
                <SelectItem value="name-asc">По названию (А-Я)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Store availability banner */}
      {!selectedStoreId && (
        <div className="mb-8 flex items-center gap-4 bg-amber-50 border border-amber-200 rounded-2xl px-6 py-4">
          <div className="p-2.5 bg-amber-100 rounded-xl shrink-0">
            <Store className="w-5 h-5 text-amber-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-amber-900">Магазин не выбран</p>
            <p className="text-xs text-amber-700 mt-0.5">
              Выберите магазин в шапке сайта, чтобы видеть актуальное наличие товаров и добавлять их в корзину.
            </p>
          </div>
        </div>
      )}

      {/* Filters (Categories) */}
      <div className="flex gap-2 overflow-x-auto pb-6 mb-8 scrollbar-hide no-scrollbar">
        <Button
          variant={!filters.categoryId ? 'brand' : 'outline'}
          className="rounded-full px-6 whitespace-nowrap"
          onClick={() => handleCategoryChange(undefined)}
        >
          Все товары
        </Button>
        {categories?.map((cat) => (
          <Button
            key={cat.id}
            variant={filters.categoryId === cat.id ? 'brand' : 'outline'}
            className="rounded-full px-6 whitespace-nowrap"
            onClick={() => handleCategoryChange(cat.id)}
          >
            {cat.name}
          </Button>
        ))}
      </div>

      {/* Products Grid */}
      <div className="min-h-[400px]">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="aspect-[4/5] rounded-xl" />
                <div className="space-y-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : sortedProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10">
            {sortedProducts.map((product) => {
              // If store is selected and data has loaded — check availability
              // If availability[id] is undefined (data not yet loaded) — treat as available
              const outOfStock =
                selectedStoreId && Object.keys(availability).length > 0
                  ? availability[product.id] === false
                  : false

              return (
                <ProductCard
                  key={product.id}
                  product={product}
                  outOfStock={outOfStock}
                  noStoreSelected={!selectedStoreId}
                  onNeedStoreSelect={handleNeedStoreSelect}
                />
              )
            })}
          </div>
        ) : (
          <div className="text-center py-24 bg-[var(--color-bg-sunken)] rounded-3xl border border-dashed border-[var(--color-border)]">
            <div className="max-w-xs mx-auto space-y-4">
              <div className="text-4xl">🌻</div>
              <h3 className="text-xl font-display font-semibold">Ничего не нашли</h3>
              <p className="text-[var(--color-text-secondary)] text-sm">
                К сожалению, по вашему запросу ничего не найдено. Попробуйте изменить параметры
                поиска или сбросить фильтры.
              </p>
              <div className="flex gap-2 justify-center mt-4">
                <Button variant="brand-outline" onClick={() => handleCategoryChange(undefined)}>
                  Сбросить категории
                </Button>
                {filters.searchTerm && (
                  <Button
                    variant="outline"
                    onClick={() => handleSearch({ target: { value: '' } } as any)}
                  >
                    Сбросить поиск
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Pagination */}
      {!isLoading && productsData && productsData.totalPages > 1 && (
        <div className="mt-16 flex justify-center gap-2">
          <Button
            variant="outline"
            disabled={filters.page === 0}
            onClick={() => setFilters((f) => ({ ...f, page: (f.page || 0) - 1 }))}
          >
            Назад
          </Button>
          <span className="flex items-center px-4 text-sm font-medium">
            Страница {(filters.page || 0) + 1} из {productsData.totalPages}
          </span>
          <Button
            variant="outline"
            disabled={filters.page === productsData.totalPages - 1}
            onClick={() => setFilters((f) => ({ ...f, page: (f.page || 0) + 1 }))}
          >
            Вперед
          </Button>
        </div>
      )}
    </div>
  )
}