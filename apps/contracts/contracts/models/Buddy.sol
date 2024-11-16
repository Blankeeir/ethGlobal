// contracts/interfaces/IServareNFT.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

    struct Buddy {
        string ensName;
        bool isVerified;
        uint256 verificationTimestamp;
        uint256 totalConnections;
        string[] specialties;
        uint256 rating;
        uint256 totalRatings;
    }