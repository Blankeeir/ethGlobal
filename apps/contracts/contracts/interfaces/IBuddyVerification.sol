// contracts/interfaces/IServareNFT.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

// File: contracts/interfaces/IBuddyVerification.sol
interface IBuddyVerification {
    function isBuddy(address user) external view returns (bool);
    function getBuddyInfo(address user) external view returns (
        string memory ensName,
        bool isVerified,
        uint256 verificationTime,
        uint256 totalConnections
    );
}