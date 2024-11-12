// apps/frontend/src/components/Profile/TransactionHistory.tsx
import React from 'react';
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Link,
  Icon,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';
import { ExternalLink } from 'lucide-react';
import { TableSkeleton } from '../Loading/TableSkeleton';
import { FormattingUtils } from '@repo/utils';
import { AnimatedContainer } from '../Animations/AnimatedContainer';
// // Combine Chakra and Motion props
// const MotionBox = chakra(motion.div, {
//     shouldForwardProp: (prop) => isValidMotionProp(prop) || shouldForwardProp(prop),
//   });

export interface Transaction {
  id: string;
  type: 'buy' | 'sell' | 'list' | 'transfer';
  amount: string;
  timestamp: string;
  txHash: string;
  status: 'completed' | 'pending' | 'failed';
}

export const TransactionHistory: React.FC<{ 
  transactions?: Transaction[] 
}> = ({ transactions }) => {
  const bgColor = useColorModeValue('white', 'gray.700');

  if (!transactions) {
    return <TableSkeleton columns={5} rows={5} />;
  }

  return (
    // <AnimatedContainer
    //   variant="fade"
    //   isVisible={true}
    //   bg={bgColor}
    //   borderRadius="xl"
    //   shadow="sm"
    //   overflow="hidden"
    // >
      <Table>
        <Thead>
          <Tr>
            <Th>Type</Th>
            <Th>Amount</Th>
            <Th>Date</Th>
            <Th>Status</Th>
            <Th>Transaction</Th>
          </Tr>
        </Thead>
        <Tbody>
          {transactions.map((tx, index) => (
            // <AnimatedContainer
            //   key={tx.id}
            //   variant="slide"
            //   delay={index * 0.1}
            //   as="tr"
            // >
              <Tr>
                <Td>
                  <Badge
                    colorScheme={
                      tx.type === 'buy' ? 'green' :
                      tx.type === 'sell' ? 'blue' :
                      tx.type === 'list' ? 'purple' :
                      'gray'
                    }
                  >
                    {tx.type.toUpperCase()}
                  </Badge>
                </Td>
                <Td fontWeight="medium">
                  {tx.amount} VET
                </Td>
                <Td>
                  {new Date(tx.timestamp).toLocaleString()}
                </Td>
                <Td>
                  <Badge
                    colorScheme={
                      tx.status === 'completed' ? 'green' :
                      tx.status === 'pending' ? 'yellow' :
                      'red'
                    }
                  >
                    {tx.status}
                  </Badge>
                </Td>
                <Td>
                  <Link
                    href={`https://explore-testnet.vechain.org/transactions/${tx.txHash}`}
                    isExternal
                    color="primary.500"
                    display="flex"
                    alignItems="center"
                  >
                    {FormattingUtils.formatAddress(tx.txHash)}
                    <Icon as={ExternalLink} ml={1} boxSize={4} />
                  </Link>
                </Td>
              </Tr>
            // </AnimatedContainer>
          ))}
          {transactions.length === 0 && (
            <Tr>
              <Td colSpan={5}>
                <Text textAlign="center" py={4} color="gray.500">
                  No transactions found
                </Text>
              </Td>
            </Tr>
          )}
        </Tbody>
      </Table>
    // </AnimatedContainer>
  );
};