import { Image, ImageProps, VStack } from "@chakra-ui/react";
import React from "react";

type Props = {
  ServareIconProps?: ImageProps;
  size: string | number;
};


export const ServareIcon: React.FC<Props> = ({
  ServareIconProps,
}) => (
  <VStack spacing={2} align="flex-start" w="full">
    <Image src="/be_better.svg" {...ServareIconProps} />
    <Image src="/vebetter_dark.svg" {...ServareIconProps} />
  </VStack>
);
