    
// contracts/interfaces/IServareNFT.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;


    struct ChatRoom {
        uint256 id;
        address[] participants;
        bool isActive;
        uint256 messageCount;
    }