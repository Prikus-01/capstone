import { useQuery } from '@tanstack/react-query';
import { productsApi } from './products.api';

export const useProducts = (params) =>
  useQuery({ queryKey: ['products', params], queryFn: () => productsApi.getProducts(params) });

export const useProduct = (id) =>
  useQuery({ queryKey: ['product', id], queryFn: () => productsApi.getProduct(id), enabled: !!id });

export const useCategories = () =>
  useQuery({ queryKey: ['categories'], queryFn: productsApi.getCategories });

export const useCategoryProducts = (slug, params) =>
  useQuery({ queryKey: ['category-products', slug, params], queryFn: () => productsApi.getCategoryProducts(slug, params), enabled: !!slug });

export const useBrands = () =>
  useQuery({ queryKey: ['brands'], queryFn: productsApi.getBrands });

export const useBrandProducts = (slug, params) =>
  useQuery({ queryKey: ['brand-products', slug, params], queryFn: () => productsApi.getBrandProducts(slug, params), enabled: !!slug });

export const useFeaturedProducts = () =>
  useQuery({ queryKey: ['featured'], queryFn: productsApi.getFeatured });

export const useRecommendations = (enabled) =>
  useQuery({ queryKey: ['recommendations'], queryFn: productsApi.getRecommendations, enabled });
