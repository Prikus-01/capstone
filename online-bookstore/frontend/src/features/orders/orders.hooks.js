import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ordersApi } from './orders.api';

export const useOrders = (params) =>
  useQuery({ queryKey: ['orders', params], queryFn: () => ordersApi.getOrders(params) });

export const useOrder = (id) =>
  useQuery({ queryKey: ['order', id], queryFn: () => ordersApi.getOrder(id), enabled: !!id });

export const useCancelOrder = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => ordersApi.cancelOrder(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['orders'] }),
  });
};

export const useBuyAgain = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => ordersApi.buyAgain(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['cart'] }),
  });
};
