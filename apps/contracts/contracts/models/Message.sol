// contracts/interfaces/IServareNFT.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;
    // models/Message.sol
    struct Message {
        address sender;
        address recipient;
        string content;
        uint256 timestamp;
        bool isEncrypted;
        string filecoinCID;  // CID for additional content/metadata
        string contentType;  // For content type identification
        uint256 chainId;
    }