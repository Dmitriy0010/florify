import { apiClient } from './apiClient';
import type { Category, CatalogProduct } from './types';

export const catalogApi = {
  getCategories: async () => {
    const { data } = await apiClient.get<Category[]>('/v1/catalog/categories');
    return data;
  },
  getProducts: async (params?: { categoryId?: string; searchTerm?: string }) => {
    const { data: response } = await apiClient.get<{ data: CatalogProduct[] }>('/v1/catalog/products', { params });
    return response.data;
  },
};
