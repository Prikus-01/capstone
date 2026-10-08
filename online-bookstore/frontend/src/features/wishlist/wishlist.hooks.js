import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { wishlistApi } from './wishlist.api';
import { useAuth } from '../auth/auth.store';

export const useWishlist = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['wishlist'],
    queryFn: wishlistApi.getWishlist,
    enabled: !!user,
  });
};

export const useAddToWishlist = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (productId) => wishlistApi.addItem(productId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['wishlist'] }),
  });
};

export const useRemoveFromWishlist = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (productId) => wishlistApi.removeItem(productId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['wishlist'] }),
  });
};
