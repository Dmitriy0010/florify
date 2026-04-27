import { apiClient } from '@/lib/axios'
import type { Category, Product, PagedResult, ProductsFilters } from './types'

export const productsApi = {
  getAll: async (filters: ProductsFilters = {}) => {
    const { data } = await apiClient.get<PagedResult<Product>>('/api/v1/catalog/products', {
      params: filters,
    })
    return data
  },
  
  getById: async (id: string) => {
    const { data } = await apiClient.get<Product>(`/api/v1/catalog/products/${id}`)
    return data
  },
  
  getCategories: async () => {
    const { data } = await apiClient.get<Category[]>('/api/v1/catalog/categories')
    return data
  },
}
