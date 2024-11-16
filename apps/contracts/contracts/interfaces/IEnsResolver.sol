// Interface for ENS resolution
// contracts/interfaces/ISupplyChainTracking.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

interface IENSResolver {
    function addr(bytes32 node) external view returns (address);
    function name(bytes32 node) external view returns (string memory);
}