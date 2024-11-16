// contracts/interfaces/IServareNFT.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;
    // Comment data structure
    struct Comment {
        address commenter;
        string content;
        uint256 timestamp;
        bool isDeleted;
    }