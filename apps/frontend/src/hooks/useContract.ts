// apps/frontend/src/hooks/useContract.ts

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useVeChain } from './useVeChain';
import { AbiItem } from 'web3-utils';





// Extend Connex types if necessary
declare global {
  interface ConnexEvent {
    decoded: Record<string, unknown>;
    // Add other relevant properties based on Connex documentation
  }

  interface ConnexReceipt {
    outputs?: Array<{ events?: Array<{ decoded: Record<string, unknown> }> }>;
    // Add other relevant properties
  }

  interface ConnexTransaction {
    txid: string;
  }

  interface ConnexEventFilter {
    filter: (criteria: Array<{ [key: string]: string | string[] }>) => ConnexEventFilter;
    range: (args: { unit: 'block' | 'time'; from: number; to: number }) => ConnexEventFilter;
    apply: (offset: number, limit: number) => Promise<Array<ConnexEvent>>;
    watch: (callback: (error: Error | null, event?: ConnexEvent) => void) => ConnexSubscription;
  }

  interface ConnexSubscription {
    unsubscribe: () => void;
  }

  interface ConnexSignService {
    comment: (comment: string) => void;
    request: () => Promise<ConnexTransaction>;
  }

  interface ConnexThorAccount {
    method: (abiItem: AbiItem) => ConnexThorMethod;
    event: (eventName: string) => ConnexThorEvent;
  }

  interface Thor {
    account: (address: string) => ConnexThorAccount;
    transaction: (txid: string) => ConnexThorTransaction;
    ticker: () => { next: () => Promise<ConnexHead> };
  }

  interface ConnexHead {
    number: number;
  }

  interface ConnexThorMethod {
    call: (...args: unknown[]) => Promise<{ decoded: unknown[] }>;
    asClause: (...args: unknown[]) => unknown;
  }

  interface ConnexThorEvent {
    filter: (filters: Array<{ [key: string]: string | string[] }>) => ConnexEventFilter;
  }

  interface ConnexThorTransaction {
    getReceipt: () => Promise<ConnexReceipt>;
  }

  // interface Connex {
  //   thor: Thor;
  //   vendor: {
  //     sign: (type: string, clauses: unknown[]) => ConnexSignService;
  //   };
  // }
}

// Types for Connex interactions are declared above

// interface AbiInput {
//   name: string;
//   type: string;
//   indexed?: boolean;
//   components?: AbiInput[];
// }

// interface AbiOutput {
//   name: string;
//   type: string;
//   components?: AbiOutput[];
// }

// interface AbiItem {
//   type: string;
//   name: string;
//   inputs?: AbiInput[];
//   outputs?: AbiOutput[];
//   stateMutability?: string;
//   anonymous?: boolean;
//   constant?: boolean;
//   payable?: boolean;
// }

type ContractMethod = (...args: unknown[]) => Promise<unknown>;

interface ContractEventSubscription {
  unsubscribe: () => void;
}

interface ContractInterface {
  address: string;
  abi: AbiItem[];
  methods: { [key: string]: ContractMethod };
  events: {
    [key: string]: (options?: { filter?: { [key: string]: string | string[] } }) => {
      on: (
        event: 'data' | 'error',
        callback: (error: Error | null, event?: ConnexEvent) => void
      ) => ContractEventSubscription;
    };
  };
}

export const useContract = (
  contractName: string,
  address: string,
  abi: AbiItem[]
) => {
  const { connex } = useVeChain();
  const [contract, setContract] = useState<ContractInterface | null>(null);

  // Create method caller
  const createMethodCaller = useCallback(
    (abiItem: AbiItem) => {
      if (!connex || !address) return null;

      return async (...args: unknown[]) => {
        try {
          const method = connex.thor.account(address).method(abiItem);

          if (
            abiItem.stateMutability === 'view' ||
            abiItem.stateMutability === 'pure' ||
            abiItem.constant
          ) {
            // Handle read-only functions
            const output = await method.call(...args);
            if (abiItem.outputs?.length === 1) {
              return output.decoded[0];
            }
            return output.decoded;
          } else {
            // Handle state-changing functions
            const clause = method.asClause(...args);
            const signingService = connex.vendor.sign('tx', [clause]);

            // Add comment
            signingService.comment(
              `${contractName}.${abiItem.name}(${args.join(',')})`
            );

            // Send transaction
            const tx = await signingService.request();
            const receipt = await connex.thor.transaction(tx.txid).getReceipt();

            return {
              txid: tx.txid,
              // contract,
              receipt,
              decoded: (receipt?.outputs?.[0]?.events?.[0] as unknown as ConnexEvent)?.decoded,
            };
          }
        } catch (error) {
          console.error(`Error calling method ${abiItem.name}:`, error);
          throw error;
        }
      };
    },
    [connex, address, contractName]
  );

  // Create event subscriber
  const createEventSubscriber = useCallback(
    (abiItem: AbiItem) => {
      if (!connex || !address) return null;

      return (options: { filter?: { [key: string]: string | string[] } } = {}) => {
        const eventName = abiItem.name;
        // Initialize the event filter
        const eventFilter = connex.thor.account(address).event({ name: eventName }) as unknown as  ConnexEventFilter;

        if (options.filter) {
          // Apply filters if any
          eventFilter.filter([options.filter as { [key: string]: string | string[] }]);
        }

        return {
          on: (
            eventType: 'data' | 'error',
            callback: (error: Error | null, event?: ConnexEvent) => void
          ): ContractEventSubscription => {
            const subscription: ConnexSubscription = eventFilter.watch(
              (error: Error | null, event?: ConnexEvent) => {
                if (error) {
                  if (eventType === 'error') {
                    callback(error, undefined);
                  }
                } else {
                  if (eventType === 'data') {
                    callback(null, event);
                  }
                }
              }
            );

            return {
              unsubscribe: () => {
                subscription.unsubscribe();
              },
            };
          },
        };
      };
    },
    [connex, address]
  );

  // Initialize contract
  useEffect(() => {
    if (!connex || !address || !abi?.length) {
      setContract(null);
      return;
    }

    try {
      const methods: { [key: string]: ContractMethod } = {};
      const events: ContractInterface['events'] = {};

      // Create methods and events
      abi.forEach((abiItem) => {
        if (abiItem.type === 'function' && abiItem.name) {
          const methodCaller = createMethodCaller(abiItem);
          if (methodCaller) {
            methods[abiItem.name] = methodCaller;
          }
        } else if (abiItem.type === 'event' && abiItem.name) {
          const eventSubscriber = createEventSubscriber(abiItem);
          if (eventSubscriber) {
            events[abiItem.name] = eventSubscriber;
          }
        }
      });

      setContract({
        address,
        abi,
        methods,
        events,
      });
    } catch (error) {
      console.error('Failed to initialize contract:', error);
      setContract(null);
    }
  }, [
    connex,
    address,
    abi,
    createMethodCaller,
    createEventSubscriber,
    contractName,
  ]);

  return useMemo(() => contract, [contract]);
};

export type ContractCallResult<T> = {
  success: boolean;
  result?: T;
  error?: Error;
};

export const callContract = async <T>(
  method: ContractMethod,
  ...args: unknown[]
): Promise<ContractCallResult<T>> => {
  try {
    const result = await method(...args);
    return { success: true, result: result as T };
  } catch (error) {
    return { success: false, error: error as Error };
  }
};