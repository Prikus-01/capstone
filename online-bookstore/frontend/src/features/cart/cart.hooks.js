import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cartApi } from './cart.api';
import { useAuth } from '../auth/auth.store';

export const useCart = () => {
  const { user } = useAuth();
  return useQuery({ queryKey: ['cart'], queryFn: cartApi.getCart, enabled: !!user });
};

export const useAddToCart = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ productId, quantity }) => cartApi.addItem(productId, quantity),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['cart'] }),
  });
};

export const useUpdateCartItem = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ itemId, quantity }) => cartApi.updateItem(itemId, quantity),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['cart'] }),
  });
};

export const useRemoveCartItem = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (itemId) => cartApi.removeItem(itemId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['cart'] }),
  });
};
