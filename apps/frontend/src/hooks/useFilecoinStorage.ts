// hooks/useFilecoinStorage.ts
import { useState, useCallback } from 'react';
import { useToast } from './useToast';
import { FilecoinService } from '../services/FilecoinService';

export const useFilecoinStorage = () => {
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const filecoinService = new FilecoinService(process.env.REACT_APP_WEB3_STORAGE_TOKEN!);

  const storeData = useCallback(async (data: any) => {
    try {
      setLoading(true);
      toast.info('Storing data...', {
        description: 'Please wait while we store your data on Filecoin'
      });

      const cid = await filecoinService.storeJSON(data);
      
      toast.success('Data stored successfully', {
        description: `CID: ${cid}`
      });
      
      return cid;
    } catch (error: any) {
      toast.error('Failed to store data', {
        description: error.message
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [filecoinService, toast]);

  const retrieveData = useCallback(async (cid: string) => {
    try {
      setLoading(true);
      const data = await filecoinService.retrieveJSON(cid);
      return data;
    } catch (error: any) {
      toast.error('Failed to retrieve data', {
        description: error.message
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [filecoinService, toast]);

  return {
    storeData,
    retrieveData,
    loading
  };
};