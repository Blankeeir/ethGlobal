// src/components/ConnectWalletButton.tsx

import React, { useContext } from 'react';
import { Button, Fade } from "@chakra-ui/react";
import { FaWallet } from "react-icons/fa6";
import { humanAddress } from "@repo/utils/FormattingUtils"; // Ensure this utility function exists and works correctly
import { DynamicAuthContext } from './Auth/DynamicAuthProvider'; // Correctly import the context

export const ConnectWalletButton = () => {
  const authContext = useContext(DynamicAuthContext); // Use the context object

  if (!authContext) {
    throw new Error("ConnectWalletButton must be used within a DynamicAuthProvider");
  }

  const { isAuthenticated, walletAddress, openWidget } = authContext;

  const handleButtonClick = () => {
    if (!isAuthenticated) {
      openWidget();
    } else {
      // Optional: Implement actions for authenticated users, e.g., logout or open settings
      // For example, you might want to allow users to disconnect their wallet
    }
  };

  return (
    <Fade in={true}>
      <Button
        onClick={handleButtonClick}
        colorScheme={!isAuthenticated ? "primary" : "gray"}
        size="md"
        leftIcon={!isAuthenticated ? <FaWallet /> : undefined}
        data-testid="connect-wallet"
        rounded={"full"}
        bg={!isAuthenticated ? undefined : "rgba(235, 236, 252, 1)"}
        color={!isAuthenticated ? undefined : "black"}
      >
        {!isAuthenticated && "Wallet Connect"}
        {isAuthenticated && walletAddress && humanAddress(walletAddress)}
      </Button>
    </Fade>
  );
};
