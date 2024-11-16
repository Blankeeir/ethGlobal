// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@hyperlane-xyz/core/contracts/interfaces/IMailbox.sol";
import "./interfaces/IWorldID.sol";
import "./interfaces/IENS.sol";

contract MentalHealthIdentity is Ownable(msg.sender), Pausable {
    IWorldID public worldId;
    IMailbox public hyperlaneMailbox;
    IENS public ensRegistry;
    
    mapping(address => bool) public verifiedUsers;
    mapping(address => string) public userENS;
    mapping(address => string) public userMetadata; // IPFS/Filecoin CID
    mapping(address => bool) public isBanned;
    
    event UserVerified(address indexed user, string ensName);
    event MetadataUpdated(address indexed user, string newCID);
    event ENSNameSet(address indexed user, string ensName);
    event CrossChainVerification(uint32 originDomain, address indexed user);
    event UserBanned(address indexed user);
    event UserUnbanned(address indexed user);
    
      error AlreadyVerified();
    error InvalidProof();
    error NotVerified();
    error UserIsBanned();
    error InvalidMailbox();
    error UnauthorizedCaller();
    error InvalidAddress();
    error EmptyENSName();
    error EmptyMetadataCID();
    error ENSNameTaken();
    error ENSRegistryError();
    
    constructor(
        address _worldId,
        address _mailbox,
        address _ensRegistry
    ) {
        if (_worldId == address(0) || _mailbox == address(0) || _ensRegistry == address(0)) 
            revert InvalidAddress();
        worldId = IWorldID(_worldId);
        hyperlaneMailbox = IMailbox(_mailbox);
        ensRegistry = IENS(_ensRegistry);
    }
    
    modifier notBanned() {
        if (isBanned[msg.sender]) revert UserIsBanned();
        _;
    }
    
    function verifyIdentity(
        uint256 root,
        uint256 groupId,
        uint256 signalHash,
        uint256 nullifierHash,
        uint256[8] calldata proof
    ) external whenNotPaused notBanned {
        if (verifiedUsers[msg.sender]) revert AlreadyVerified();
        
        bool isValid = worldId.verifyProof(
            root,
            groupId,
            signalHash,
            nullifierHash,
            proof
        );
        
        if (!isValid) revert InvalidProof();
        
        verifiedUsers[msg.sender] = true;
        emit UserVerified(msg.sender, userENS[msg.sender]);
    }
    
    function setENSAndMetadata(
        string calldata ensName,
        string calldata metadataCID
    ) external whenNotPaused notBanned {
        if (bytes(ensName).length == 0) revert EmptyENSName();
        if (bytes(metadataCID).length == 0) revert EmptyMetadataCID();
        
        // Check if the current name for the address is empty
        string memory currentName = ensRegistry.getName(msg.sender);
        if (bytes(currentName).length > 0) revert ENSNameTaken();
        
        // Try to set the ENS name
        try ensRegistry.setName(ensName) returns (bytes32) {
            userENS[msg.sender] = ensName;
            userMetadata[msg.sender] = metadataCID;
            
            emit ENSNameSet(msg.sender, ensName);
            emit MetadataUpdated(msg.sender, metadataCID);
        } catch {
            revert ENSRegistryError();
        }
    }
    
    function verifyCrossChain(
        uint32 destinationDomain,
        address user
    ) external whenNotPaused notBanned {
        if (!verifiedUsers[user]) revert NotVerified();
        if (isBanned[user]) revert UserIsBanned();
        
        bytes memory message = abi.encode(
            user,
            userENS[user],
            userMetadata[user]
        );
        
        hyperlaneMailbox.dispatch(
            destinationDomain,
            bytes32(uint256(uint160(user))),
            message
        );
    }
    
    function handle(
        uint32 origin,
        bytes32 sender,
        bytes calldata message
    ) external {
        if (msg.sender != address(hyperlaneMailbox)) revert UnauthorizedCaller();
        
        (
            address user,
            string memory ensName,
            string memory metadata
        ) = abi.decode(message, (address, string, string));
        
        if (isBanned[user]) revert UserIsBanned();
        
        verifiedUsers[user] = true;
        userENS[user] = ensName;
        userMetadata[user] = metadata;
        
        emit CrossChainVerification(origin, user);
    }
    
    function banUser(address user) external onlyOwner {
        isBanned[user] = true;
        emit UserBanned(user);
    }
    
    function unbanUser(address user) external onlyOwner {
        isBanned[user] = false;
        emit UserUnbanned(user);
    }
    
    function pause() external onlyOwner {
        _pause();
    }
    
    function unpause() external onlyOwner {
        _unpause();
    }
    
    function isVerified(address user) external view returns (bool) {
        return verifiedUsers[user] && !isBanned[user];
    }
    
    function getUserMetadata(address user) external view returns (
        string memory ensName,
        string memory metadata,
        bool verified,
        bool banned
    ) {
        return (
            userENS[user],
            userMetadata[user],
            verifiedUsers[user],
            isBanned[user]
        );
    }
}