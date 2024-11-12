// hooks/useSupplyChain.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@chakra-ui/react';
import { useCallback, useMemo } from 'react';
import { useVeChain } from './useVeChain';
import { Contract } from 'web3-eth-contract';
import { useContract } from './useContract';
import { SUPPLY_CHAIN_TRACKING_ADDRESS } from '../const';
import SupplyChainTrackingABI from '../abi/SupplyChainTracking.json';
import { AbiItem } from 'web3-utils';
// Types
interface SupplyChainEvent {
  tokenId: string;
  timestamp: number;
  eventType: string;
  location: string;
  handler: string;
  temperature: number;
  humidity: number;
  additionalDataHash: string;
  isValidated: boolean;
  validator?: string;
}

interface TrackingData {
  location: string;
  handler: string;
  status: string;
  temperature: number;
  humidity: number;
  envKeys: string[];
  envValues: string[];
}

interface ThresholdData {
  maxTemp: number;
  minTemp: number;
  maxHumidity: number;
  minHumidity: number;
}

interface ValidationData {
  trackingIndex: number;
  isValid: boolean;
  notes: string;
}

interface Statistics {
  totalEvents: number;
  avgTemperature: number;
  avgHumidity: number;
  outOfRangeEvents: number;
  lastUpdate: number;
  uniqueLocations: number;
  uniqueHandlers: number;
}

interface QualityTrendPoint {
  timestamp: number;
  temperature: number;
  humidity: number;
  isWithinRange: boolean;
}

export const useSupplyChain = (tokenId?: string) => {
  const queryClient = useQueryClient();
  const toast = useToast();
  const { account } = useVeChain();
  
  const contract = useContract(
    'SupplyChainTracking',
    SUPPLY_CHAIN_TRACKING_ADDRESS,
    SupplyChainTrackingABI.abi as AbiItem[],
  ) as unknown as Contract;

  // Fetch tracking history
  const {
    data: trackingHistory,
    isLoading: isLoadingHistory,
    error: historyError,
    refetch: refetchHistory
  } = useQuery<SupplyChainEvent[]>({
    queryKey: ['tracking-history', tokenId],
    queryFn: async () => {
      if (!tokenId || !contract) return [];
      
      const events = await contract.methods.getTrackingHistory(tokenId).call();
      return events.map((event: SupplyChainEvent) => ({
        ...event,
        timestamp: Number(event.timestamp) * 1000,
        temperature: Number(event.temperature) / 100,
        humidity: Number(event.humidity) / 100
      }));
    },
    enabled: !!tokenId && !!contract,
    staleTime: 30000
  });

  // Add tracking data
  const addTracking = useMutation<void, Error, TrackingData>({
    mutationFn: async (data: TrackingData) => {
      if (!tokenId || !contract || !account) {
        throw new Error('Missing required parameters');
      }

      const transaction = contract.methods.addTrackingData(
        tokenId,
        data.location,
        data.handler,
        data.status,
        data.envKeys,
        data.envValues,
        Math.round(data.temperature * 100),
        Math.round(data.humidity * 100)
      );

      await transaction.send({ from: account });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tracking-history', tokenId] });
      toast({
        title: 'Tracking Updated',
        description: 'Supply chain event has been recorded',
        status: 'success',
        duration: 5000,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to Update Tracking',
        description: error.message,
        status: 'error',
        duration: 5000,
      });
    }
  });

  // Validate tracking data
  const validateTracking = useMutation<void, Error, ValidationData>({
    mutationFn: async ({ trackingIndex, isValid, notes }) => {
      if (!tokenId || !contract || !account) {
        throw new Error('Missing required parameters');
      }

      const transaction = contract.methods.validateTrackingData(
        tokenId,
        trackingIndex,
        isValid,
        notes
      );

      await transaction.send({ from: account });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tracking-history', tokenId] });
      toast({
        title: 'Validation Complete',
        status: 'success',
        duration: 5000,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Validation Failed',
        description: error.message,
        status: 'error',
        duration: 5000,
      });
    }
  });

  // Set thresholds
  const setThresholds = useMutation<void, Error, ThresholdData>({
    mutationFn: async (thresholds) => {
      if (!tokenId || !contract || !account) {
        throw new Error('Missing required parameters');
      }

      const transaction = contract.methods.setThresholds(
        tokenId,
        Math.round(thresholds.maxTemp * 100),
        Math.round(thresholds.minTemp * 100),
        Math.round(thresholds.maxHumidity * 100),
        Math.round(thresholds.minHumidity * 100)
      );

      await transaction.send({ from: account });
    },
    onSuccess: () => {
      toast({
        title: 'Thresholds Updated',
        status: 'success',
        duration: 5000,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to Update Thresholds',
        description: error.message,
        status: 'error',
        duration: 5000,
      });
    }
  });

  // Subscribe to events
  const subscribeToEvents = useCallback((
    callback: (event: {
      tokenId: string;
      location: string;
      status: string;
      timestamp: number;
      transactionHash: string;
    }) => void
  ) => {
    if (!contract) return () => {};

    const eventSubscription = contract.events.TrackingUpdated({})
      .on('data', (event: { returnValues: { tokenId: string; location: string; status: string; timestamp: string; }; transactionHash: string; }) => {
        const { tokenId, location, status, timestamp } = event.returnValues;
        callback({
          tokenId,
          location,
          status,
          timestamp: Number(timestamp) * 1000,
          transactionHash: event.transactionHash
        });
      })
      .on('error', (error: Error) => {
        console.error('Event subscription error:', error);
      });

    return () => {
      eventSubscription.unsubscribe();
    };
  }, [contract]);

  // Get statistics
  const getStatistics = useCallback((): Statistics | null => {
    if (!trackingHistory?.length) return null;

    const stats = trackingHistory.reduce((acc, event) => ({
      totalEvents: acc.totalEvents + 1,
      avgTemperature: acc.avgTemperature + event.temperature,
      avgHumidity: acc.avgHumidity + event.humidity,
      outOfRangeEvents: acc.outOfRangeEvents + (
        event.temperature < 2 || event.temperature > 8 ||
        event.humidity < 45 || event.humidity > 55 ? 1 : 0
      ),
      lastUpdate: Math.max(acc.lastUpdate, event.timestamp),
      locations: new Set([...acc.locations, event.location]),
      handlers: new Set([...acc.handlers, event.handler])
    }), {
      totalEvents: 0,
      avgTemperature: 0,
      avgHumidity: 0,
      outOfRangeEvents: 0,
      lastUpdate: 0,
      locations: new Set<string>(),
      handlers: new Set<string>()
    });

    return {
      ...stats,
      avgTemperature: stats.totalEvents ? stats.avgTemperature / stats.totalEvents : 0,
      avgHumidity: stats.totalEvents ? stats.avgHumidity / stats.totalEvents : 0,
      uniqueLocations: stats.locations.size,
      uniqueHandlers: stats.handlers.size
    };
  }, [trackingHistory]);

  // Get quality trend
  const getQualityTrend = useMemo((): QualityTrendPoint[] => {
    if (!trackingHistory?.length) return [];

    return trackingHistory.map(event => ({
      timestamp: event.timestamp,
      temperature: event.temperature,
      humidity: event.humidity,
      isWithinRange: (
        event.temperature >= 2 && event.temperature <= 8 &&
        event.humidity >= 45 && event.humidity <= 55
      )
    }));
  }, [trackingHistory]);

  return {
    // Data
    trackingHistory,
    isLoadingHistory,
    historyError,

    // Actions
    addTracking: addTracking.mutate,
    validateTracking: validateTracking.mutate,
    setThresholds: setThresholds.mutate,
    refetchHistory,

    // Loading states
    isAddingTracking: addTracking.isPending,
    isValidating: validateTracking.isPending,
    isSettingThresholds: setThresholds.isPending,

    // Subscriptions
    subscribeToEvents,

    // Analytics
    getStatistics,
    getQualityTrend,

    // Status
    isReady: !!contract && !!account,
    account
  };
};

export default useSupplyChain;