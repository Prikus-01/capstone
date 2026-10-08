import { useQuery, useMutation } from '@tanstack/react-query';
import { checkoutApi } from './checkout.api';

export const useAddresses = () =>
  useQuery({ queryKey: ['addresses'], queryFn: checkoutApi.getAddresses });

export const useAddAddress = (onSuccess) =>
  useMutation({ mutationFn: checkoutApi.addAddress, onSuccess });

export const usePreviewOrder = () =>
  useMutation({ mutationFn: checkoutApi.previewOrder });

export const useCreateOrder = () =>
  useMutation({ mutationFn: checkoutApi.createOrder });

export const useConfirmPayment = () =>
  useMutation({ mutationFn: ({ orderId, success }) => checkoutApi.confirmPayment(orderId, success) });
