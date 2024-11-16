// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import {AutomationCompatibleInterface} from "@chainlink/contracts/src/v0.8/automation/AutomationCompatible.sol";
import "./MentalHealthIdentity.sol";
import "./models/Event.sol";

contract MentalHealthEvents is AutomationCompatibleInterface, Ownable, ReentrancyGuard {

    
    mapping(uint256 => Event) public events;
    mapping(address => uint256[]) public userEvents;
    uint256 public eventCount;
    MentalHealthIdentity public identityContract;
    
    event EventCreated(uint256 indexed eventId, string name, address creator, string category);
    event ParticipantJoined(uint256 indexed eventId, address participant);
    event EventEnded(uint256 indexed eventId);
    event EventUpdated(uint256 indexed eventId, string name, string description);
    
    error InvalidTime();
    error EventNotActive();
    error AlreadyJoined();
    error IdentityRequired();
    error InvalidIdentityContract();
    error UnauthorizedAccess();
    
    constructor(
        address _identityContract
    ) {
        if (_identityContract == address(0)) revert InvalidIdentityContract();
        identityContract = MentalHealthIdentity(_identityContract);
    }
    
    function createEvent(
        string memory name,
        string memory description,
        uint256 startTime,
        uint256 endTime,
        bool requiresIdentity,
        string memory category,
        string memory filecoinCID
    ) external nonReentrant returns (uint256) {
        if (startTime <= block.timestamp || endTime <= startTime) revert InvalidTime();
        
        uint256 eventId = eventCount++;
        Event storage newEvent = events[eventId];
        newEvent.name = name;
        newEvent.description = description;
        newEvent.startTime = startTime;
        newEvent.endTime = endTime;
        newEvent.creator = msg.sender;
        newEvent.requiresIdentity = requiresIdentity;
        newEvent.isActive = true;
        newEvent.category = category;
        newEvent.filecoinCID = filecoinCID;
        
        userEvents[msg.sender].push(eventId);
        
        emit EventCreated(eventId, name, msg.sender, category);
        return eventId;
    }
    
    function joinEvent(uint256 eventId) external nonReentrant {
        Event storage evt = events[eventId];
        if (!evt.isActive) revert EventNotActive();
        if (block.timestamp >= evt.endTime) revert InvalidTime();
        if (evt.participants[msg.sender]) revert AlreadyJoined();
        
        if (evt.requiresIdentity) {
            if (!identityContract.verifiedUsers(msg.sender)) revert IdentityRequired();
        }
        
        evt.participants[msg.sender] = true;
        evt.participantCount++;
        userEvents[msg.sender].push(eventId);
        
        emit ParticipantJoined(eventId, msg.sender);
    }

    function updateEvent(
        uint256 eventId,
        string memory name,
        string memory description
    ) external {
        Event storage evt = events[eventId];
        if (evt.creator != msg.sender) revert UnauthorizedAccess();
        if (!evt.isActive) revert EventNotActive();
        
        evt.name = name;
        evt.description = description;
        
        emit EventUpdated(eventId, name, description);
    }
    
    // function checkUpkeep(
    //     bytes calldata
    // ) external view override returns (bool upkeepNeeded, bytes memory performData) {
    //     for (uint256 i = 0; i < eventCount; i++) {
    //         if (events[i].isActive && block.timestamp >= events[i].endTime) {
    //             return (true, abi.encode(i));
    //         }
    //     }
    //     return (false, "");
    // }
    
    // function performUpkeep(bytes calldata performData) external override {
    //     uint256 eventId = abi.decode(performData, (uint256));
    //     if (events[eventId].isActive && block.timestamp >= events[eventId].endTime) {
    //         events[eventId].isActive = false;
    //         emit EventEnded(eventId);
    //     }
    // }

    function getUserEvents(
        address user
    ) external view returns (uint256[] memory) {
        return userEvents[user];
    }

    function getEventParticipants(
        uint256 eventId
    ) external view returns (address[] memory, uint256) {
        Event storage evt = events[eventId];
        address[] memory participants = new address[](evt.participantCount);
        uint256 index = 0;
        
        // Note: This is not gas efficient for large numbers of participants
        // Consider implementing pagination for production
        for (uint256 i = 0; i < participants.length; i++) {
            if (evt.participants[participants[i]]) {
                participants[index] = participants[i];
                index++;
            }
        }
        
        return (participants, evt.participantCount);
    }

    function isParticipant(
        uint256 eventId,
        address user
    ) external view returns (bool) {
        return events[eventId].participants[user];
    }

    function checkUpkeep(bytes calldata) external view override returns (bool upkeepNeeded, bytes memory performData) {
        upkeepNeeded = false;
        uint256[] memory expiredEventIds = new uint256[](eventCount);
        uint256 count = 0;

        for (uint256 i = 0; i < eventCount; i++) {
            if (events[i].isActive && block.timestamp >= events[i].endTime) {
                upkeepNeeded = true;
                expiredEventIds[count] = i;
                count++;
            }
        }

        if (upkeepNeeded) {
            // Trim the array to the actual count
            bytes memory idsToEnd = abi.encode(expiredEventIds, count);
            return (true, idsToEnd);
        }
        return (false, "");
    }

    function performUpkeep(bytes calldata performData) external override {
        (uint256[] memory expiredEventIds, uint256 count) = abi.decode(performData, (uint256[], uint256));

        for (uint256 i = 0; i < count; i++) {
            uint256 eventId = expiredEventIds[i];
            if (events[eventId].isActive && block.timestamp >= events[eventId].endTime) {
                events[eventId].isActive = false;
                emit EventEnded(eventId);
            }
        }
    }
}