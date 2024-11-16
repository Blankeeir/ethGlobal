// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;
// interfaces/IFilecoinStorage.sol
interface IFilecoinStorage {
    function store(bytes memory data) external returns (string memory cid);
    function retrieve(string memory cid) external view returns (bytes memory);
}