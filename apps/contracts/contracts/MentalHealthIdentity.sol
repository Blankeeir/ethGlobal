// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@hyperlane-xyz/core/contracts/interfaces/IMailbox.sol";
import "@ensdomains/ens-contracts/contracts/registry/ENS.sol";
import "@ensdomains/ens-contracts/contracts/resolvers/PublicResolver.sol";
import "./interfaces/IWorldID.sol";

library ByteHasher {
    function hashToField(bytes memory value) internal pure returns (uint256) {
        return uint256(keccak256(abi.encodePacked(value))) >> 8;
    }
}

contract MentalHealthIdentity is Ownable, Pausable {
    using ByteHasher for bytes;

    // State variables for WorldID
    IWorldID public immutable worldId;
    bytes32 public immutable appId;
    bytes32 public immutable actionId;
    uint256 public immutable groupId;

    // ENS state variables
    ENS public immutable ens;
    PublicResolver public immutable ensResolver;

    // Hyperlane
    IMailbox public immutable hyperlaneMailbox;

    // Mappings
    mapping(address => bool) public verifiedUsers;
    mapping(address => string) public userENS;
    mapping(address => string) public userMetadata;
    mapping(address => bool) public isBanned;
    mapping(uint256 => bool) public nullifierHashes;
        // Additional ENS mappings
    mapping(string => address) public ensNameToAddress;
    mapping(address => string) public addressToEnsName;
    mapping(bytes32 => bool) public usedENSNodes;

    // Additional events
    event ENSNameRegistered(string indexed ensName, address indexed user);
    event ENSNameUpdated(string indexed oldName, string indexed newName, address indexed user);
    event ENSNameReleased(string indexed ensName, address indexed user);

    // Additional errors
    error ENSNameExists();
    error ENSNameNotFound();
    error InvalidENSName();
    error UnauthorizedENSOperation();

    // Events
    event UserVerified(address indexed user, string ensName);
    event MetadataUpdated(address indexed user, string newCID);
    event ENSNameSet(address indexed user, string ensName);
    event CrossChainVerification(uint32 originDomain, address indexed user);
    event UserBanned(address indexed user);
    event UserUnbanned(address indexed user);

    // Errors
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
    error InvalidNullifier();
    error InvalidSignal();

    constructor(
        IWorldID _worldId,
        string memory _appId,
        string memory _actionId,
        uint256 _groupId,
        address _ens,
        address _ensResolver,
        address _mailbox
    ) {
        if (address(_worldId) == address(0) || 
            _ens == address(0) || 
            _ensResolver == address(0) || 
            _mailbox == address(0)) revert InvalidAddress();

        worldId = _worldId;
        appId = keccak256(abi.encodePacked(_appId));
        actionId = keccak256(abi.encodePacked(_actionId));
        groupId = _groupId;
        ens = ENS(_ens);
        ensResolver = PublicResolver(_ensResolver);
        hyperlaneMailbox = IMailbox(_mailbox);
    }

    modifier notBanned() {
        if (isBanned[msg.sender]) revert UserIsBanned();
        _;
    }

     function registerENSName(string calldata ensName) external whenNotPaused notBanned {
        if (bytes(ensName).length == 0) revert EmptyENSName();
        if (bytes(ensName).length > 100) revert InvalidENSName();
        if (ensNameToAddress[ensName] != address(0)) revert ENSNameExists();
        
        // Release old name if exists
        if (bytes(addressToEnsName[msg.sender]).length > 0) {
            string memory oldName = addressToEnsName[msg.sender];
            delete ensNameToAddress[oldName];
            emit ENSNameReleased(oldName, msg.sender);
        }

        // Set new name
        ensNameToAddress[ensName] = msg.sender;
        addressToEnsName[msg.sender] = ensName;
        
        // Generate ENS node
        bytes32 node = keccak256(abi.encodePacked(ensName));
        require(!usedENSNodes[node], "ENS node already used");
        usedENSNodes[node] = true;

        // Try to set in ENS resolver
        try ensResolver.setName(node, ensName) {
            emit ENSNameRegistered(ensName, msg.sender);
        } catch {
            revert ENSRegistryError();
        }
    }

    function updateENSName(string calldata newEnsName) external whenNotPaused notBanned {
        if (bytes(newEnsName).length == 0) revert EmptyENSName();
        if (bytes(newEnsName).length > 100) revert InvalidENSName();
        if (ensNameToAddress[newEnsName] != address(0)) revert ENSNameExists();
        
        string memory oldName = addressToEnsName[msg.sender];
        if (bytes(oldName).length == 0) revert ENSNameNotFound();

        // Release old name
        delete ensNameToAddress[oldName];
        
        // Set new name
        ensNameToAddress[newEnsName] = msg.sender;
        addressToEnsName[msg.sender] = newEnsName;

        // Generate new ENS node
        bytes32 node = keccak256(abi.encodePacked(newEnsName));
        require(!usedENSNodes[node], "ENS node already used");
        usedENSNodes[node] = true;

        // Update in ENS resolver
        try ensResolver.setName(node, newEnsName) {
            emit ENSNameUpdated(oldName, newEnsName, msg.sender);
        } catch {
            revert ENSRegistryError();
        }
    }

    function releaseENSName() external whenNotPaused {
        string memory ensName = addressToEnsName[msg.sender];
        if (bytes(ensName).length == 0) revert ENSNameNotFound();

        // Clear mappings
        delete ensNameToAddress[ensName];
        delete addressToEnsName[msg.sender];

        // Clear ENS node
        bytes32 node = keccak256(abi.encodePacked(ensName));
        delete usedENSNodes[node];

        emit ENSNameReleased(ensName, msg.sender);
    }

    // Enhanced lookup functions
    function lookupENSName(string calldata ensName) external view returns (address) {
        address owner = ensNameToAddress[ensName];
        if (owner == address(0)) revert ENSNameNotFound();
        return owner;
    }

    function lookupAddress(address user) external view returns (string memory) {
        string memory ensName = addressToEnsName[user];
        if (bytes(ensName).length == 0) revert ENSNameNotFound();
        return ensName;
    }

    function isENSNameAvailable(string calldata ensName) external view returns (bool) {
        return ensNameToAddress[ensName] == address(0) && 
               !usedENSNodes[keccak256(abi.encodePacked(ensName))];
    }

    // Override getUserMetadata to include ENS information
    function getUserMetadata(address user) external view returns (
        string memory ensName,
        string memory metadata,
        bool verified,
        bool banned,
        bool hasENS
    ) {
        return (
            addressToEnsName[user],
            userMetadata[user],
            verifiedUsers[user],
            isBanned[user],
            bytes(addressToEnsName[user]).length > 0
        );
    }


    function verifyIdentity(
        address signal,
        uint256 root,
        uint256 nullifierHash,
        uint256[8] calldata proof
    ) external whenNotPaused notBanned {
        if (verifiedUsers[msg.sender]) revert AlreadyVerified();
        if (nullifierHashes[nullifierHash]) revert InvalidNullifier();
        if (signal != msg.sender) revert InvalidSignal();

        // Verify WorldID proof
        worldId.verifyProof(
            root,
            groupId,
            abi.encodePacked(signal).hashToField(),
            nullifierHash,
            proof
        );

        nullifierHashes[nullifierHash] = true;
        verifiedUsers[msg.sender] = true;
        emit UserVerified(msg.sender, userENS[msg.sender]);
    }

    function setENSAndMetadata(
        string calldata ensName,
        string calldata metadataCID
    ) external whenNotPaused notBanned {
        if (bytes(ensName).length == 0) revert EmptyENSName();
        if (bytes(metadataCID).length == 0) revert EmptyMetadataCID();

        // Check ENS name availability
        bytes32 node = keccak256(abi.encodePacked(ensName));
        address currentOwner = ens.owner(node);
        if (currentOwner != address(0) && currentOwner != msg.sender) revert ENSNameTaken();

        try ensResolver.setName(node, ensName) {
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

    // Admin functions
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

    // View functions
    function isVerified(address user) external view returns (bool) {
        return verifiedUsers[user] && !isBanned[user];
    }
}
