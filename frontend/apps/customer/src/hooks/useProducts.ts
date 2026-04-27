import { useQuery } from '@tanstack/react-query'
import { productsApi } from '@/api/products'
import type { ProductsFilters } from '@/api/types'

export const useProducts = (filters: ProductsFilters = {}) => {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: () => productsApi.getAll(filters),
  })
}

export const useProduct = (id: string) => {
  return useQuery({
    queryKey: ['product', id],
    queryFn: () => productsApi.getById(id),
    enabled: !!id,
  })
}

export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => productsApi.getCategories(),
  })
}
