// apps/frontend/src/hooks/useEvents.ts
import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
// import { AbiCoder } from 'ethers/lib/utils';
import { useWeb3 } from '../contexts/Web3Context';
import { useToast } from '@chakra-ui/react';
import { useLayerZero } from './useLayerZero';
import { useFilecoinStorage } from './useFilecoinStorage';
import { Event } from '../util/types';

interface EventFilters {
  category?: string;
  requiresIdentity?: boolean;
  timeRange?: 'upcoming' | 'ongoing' | 'past';
}

export const useEvents = (filters?: EventFilters) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [userEvents, setUserEvents] = useState<Event[]>([]);
  const { eventContract, address, context: { chainId } } = useWeb3();
  const { sendMessage } = useLayerZero();
  const { storeEventData, retrieveData } = useFilecoinStorage();
  const toast = useToast();

  const fetchEvents = useCallback(async () => {
    if (!eventContract) return;

    try {
      setLoading(true);
      const totalEvents = await eventContract.eventCount();
      const fetchedEvents = await Promise.all(
        Array.from({ length: totalEvents.toNumber() }, async (_, i) => {
          const event = await eventContract.events(i);
          
          // Fetch additional data from Filecoin if available
          let additionalData = {};
          if (event.filecoinCID) {
            additionalData = await retrieveData(event.filecoinCID);
          }

          return {
            id: i.toString(),
            name: event.name,
            description: event.description,
            startTime: event.startTime.toNumber(),
            endTime: event.endTime.toNumber(),
            creator: event.creator,
            requiresIdentity: event.requiresIdentity,
            participants: event.participants,
            category: event.category,
            chainId: event.chainId.toNumber(),
            createdAt: Date.now(),
            ...additionalData
          };
        })
      );

      // Apply filters
      const filteredEvents = fetchedEvents.filter(event => {
        if (filters?.category && event.category !== filters.category) {
          return false;
        }
        if (filters?.requiresIdentity !== undefined && 
            event.requiresIdentity !== filters.requiresIdentity) {
          return false;
        }
        if (filters?.timeRange) {
          const now = Date.now() / 1000;
          switch (filters.timeRange) {
            case 'upcoming':
              return event.startTime > now;
            case 'ongoing':
              return event.startTime <= now && event.endTime > now;
            case 'past':
              return event.endTime < now;
          }
        }
        return true;
      });

      setEvents(filteredEvents);
      
      // Set user's events separately
      if (address) {
        setUserEvents(filteredEvents.filter(event => 
          event.creator === address || event.participants.includes(address)
        ));
      }
    } catch (error: unknown) {
      toast({
        title: 'Failed to fetch events',
        description: error instanceof Error ? error.message : 'Unknown error',
        status: 'error',
        isClosable: true
      });
    } finally {
      setLoading(false);
    }
  }, [eventContract, filters, address, retrieveData, toast]);

  const createEvent = async (eventData: Omit<Event, 'id' | 'chainId'>) => {
    if (!eventContract || !address) {
      throw new Error('Not connected');
    }

    try {
      setLoading(true);

      // Store additional data on Filecoin
      const cid = await storeEventData({
        ...eventData,
        id: '0', // temporary ID will be replaced after creation
        isPrivate: false, // default value
        // createdAt: Date.now(),
        // creator: address
      });

      // Create event on-chain
      const tx = await eventContract.createEvent(
        eventData.name,
        eventData.description,
        eventData.startTime,
        eventData.endTime,
        eventData.category,
        eventData.requiresIdentity,
        cid
      );

      await tx.wait();
      toast({
        title: 'Event created successfully',
        status: 'success',
        isClosable: true
      });
      await fetchEvents();
    } catch (error: unknown) {
      toast({
        title: 'Failed to create event',
        description: error instanceof Error ? error.message : 'Unknown error',
        status: 'error',
        isClosable: true
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const joinEvent = async (eventId: string, targetChainId?: number) => {
    if (!eventContract || !address) {
      throw new Error('Not connected');
    }

    try {
      setLoading(true);

      if (targetChainId && targetChainId !== chainId) {
        // Cross-chain join event
        await sendMessage(
          targetChainId,
          ethers.utils.defaultAbiCoder.encode(
            ['uint256', 'address'],
            [parseInt(eventId), address]
          ),
          { adapterParams: { gasLimit: '200000' } }
        );
      } else {
        // Same chain join event
        const tx = await eventContract.joinEvent(eventId);
        await tx.wait();
      }

      toast({
        title: 'Successfully joined event',
        status: 'success',
        isClosable: true
      });
      await fetchEvents();
    } catch (error) {
        toast({
          title: 'Failed to fetch events',
          description: (error as Error).message,
          status: 'error',
          isClosable: true
        });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  return {
    events,
    userEvents,
    loading,
    createEvent,
    joinEvent,
    refreshEvents: fetchEvents
  };
};