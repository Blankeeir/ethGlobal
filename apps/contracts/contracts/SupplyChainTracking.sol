// contracts/SupplyChainTracking.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "./interfaces/IServareNFT.sol";
import "./interfaces/ISupplyChainTracking.sol";

contract SupplyChainTracking is ISupplyChainTracking, AccessControl, Pausable {
    bytes32 public constant TRACKER_ROLE = keccak256("TRACKER_ROLE");
    bytes32 public constant VALIDATOR_ROLE = keccak256("VALIDATOR_ROLE");
    
    IServareNFT public nftContract;
    
    struct ExtendedTrackingData {
        uint256 timestamp;
        string location;
        string handler;
        string status;
        mapping(string => string) environmentalData;
        uint256 temperature;
        uint256 humidity;
        bool isValidated;
        address validator;
        string validationNotes;
        bool hasAlert;
        string alertType;
    }
    
    mapping(uint256 => ExtendedTrackingData[]) private productTracking;
    mapping(uint256 => uint256) public trackingCount;
    mapping(uint256 => mapping(string => uint256)) public thresholds;
    
    constructor(address _nftContract) {
        nftContract = IServareNFT(_nftContract);
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    function addTrackingData(
        uint256 tokenId,
        string memory location,
        string memory handler,
        string memory status,
        string[] memory envKeys,
        string[] memory envValues,
        uint256 temperature,
        uint256 humidity
    ) public override whenNotPaused {
        require(hasRole(TRACKER_ROLE, msg.sender), "Must have tracker role");
        require(nftContract.ownerOf(tokenId) != address(0), "Invalid token ID");
        require(envKeys.length == envValues.length, "Arrays length mismatch");
        
        uint256 index = trackingCount[tokenId];
        ExtendedTrackingData storage newData = productTracking[tokenId][index];
        
        newData.timestamp = block.timestamp;
        newData.location = location;
        newData.handler = handler;
        newData.status = status;
        newData.temperature = temperature;
        newData.humidity = humidity;
        newData.isValidated = false;
        
        for(uint i = 0; i < envKeys.length; i++) {
            newData.environmentalData[envKeys[i]] = envValues[i];
        }
        
        // Check for threshold violations
        checkThresholds(tokenId, temperature, humidity);
        
        // Update quality score in NFT contract
        nftContract.updateQualityScore(tokenId, int256(temperature), int256(humidity));
        
        trackingCount[tokenId]++;
        emit TrackingUpdated(tokenId, location, status, block.timestamp);
    }

    function validateTrackingData(
        uint256 tokenId,
        uint256 trackingIndex,
        bool isValid,
        string memory notes
    ) public override whenNotPaused {
        require(hasRole(VALIDATOR_ROLE, msg.sender), "Must have validator role");
        require(trackingIndex < trackingCount[tokenId], "Invalid tracking index");
        
        ExtendedTrackingData storage trackingData = productTracking[tokenId][trackingIndex];
        require(!trackingData.isValidated, "Already validated");
        
        trackingData.isValidated = true;
        trackingData.validator = msg.sender;
        trackingData.validationNotes = notes;
        
        emit TrackingValidated(tokenId, trackingIndex, msg.sender, isValid);
    }

    function setThresholds(
        uint256 tokenId,
        uint256 maxTemperature,
        uint256 minTemperature,
        uint256 maxHumidity,
        uint256 minHumidity
    ) public {
        require(hasRole(DEFAULT_ADMIN_ROLE, msg.sender), "Must have admin role");
        
        thresholds[tokenId]["maxTemp"] = maxTemperature;
        thresholds[tokenId]["minTemp"] = minTemperature;
        thresholds[tokenId]["maxHumidity"] = maxHumidity;
        thresholds[tokenId]["minHumidity"] = minHumidity;
    }

    function checkThresholds(
        uint256 tokenId,
        uint256 temperature,
        uint256 humidity
    ) internal {
        if (thresholds[tokenId]["maxTemp"] > 0) {
            if (temperature > thresholds[tokenId]["maxTemp"]) {
                triggerAlert(tokenId, "Temperature High", "Temperature exceeded maximum threshold");
            }
            if (temperature < thresholds[tokenId]["minTemp"]) {
                triggerAlert(tokenId, "Temperature Low", "Temperature below minimum threshold");
            }
        }
        
        if (thresholds[tokenId]["maxHumidity"] > 0) {
            if (humidity > thresholds[tokenId]["maxHumidity"]) {
                triggerAlert(tokenId, "Humidity High", "Humidity exceeded maximum threshold");
            }
            if (humidity < thresholds[tokenId]["minHumidity"]) {
                triggerAlert(tokenId, "Humidity Low", "Humidity below minimum threshold");
            }
        }
    }

    function triggerAlert(
        uint256 tokenId,
        string memory alertType,
        string memory description
    ) internal {
        uint256 currentIndex = trackingCount[tokenId] - 1;
        ExtendedTrackingData storage currentData = productTracking[tokenId][currentIndex];
        
        currentData.hasAlert = true;
        currentData.alertType = alertType;
        
        emit AlertTriggered(tokenId, alertType, description, block.timestamp);
    }

    function getTrackingHistory(uint256 tokenId) 
        public 
        view 
        override 
        returns (TrackingData[] memory) 
    {
        uint256 count = trackingCount[tokenId];
        TrackingData[] memory history = new TrackingData[](count);
        
        for(uint256 i = 0; i < count; i++) {
            ExtendedTrackingData storage data = productTracking[tokenId][i];
            
            string[] memory keys = new string[](0);
            string[] memory values = new string[](0);
            
            history[i] = TrackingData({
                timestamp: data.timestamp,
                location: data.location,
                handler: data.handler,
                status: data.status,
                envKeys: keys,
                envValues: values,
                temperature: data.temperature,
                humidity: data.humidity,
                isValidated: data.isValidated,
                validator: data.validator
            });
        }
        
        return history;
    }

    function pause() public {
        require(hasRole(DEFAULT_ADMIN_ROLE, msg.sender), "Must have admin role");
        _pause();
    }

    function unpause() public {
        require(hasRole(DEFAULT_ADMIN_ROLE, msg.sender), "Must have admin role");
        _unpause();
    }

    // Required override
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}