// contracts/interfaces/IServareNFT.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;
   
    struct ChatInfo {
        bool isActive;
        uint256 lastMessageTime;
        uint256 messageCount;
    }