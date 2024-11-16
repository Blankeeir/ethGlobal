// hooks/useProductFilters.ts
import { useState } from 'react';
import { Product } from '../util/types';

export const useProductFilters = () => {
  const [filters, setFilters] = useState({
    priceRange: [0, 1000],
    qualityScore: [0, 100],
    categories: [] as string[],
    listingType: 'all',
    carbonFootprint: [0, 100],
    location: '',
    verificationStatus: 'all',
    expiryDateRange: [
      new Date().toISOString().split('T')[0],
      new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0]
    ],
    sortBy: 'newest'
  });

  const applyFilters = (products: Product[]) => {
    return products.filter(product => {
      // Price filter
      if (product.price < filters.priceRange[0] || 
          product.price > filters.priceRange[1]) {
        return false;
      }

      // Quality score filter
      if (product.qualityScore < filters.qualityScore[0] || 
          product.qualityScore > filters.qualityScore[1]) {
        return false;
      }

      // Category filter
      if (filters.categories.length > 0 && 
          !filters.categories.includes(product.category)) {
        return false;
      }

      // Listing type filter
      if (filters.listingType !== 'all' && 
          product.listingType !== filters.listingType) {
        return false;
      }

      // Location filter
      if (filters.location && 
          !product.location.toLowerCase().includes(filters.location.toLowerCase())) {
        return false;
      }

      // Verification status filter
      if (filters.verificationStatus !== 'all') {
        if (filters.verificationStatus === 'verified' && !product.isVerified) {
          return false;
        }
        if (filters.verificationStatus === 'unverified' && product.isVerified) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      switch (filters.sortBy) {
        case 'price_low':
          return a.price - b.price;
        case 'price_high':
          return b.price - a.price;
        case 'quality_high':
          return b.qualityScore - a.qualityScore;
        case 'expiry_soon':
          return new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'newest':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });
  };

  return {
    filters,
    setFilters,
    applyFilters
  };
};
