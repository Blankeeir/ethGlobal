// contracts/interfaces/IServareNFT.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;
// Add ENS interface
// interfaces/IENS.sol
interface IENS {
    function setName(string calldata name) external returns (bytes32);
    function getName(address addr) external view returns (string memory);
    function getAddress(string calldata name) external view returns (address);
}