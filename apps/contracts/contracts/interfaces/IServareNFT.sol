//contracts/interfaces/IServareNFT.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

interface IServareNFT {
    function ownerOf(uint256 tokenId) external view returns (address);
    function getProduct(uint256 tokenId) external view returns (
        string memory name,
        string memory description,
        uint256 quantity,
        string memory location,
        uint256 expiryDate,
        string memory productionDate,
        string memory category,
        string memory imageUri,
        uint256 price,
        bool isListed,
        address producer,
        bool isVerified,
        uint256 carbonFootprint,
        uint256 qualityScore
    );
    function updateQualityScore(uint256 tokenId, int256 temperature, int256 humidity) external;
}