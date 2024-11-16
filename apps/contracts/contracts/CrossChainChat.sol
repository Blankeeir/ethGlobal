// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@layerzerolabs/solidity-examples/contracts/lzApp/NonblockingLzApp.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@hyperlane-xyz/core/contracts/interfaces/IMailbox.sol";
import "@hyperlane-xyz/core/contracts/interfaces/IInterchainGasPaymaster.sol";
import "./interfaces/IFilecoinStorage.sol";
import "./models/Message.sol";
import "./models/ChatRoom.sol";

contract CrossChainChat is NonblockingLzApp, ReentrancyGuard {
    // Interfaces
    IMailbox public mailbox;
    IInterchainGasPaymaster public igp;
    IFilecoinStorage public filecoinStorage;

    // Mappings
    mapping(bytes32 => Message) public messages;
    mapping(uint256 => ChatRoom) public chatRooms;
    mapping(uint256 => mapping(uint256 => bytes32)) public chatMessages; // roomId => messageIndex => messageId
    mapping(address => uint256[]) public userChatRooms;
    uint256 public chatRoomCount;

    // Events
    event MessageSent(bytes32 indexed messageId, address indexed from, uint256 indexed roomId, uint16 dstChainId);
    event ChatRoomCreated(uint256 indexed roomId, address[] participants);
    event MessageReceived(bytes32 indexed messageId, address indexed from, uint256 indexed roomId);

    constructor(
        address _endpoint,
        address _mailbox,
        address _igp,
        address _filecoinStorage
    ) Ownable() NonblockingLzApp(_endpoint) ReentrancyGuard() {
        require(_endpoint != address(0), "Invalid endpoint address");
        require(_mailbox != address(0), "Invalid mailbox address");
        require(_igp != address(0), "Invalid IGP address");
        require(_filecoinStorage != address(0), "Invalid Filecoin storage address");
        mailbox = IMailbox(_mailbox);
        igp = IInterchainGasPaymaster(_igp);
        filecoinStorage = IFilecoinStorage(_filecoinStorage);
    }

    // Rest of the contract code remains the same...
    // (createChatRoom, sendMessage, _nonblockingLzReceive, handle, _handleReceivedMessage, getChatRoomMessages, isParticipant, addressToBytes32)
    // Create Chat Room
    function createChatRoom(address[] calldata participants) external returns (uint256) {
        uint256 roomId = chatRoomCount++;

        ChatRoom storage room = chatRooms[roomId];
        room.id = roomId;
        room.participants = participants;
        room.isActive = true;
        room.messageCount = 0;

        for (uint256 i = 0; i < participants.length; i++) {
            userChatRooms[participants[i]].push(roomId);
        }

        emit ChatRoomCreated(roomId, participants);
        return roomId;
    }

    // Send Message Function
    function sendMessage(
        uint16 _dstChainId,
        uint256 roomId,
        string calldata _content,
        bytes calldata _additionalContent,
        string calldata _contentType,
        bool _isEncrypted,
        bytes calldata _adapterParams
    ) external payable nonReentrant {
        ChatRoom storage room = chatRooms[roomId];
        require(room.isActive, "Chat room not active");
        require(isParticipant(msg.sender, room.participants), "Sender not in chat room");

        // Store additional content on Filecoin if provided
        string memory filecoinCID = "";
        if (_additionalContent.length > 0) {
            filecoinCID = filecoinStorage.store(_additionalContent);
        }

        // Generate unique message ID
        bytes32 messageId = keccak256(abi.encodePacked(
            msg.sender,
            roomId,
            block.timestamp,
            room.messageCount
        ));

        // Store message
        messages[messageId] = Message({
            sender: msg.sender,
            recipient: address(0), // In group chat, recipient is not specific
            content: _content,
            timestamp: block.timestamp,
            isEncrypted: _isEncrypted,
            filecoinCID: filecoinCID,
            contentType: _contentType,
            chainId: _dstChainId
        });

        // Update chat room
        chatMessages[roomId][room.messageCount] = messageId;
        room.messageCount++;

        // Prepare payload
        bytes memory payload = abi.encode(
            messageId,
            msg.sender,
            roomId,
            _content,
            _isEncrypted,
            filecoinCID,
            _contentType
        );

        // Send via LayerZero
        _lzSend(
            _dstChainId,
            payload,
            payable(msg.sender),
            address(0x0),
            _adapterParams,
            msg.value
        );

        // Send via Hyperlane
        uint32 hyperlaneDestDomain = uint32(_dstChainId);
        bytes32 messageHash = mailbox.dispatch(
            hyperlaneDestDomain,
            addressToBytes32(address(this)), // Sending to this contract on the destination chain
            payload
        );

        // Pay for Hyperlane gas
        uint256 gasAmount = 200000; // Estimate gas amount
        uint256 gasPayment = igp.quoteGasPayment(hyperlaneDestDomain, gasAmount);
        igp.payForGas{value: gasPayment}(
            messageHash,
            hyperlaneDestDomain,
            gasAmount,
            msg.sender
        );

        emit MessageSent(messageId, msg.sender, roomId, _dstChainId);
    }

    // LayerZero receive function
    function _nonblockingLzReceive(
        uint16 _srcChainId,
        bytes memory, // _srcAddress not used
        uint64,       // _nonce not used
        bytes memory _payload
    ) internal override {
        _handleReceivedMessage(_srcChainId, _payload);
    }

    // Hyperlane message handler
    function handle(
        uint32 _origin,
        bytes32, // _sender not used
        bytes memory _payload
    ) external {
        require(msg.sender == address(mailbox), "Only mailbox can call handle");
        _handleReceivedMessage(uint16(_origin), _payload);
    }

    // Internal function to handle received messages
    function _handleReceivedMessage(uint16 _srcChainId, bytes memory _payload) internal {
        (
            bytes32 messageId,
            address sender,
            uint256 roomId,
            string memory content,
            bool isEncrypted,
            string memory filecoinCID,
            string memory contentType
        ) = abi.decode(
            _payload,
            (bytes32, address, uint256, string, bool, string, string)
        );

        // Store received message
        messages[messageId] = Message({
            sender: sender,
            recipient: address(0),
            content: content,
            timestamp: block.timestamp,
            isEncrypted: isEncrypted,
            filecoinCID: filecoinCID,
            contentType: contentType,
            chainId: _srcChainId
        });

        // Update chat room
        ChatRoom storage room = chatRooms[roomId];
        require(room.isActive, "Chat room not active");
        chatMessages[roomId][room.messageCount] = messageId;
        room.messageCount++;

        emit MessageReceived(messageId, sender, roomId);
    }

    // Get messages from a chat room
    function getChatRoomMessages(uint256 roomId, uint256 offset, uint256 limit)
        external
        view
        returns (Message[] memory)
    {
        ChatRoom storage room = chatRooms[roomId];
        require(room.isActive, "Chat room not active");
        require(isParticipant(msg.sender, room.participants), "Not a participant");

        uint256 totalMessages = room.messageCount;
        require(offset < totalMessages, "Invalid offset");

        uint256 count = limit;
        if (offset + limit > totalMessages) {
            count = totalMessages - offset;
        }

        Message[] memory result = new Message[](count);

        for (uint256 i = 0; i < count; i++) {
            bytes32 messageId = chatMessages[roomId][offset + i];
            result[i] = messages[messageId];
        }

        return result;
    }

    // Helper function to check if an address is a participant
    function isParticipant(address user, address[] memory participants) internal pure returns (bool) {
        for (uint256 i = 0; i < participants.length; i++) {
            if (participants[i] == user) {
                return true;
            }
        }
        return false;
    }

    // Utility function to convert address to bytes32
    function addressToBytes32(address addr) internal pure returns (bytes32) {
        return bytes32(uint256(uint160(addr)));
    }
}
