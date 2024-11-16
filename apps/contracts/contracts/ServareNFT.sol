// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";


contract SurfoodNFT is ERC721("Surfood", "FOOD"), AccessControl, Ownable(msg.sender) {
    uint256 private _currentTokenId;
    
    bytes32 public constant PRODUCER_ROLE = keccak256("PRODUCER_ROLE");
    bytes32 public constant VERIFIER_ROLE = keccak256("VERIFIER_ROLE");

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _currentTokenId = 0;
    }
    struct FoodProduct {
        string name;
        string description;
        uint256 quantity;
        string location;
        uint256 expiryDate;
        string productionDate;
        string category;
        string imageURI;
        uint256 price;
        bool isListed;
        address producer;
        bool isVerified;
        mapping(uint256 => SupplyChainEvent) supplyChainEvents;
        uint256 eventCount;
        bytes32 ipfsMetadataHash;
        ProductQuality quality;
        uint256 carbonFootprint;
        bool exists;
    }

    struct SupplyChainEvent {
        uint256 timestamp;
        string eventType;
        string location;
        string handlerName;
        bytes32 ipfsDataHash;
        mapping(string => string) sensorData;
    }

    enum ProductQuality { Excellent, Good, Fair, Poor }

    mapping(uint256 => FoodProduct) public foodProducts;
    mapping(address => bool) public verifiedProducers;
    
    event ProductCreated(
        uint256 indexed tokenId,
        address producer,
        string name,
        uint256 quantity,
        string category
    );
    event SupplyChainEventAdded(
        uint256 indexed tokenId,
        string eventType,
        string location,
        uint256 timestamp
    );
    event QualityUpdated(
        uint256 indexed tokenId,
        ProductQuality quality,
        uint256 timestamp
    );
    event ProductListed(
        uint256 indexed tokenId,
        uint256 price,
        uint256 timestamp
    );
    event ProductUnlisted(uint256 indexed tokenId);



   function exists(uint256 tokenId) public view returns (bool) {
        // Check if the token has a valid owner address
        try this.ownerOf(tokenId) returns (address) {
            return foodProducts[tokenId].exists;
        } catch {
            return false;
        }
    }

    modifier tokenExists(uint256 tokenId) {
        require(exists(tokenId), "Token does not exist");
        _;
    }

    modifier onlyProducer() {
        require(hasRole(PRODUCER_ROLE, msg.sender), "Must have producer role");
        _;
    }

    modifier onlyVerifier() {
        require(hasRole(VERIFIER_ROLE, msg.sender), "Must have verifier role");
        _;
    }

    function isValidProduct(uint256 tokenId) public view returns (bool) {
        if (!exists(tokenId)) return false;
        FoodProduct storage product = foodProducts[tokenId];
        return product.producer != address(0) && product.expiryDate > block.timestamp;
    }

    function isListedProduct(uint256 tokenId) public view returns (bool) {
        if (!exists(tokenId)) return false;
        return foodProducts[tokenId].isListed;
    }

    function getProductCount() public view returns (uint256) {
        return _currentTokenId;
    }

    function getProductsByProducer(address producer) public view returns (uint256[] memory productsArray) {
            uint256 count = 0;
            
            // First pass: count products
            for (uint256 i = 1; i <= _currentTokenId; i++) {
                if (exists(i) && foodProducts[i].producer == producer) {
                    count++;
                }
            }
            
            // Create array with exact size needed
            productsArray = new uint256[](count);
            
            // Second pass: fill array
            if (count > 0) {
                uint256 index = 0;
                for (uint256 i = 1; i <= _currentTokenId; i++) {
                    if (exists(i) && foodProducts[i].producer == producer) {
                        productsArray[index] = i;
                        index++;
                    }
                }
            }
            
            return productsArray;
        }

    function createFoodProduct(
        string memory name,
        string memory description,
        uint256 quantity,
        string memory location,
        uint256 expiryDate,
        string memory productionDate,
        string memory category,
        string memory imageURI,
        uint256 price,
        bytes32 ipfsMetadataHash,
        uint256 carbonFootprint
    ) public onlyProducer returns (uint256) {
        require(bytes(name).length > 0, "Name cannot be empty");
        require(quantity > 0, "Quantity must be positive");
        require(expiryDate > block.timestamp, "Expiry date must be in the future");
        
        unchecked {
            _currentTokenId++;
        }
        
        uint256 newItemId = _currentTokenId;
        _safeMint(msg.sender, newItemId);

        FoodProduct storage newProduct = foodProducts[newItemId];
        newProduct.name = name;
        newProduct.description = description;
        newProduct.quantity = quantity;
        newProduct.location = location;
        newProduct.expiryDate = expiryDate;
        newProduct.productionDate = productionDate;
        newProduct.category = category;
        newProduct.imageURI = imageURI;
        newProduct.price = price;
        newProduct.isListed = true;
        newProduct.producer = msg.sender;
        newProduct.ipfsMetadataHash = ipfsMetadataHash;
        newProduct.quality = ProductQuality.Good;
        newProduct.carbonFootprint = carbonFootprint;
        newProduct.exists = true;
        
        emit ProductCreated(newItemId, msg.sender, name, quantity, category);
        return newItemId;
    }

    function addSupplyChainEvent(
        uint256 tokenId,
        string memory eventType,
        string memory location,
        string memory handlerName,
        bytes32 ipfsDataHash,
        string[] memory sensorKeys,
        string[] memory sensorValues
    ) public onlyVerifier tokenExists(tokenId) {
        require(sensorKeys.length == sensorValues.length, "Arrays length mismatch");
        require(bytes(eventType).length > 0, "Event type cannot be empty");
        
        FoodProduct storage product = foodProducts[tokenId];
        uint256 eventId = product.eventCount;
        
        SupplyChainEvent storage newEvent = product.supplyChainEvents[eventId];
        newEvent.timestamp = block.timestamp;
        newEvent.eventType = eventType;
        newEvent.location = location;
        newEvent.handlerName = handlerName;
        newEvent.ipfsDataHash = ipfsDataHash;
        
        for(uint i = 0; i < sensorKeys.length; i++) {
            newEvent.sensorData[sensorKeys[i]] = sensorValues[i];
        }
        
        unchecked {
            product.eventCount++;
        }
        
        emit SupplyChainEventAdded(tokenId, eventType, location, block.timestamp);
    }

    function updateQuality(
        uint256 tokenId,
        ProductQuality quality
    ) public onlyVerifier tokenExists(tokenId) {
        foodProducts[tokenId].quality = quality;
        emit QualityUpdated(tokenId, quality, block.timestamp);
    }

    function toggleProductListing(
        uint256 tokenId,
        bool isListed,
        uint256 newPrice
    ) public tokenExists(tokenId) {
        require(ownerOf(tokenId) == msg.sender, "Not token owner");
        
        FoodProduct storage product = foodProducts[tokenId];
        product.isListed = isListed;
        
        if (isListed) {
            require(newPrice > 0, "Price must be positive");
            product.price = newPrice;
            emit ProductListed(tokenId, newPrice, block.timestamp);
        } else {
            emit ProductUnlisted(tokenId);
        }
    }

    function getProduct(uint256 tokenId) public view tokenExists(tokenId) returns (
        string memory name,
        string memory description,
        uint256 quantity,
        string memory location,
        uint256 expiryDate,
        string memory productionDate,
        string memory category,
        string memory imageURI,
        uint256 price,
        bool isListed,
        address producer,
        bool isVerified,
        bytes32 ipfsMetadataHash,
        ProductQuality quality,
        uint256 carbonFootprint
    ) {
        FoodProduct storage product = foodProducts[tokenId];
        return (
            product.name,
            product.description,
            product.quantity,
            product.location,
            product.expiryDate,
            product.productionDate,
            product.category,
            product.imageURI,
            product.price,
            product.isListed,
            product.producer,
            product.isVerified,
            product.ipfsMetadataHash,
            product.quality,
            product.carbonFootprint
        );
    }

    function supportsInterface(
        bytes4 interfaceId
    ) public view virtual override(ERC721, AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}