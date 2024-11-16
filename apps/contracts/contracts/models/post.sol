// contracts/interfaces/IServareNFT.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;
    // Core post data structure
    struct Post {
        string content;
        string imageURI;
        address author;
        uint256 timestamp;
        uint256 likes;
        bool isBuddyOnly;
        bool isDeleted;
        string category;
        uint256 commentCount;
    }