// components/TrackingHistory.tsx
import React from 'react';
import {
    Box,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    Badge,
    Skeleton
} from '@chakra-ui/react';
import { useSupplyChain } from '../../hooks/useSupplyChain';

export const TrackingHistory: React.FC<{ tokenId: string }> = ({ tokenId }) => {
    const { trackingHistory, isLoadingHistory } = useSupplyChain(tokenId) as unknown as {
        trackingHistory: Array<{
            timestamp: number;
            location: string;
            handler: string;
            temperature: number;
            humidity: number;
            isValidated: boolean;
        }>| undefined;
        isLoadingHistory: boolean;
    };
  if (isLoadingHistory) {
    return <Skeleton height="400px" />;
  }

  return (
    <Box overflowX="auto">
      <Table>
        <Thead>
          <Tr>
            <Th>Time</Th>
            <Th>Location</Th>
            <Th>Handler</Th>
            <Th>Temperature</Th>
            <Th>Humidity</Th>
            <Th>Status</Th>
          </Tr>
        </Thead>
        <Tbody>
          {trackingHistory?.map((event, index) => (
            <Tr key={index}>
              <Td>{new Date(event.timestamp * 1000).toLocaleString()}</Td>
              <Td>{event.location}</Td>
              <Td>{event.handler}</Td>
              <Td>{event.temperature}°C</Td>
              <Td>{event.humidity}%</Td>
              <Td>
                <Badge 
                  colorScheme={event.isValidated ? 'green' : 'yellow'}
                >
                  {event.isValidated ? 'Verified' : 'Pending'}
                </Badge>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  );
};