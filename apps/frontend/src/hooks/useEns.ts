// // src/hooks/useENS.ts
// import { useState } from 'react';
// // import { ethers } from 'ethers';
// import { useProvider } from 'wagmi'

// export const useENS = () => {
//   const provider = useProvider();
//   const [ensName, setEnsName] = useState<string | null>(null);
//   const [ensAvatar, setEnsAvatar] = useState<string | null>(null);
//   const [address, setAddress] = useState<string | null>(null);

//   const lookupAddress = async (address: string) => {
//     try {
//       const name = await provider.lookupAddress(address);
//       setEnsName(name);
      
//       if (name) {
//         const resolver = await provider.getResolver(name);
//         const avatar = await resolver?.getText('avatar');
//         setEnsAvatar(avatar || null);
//       }
//     } catch (err) {
//       console.error('Error looking up ENS name:', err);
//     }
//   };

//   const resolveENS = async (name: string) => {
//     try {
//       const resolvedAddress = await provider.resolveName(name);
//       setAddress(resolvedAddress);
      
//       if (resolvedAddress) {
//         const resolver = await provider.getResolver(name);
//         const avatar = await resolver?.getText('avatar');
//         setEnsAvatar(avatar || null);
//       }
//     } catch (err) {
//       console.error('Error resolving ENS name:', err);
//     }
//   };

//   return {
//     ensName,
//     ensAvatar,
//     address,
//     lookupAddress,
//     resolveENS,
//   };
// };