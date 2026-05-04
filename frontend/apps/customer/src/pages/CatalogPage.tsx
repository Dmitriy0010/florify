import { useEffect, useState, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ProductCard } from '@/components/ProductCard'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useProducts, useCategories } from '@/hooks/useProducts'
import type { ProductsFilters } from '@/api/types'
import { useShopStore } from '@/store/shopStore'

export function CatalogPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { selectedStoreId } = useShopStore()
  
  // State for filters
  const [filters, setFilters] = useState<ProductsFilters>({
    categoryId: searchParams.get('categoryId') || undefined,
    storeId: selectedStoreId || undefined,
    page: 0,
    size: 20,
    active: true
  })

  // Sync storeId from shopStore to filters
  useEffect(() => {
    setFilters((prev) => ({ ...prev, storeId: selectedStoreId || undefined, page: 0 }))
  }, [selectedStoreId])

  // State for sorting (Client-side initially or if backend supports it later)
  const [sort, setSort] = useState('popularity-desc')
  
  const { data: productsData, isLoading } = useProducts(filters)
  const { data: categories } = useCategories()
  
  const handleCategoryChange = (categoryId: string | undefined) => {
    setFilters((prev) => ({ ...prev, categoryId, page: 0 }))
    if (!categoryId) {
      searchParams.delete('categoryId')
    } else {
      searchParams.set('categoryId', categoryId)
    }
    setSearchParams(searchParams)
  }

  
  // Sorted products (if we want to do it on the client for now)
  const sortedProducts = useMemo(() => {
    if (!productsData?.data) return []
    const content = [...productsData.data]

    
    if (sort === 'price-asc') return content.sort((a,b) => a.currentPrice - b.currentPrice)
    if (sort === 'price-desc') return content.sort((a,b) => b.currentPrice - a.currentPrice)
    if (sort === 'name-asc') return content.sort((a,b) => a.name.localeCompare(b.name))
    
    return content // Default (popularity/random)
  }, [productsData, sort])
  
  return (
    <div className="container-custom py-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-display font-bold mb-3 tracking-tight">Наш каталог</h1>
          <p className="text-[var(--color-text-secondary)] text-lg max-w-lg">
            От изящных комплиментов до роскошных авторских композиций — найдите идеальный букет.
          </p>
        </div>
        
        {/* Sort Section */}
        <div className="w-full md:w-auto flex flex-col items-start md:items-end gap-2">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--color-text-tertiary)] ml-1">
            Сортировать по
          </span>
          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger className="w-full md:w-[240px] bg-white border-[var(--color-border)] h-12 rounded-xl px-4 shadow-sm hover:border-[var(--color-brand)] transition-all">
              <SelectValue>
                {sort === 'popularity-desc' && "По популярности"}
                {sort === 'price-asc' && "Сначала дешевле"}
                {sort === 'price-desc' && "Сначала дороже"}
                {sort === 'name-asc' && "По названию (А-Я)"}
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
            {sortedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-24 bg-[var(--color-bg-sunken)] rounded-3xl border border-dashed border-[var(--color-border)]">
            <div className="max-w-xs mx-auto space-y-4">
              <div className="text-4xl">🌻</div>
              <h3 className="text-xl font-display font-semibold">Ничего не нашли</h3>
              <p className="text-[var(--color-text-secondary)] text-sm">
                К сожалению, в этой категории сейчас нет товаров. Попробуйте выбрать другую или сбросить фильтры.
              </p>
              <Button 
                variant="brand-outline" 
                onClick={() => handleCategoryChange(undefined)}
              >
                Сбросить фильтры
              </Button>
            </div>
          </div>
        )}
      </div>
      
      {/* Pagination (TBD) */}
      {!isLoading && productsData && productsData.totalPages > 1 && (
        <div className="mt-16 flex justify-center gap-2">
          {/* Simple Pagination placeholders */}
          <Button variant="outline" disabled={filters.page === 0} onClick={() => setFilters(f => ({...f, page: (f.page || 0) - 1}))}>
            Назад
          </Button>
          <span className="flex items-center px-4 text-sm font-medium">
            Страница { (filters.page || 0) + 1 } из { productsData.totalPages }
          </span>
          <Button variant="outline" disabled={filters.page === productsData.totalPages - 1} onClick={() => setFilters(f => ({...f, page: (f.page || 0) + 1}))}>
             Вперед
          </Button>
        </div>
      )}
    </div>
  )
}