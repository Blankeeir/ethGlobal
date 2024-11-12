// apps/frontend/src/components/Loading/TableSkeleton.tsx
import React from 'react';
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Skeleton,
} from '@chakra-ui/react';

interface TableSkeletonProps {
  columns: number;
  rows: number;
}

export const TableSkeleton: React.FC<TableSkeletonProps> = ({ columns, rows }) => {
  return (
    <Table>
      <Thead>
        <Tr>
          {[...Array(columns)].map((_, i) => (
            <Th key={i}>
              <Skeleton height="20px" width="100px" />
            </Th>
          ))}
        </Tr>
      </Thead>
      <Tbody>
        {[...Array(rows)].map((_, rowIndex) => (
          <Tr key={rowIndex}>
            {[...Array(columns)].map((_, colIndex) => (
              <Td key={colIndex}>
                <Skeleton height="20px" width={colIndex === 0 ? "150px" : "100px"} />
              </Td>
            ))}
          </Tr>
        ))}
      </Tbody>
    </Table>
  );
};
