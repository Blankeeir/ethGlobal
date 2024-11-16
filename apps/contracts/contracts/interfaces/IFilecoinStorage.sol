// interfaces/IFilecoinStorage.sol
interface IFilecoinStorage {
    function store(bytes memory data) external returns (string memory cid);
    function retrieve(string memory cid) external view returns (bytes memory);
}