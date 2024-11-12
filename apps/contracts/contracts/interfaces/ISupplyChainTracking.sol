// contracts/interfaces/ISupplyChainTracking.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

interface ISupplyChainTracking {
    struct TrackingData {
        uint256 timestamp;
        string location;
        string handler;
        string status;
        string[] envKeys;
        string[] envValues;
        uint256 temperature;
        uint256 humidity;
        bool isValidated;
        address validator;
    }

    event TrackingUpdated(
        uint256 indexed tokenId,
        string location,
        string status,
        uint256 timestamp
    );

    event TrackingValidated(
        uint256 indexed tokenId,
        uint256 indexed trackingIndex,
        address validator,
        bool isValid
    );

    event AlertTriggered(
        uint256 indexed tokenId,
        string alertType,
        string description,
        uint256 timestamp
    );

    function addTrackingData(
        uint256 tokenId,
        string memory location,
        string memory handler,
        string memory status,
        string[] memory envKeys,
        string[] memory envValues,
        uint256 temperature,
        uint256 humidity
    ) external;

    function validateTrackingData(
        uint256 tokenId,
        uint256 trackingIndex,
        bool isValid,
        string memory notes
    ) external;

    function getTrackingHistory(uint256 tokenId) external view returns (TrackingData[] memory);
}