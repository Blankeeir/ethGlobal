// contracts/interfaces/IServareNFT.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

interface IBuddyVerification {
    function isBuddy(address user) external view returns (bool);
    function addBuddy(address user) external;
    function removeBuddy(address user) external;
    function getBuddies() external view returns (address[] memory);
    function getBuddyCount() external view returns (uint256);
    function getBuddyAtIndex(uint256 index) external view returns (address);
    function getBuddyIndex(address user) external view returns (uint256);
    function getBuddyStatus(address user) external view returns (bool);
    function getBuddyStatusAtIndex(uint256 index) external view returns (bool);
}
