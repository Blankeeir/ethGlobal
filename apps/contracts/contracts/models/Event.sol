// contracts/interfaces/IServareNFT.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

    struct Event {
        string name;
        string description;
        uint256 startTime;
        uint256 endTime;
        address creator;
        bool requiresIdentity;
        mapping(address => bool) participants;
        uint256 participantCount;
        bool isActive;
        string category;
        string filecoinCID;
    }