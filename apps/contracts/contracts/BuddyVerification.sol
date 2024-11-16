// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "./interfaces/IENS.sol";
import "./models/Buddy.sol";

contract BuddyVerification is Ownable {
    using ECDSA for bytes32;

    mapping(address => Buddy) public buddies;
    mapping(address => mapping(address => bool)) public connections;
    mapping(address => mapping(address => bool)) public hasRated;

    event BuddyVerified(address indexed buddy, string ensName);
    event ConnectionMade(address indexed from, address indexed to);
    event BuddyRated(address indexed buddy, uint256 rating);
    event SpecialtiesUpdated(address indexed buddy, string[] specialties);

    IENS public ensResolver;

    constructor(address _ensResolver) {
        require(_ensResolver != address(0), "Invalid ENS resolver address");
        ensResolver = IENS(_ensResolver);
    }

    function getMessageHash(
        address buddy,
        string memory ensName
    ) public pure returns (bytes32) {
        return keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", 
            keccak256(abi.encodePacked(buddy, ensName))));
    }

    function verifyBuddy(
        address buddy, 
        string memory ensName, 
        bytes memory signature,
        string[] memory specialties
    ) external onlyOwner {
        bytes32 messageHash = keccak256(abi.encodePacked(buddy, ensName));
        bytes32 ethSignedMessageHash = keccak256(abi.encodePacked(
            "\x19Ethereum Signed Message:\n32",
            messageHash
        ));
        
        address recoveredSigner = recoverSigner(ethSignedMessageHash, signature);
        require(recoveredSigner == buddy, "Invalid signature");
        require(bytes(ensName).length > 0, "Empty ENS name");
        require(specialties.length > 0, "No specialties provided");

        buddies[buddy] = Buddy({
            ensName: ensName,
            isVerified: true,
            verificationTimestamp: block.timestamp,
            totalConnections: 0,
            specialties: specialties,
            rating: 0,
            totalRatings: 0
        });

        emit BuddyVerified(buddy, ensName);
        emit SpecialtiesUpdated(buddy, specialties);
    }

    function recoverSigner(bytes32 _ethSignedMessageHash, bytes memory _signature)
        public
        pure
        returns (address)
    {
        (bytes32 r, bytes32 s, uint8 v) = splitSignature(_signature);
        return ecrecover(_ethSignedMessageHash, v, r, s);
    }

    function splitSignature(bytes memory sig)
        public
        pure
        returns (bytes32 r, bytes32 s, uint8 v)
    {
        require(sig.length == 65, "Invalid signature length");

        assembly {
            r := mload(add(sig, 32))
            s := mload(add(sig, 64))
            v := byte(0, mload(add(sig, 96)))
        }
        // Version of signature should be 27 or 28, but 0 and 1 are also possible versions
        if (v < 27) {
            v += 27;
        }
        require(v == 27 || v == 28, "Invalid signature version");
    }
    function connect(address buddy) external {
        require(buddies[buddy].isVerified, "Buddy not verified");
        require(!connections[msg.sender][buddy], "Already connected");
        require(msg.sender != buddy, "Cannot connect to self");

        connections[msg.sender][buddy] = true;
        buddies[buddy].totalConnections++;

        emit ConnectionMade(msg.sender, buddy);
    }

    function rateBuddy(address buddy, uint256 rating) external {
        require(connections[msg.sender][buddy], "Not connected");
        require(rating >= 1 && rating <= 5, "Invalid rating");
        require(!hasRated[msg.sender][buddy], "Already rated");

        Buddy storage buddyData = buddies[buddy];
        buddyData.rating = ((buddyData.rating * buddyData.totalRatings) + rating) / 
                          (buddyData.totalRatings + 1);
        buddyData.totalRatings++;
        hasRated[msg.sender][buddy] = true;

        emit BuddyRated(buddy, rating);
    }

    function updateSpecialties(string[] memory newSpecialties) external {
        require(buddies[msg.sender].isVerified, "Not a verified buddy");
        require(newSpecialties.length > 0, "No specialties provided");

        buddies[msg.sender].specialties = newSpecialties;
        emit SpecialtiesUpdated(msg.sender, newSpecialties);
    }

    function getBuddyInfo(address buddy) external view returns (
        string memory ensName,
        bool isVerified,
        uint256 verificationTime,
        uint256 totalConnections,
        string[] memory specialties,
        uint256 rating
    ) {
        Buddy storage buddyData = buddies[buddy];
        return (
            buddyData.ensName,
            buddyData.isVerified,
            buddyData.verificationTimestamp,
            buddyData.totalConnections,
            buddyData.specialties,
            buddyData.rating
        );
    }

    function isBuddy(address user) external view returns (bool) {
        return buddies[user].isVerified;
    }

    function isConnected(address user, address buddy) external view returns (bool) {
        return connections[user][buddy];
    }

    function getBuddySpecialties(address buddy) external view returns (string[] memory) {
        return buddies[buddy].specialties;
    }
}