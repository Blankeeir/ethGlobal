import { Button, Fade, HStack, Text } from "@chakra-ui/react";
import { FaWallet } from "react-icons/fa6";
import { humanAddress } from "@repo/utils/FormattingUtils";

export const ConnectWalletButton = () => {
  const { account } = useWallet();
  const { open } = useWalletModal();

  if (!account)
    return (
      <Fade in={true}>
        <Button
          onClick={open}
          colorScheme="primary"
          size="md"
          leftIcon={<FaWallet />}
          data-testid="connect-wallet"
        >
          Wallet Connect
        </Button>
      </Fade>
    );

  return (
    <Fade in={true}>
      <Button
        onClick={open}
        rounded={"full"}
        color="black"
        size="md"
        bg="rgba(235, 236, 252, 1)"
      >
      </Button>
    </Fade>
  );
};
