// hooks/useProducts.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@chakra-ui/react';
import { productService } from '../services/ProductService';
import { Product, ProductFilters } from '../util/types';
import { ProductFormData } from '../schemas/validation';

export const useProducts = (filters?: ProductFilters) => {
  const queryClient = useQueryClient();
  const toast = useToast();

  const {
    data: products,
    isLoading,
    error,
    refetch
  } = useQuery<Product[], Error>({
    queryKey: ['products', filters],
    queryFn: () => productService.getProducts(filters),
    staleTime: 60000, // 1 minute
    retry: 2
  });

  const createProduct = useMutation<Product, Error, ProductFormData>({
    mutationFn: (data) => productService.createProduct(data),
    onSuccess: (newProduct) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.setQueryData(['product', newProduct.id], newProduct);
      toast({
        title: 'Product created',
        description: `${newProduct.name} has been created successfully`,
        status: 'success',
        duration: 3000,
      });
    },
    onError: (error) => {
      toast({
        title: 'Creation failed',
        description: error.message,
        status: 'error',
        duration: 3000,
      });
    },
  });

  const deleteProduct = useMutation<void, Error, string>({
    mutationFn: (id) => productService.deleteProduct(id),
    onSuccess: (_, productId) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.removeQueries({ queryKey: ['product', productId] });
      toast({
        title: 'Product deleted',
        status: 'success',
        duration: 3000,
      });
    },
    onError: (error) => {
      toast({
        title: 'Deletion failed',
        description: error.message,
        status: 'error',
        duration: 3000,
      });
    },
  });

  return {
    products,
    isLoading,
    error,
    refetch,
    createProduct: createProduct.mutate,
    isCreating: createProduct.isPending,
    deleteProduct: deleteProduct.mutate,
    isDeleting: deleteProduct.isPending,
  };
};