// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;
import "@layerzerolabs/solidity-examples/contracts/lzApp/NonblockingLzApp.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./interfaces/IBuddyVerification.sol";
import "./interfaces/IFilecoinStorage.sol";
import "./models/Message.sol";
import "./models/ChatInfo.sol";

contract MentalHealthMessaging is NonblockingLzApp, ReentrancyGuard {
    // Mappings
    mapping(bytes32 => Message) public messages;
    mapping(address => uint256) public messageCount;
    mapping(address => mapping(address => ChatInfo)) public chats;
    mapping(address => address[]) private activeChatPartners;

    // Interfaces
    IBuddyVerification public buddyVerification;
    IFilecoinStorage public filecoinStorage;

    // Constants
    uint256 public constant MAX_MESSAGE_LENGTH = 2000;
    uint256 public constant MAX_ACTIVE_CHATS = 100;

    // Events
    event MessageSent(
        bytes32 indexed messageId,
        address indexed from,
        address indexed to,
        uint16 dstChainId
    );
    event MessageReceived(
        bytes32 indexed messageId,
        address indexed from,
        address indexed to
    );
    event ChatStarted(address indexed user1, address indexed user2);
    event ChatEnded(address indexed user1, address indexed user2);

    constructor(
        address _endpoint,
        address _buddyVerification,
        address _filecoinStorage
    ) NonblockingLzApp(_endpoint) ReentrancyGuard() Ownable(msg.sender) {
        require(_endpoint != address(0), "Invalid endpoint address");
        require(_buddyVerification != address(0), "Invalid buddy verification address");
        require(_filecoinStorage != address(0), "Invalid Filecoin storage address");
        buddyVerification = IBuddyVerification(_buddyVerification);
        filecoinStorage = IFilecoinStorage(_filecoinStorage);
    }

    // Send Message Function
    function sendMessage(
        uint16 _dstChainId,
        address _recipient,
        string calldata _content,
        bytes calldata _additionalContent, // Additional content to store on Filecoin
        string calldata _contentType,      // Content type for additional content
        bool _isEncrypted,
        bytes calldata _adapterParams
    ) external payable nonReentrant {
        require(
            buddyVerification.isBuddy(msg.sender) || 
            buddyVerification.isBuddy(_recipient),
            "Either sender or recipient must be a buddy"
        );
        require(bytes(_content).length <= MAX_MESSAGE_LENGTH, "Message too long");
        require(_recipient != address(0) && _recipient != msg.sender, "Invalid recipient");

        // Store additional content on Filecoin if provided
        string memory filecoinCID = "";
        if (_additionalContent.length > 0) {
            filecoinCID = filecoinStorage.store(_additionalContent);
        }

        // Generate unique message ID
        bytes32 messageId = keccak256(abi.encodePacked(
            msg.sender,
            _recipient,
            block.timestamp,
            messageCount[msg.sender]
        ));

        // Store message locally
        messages[messageId] = Message({
            sender: msg.sender,
            recipient: _recipient,
            content: _content,
            timestamp: block.timestamp,
            isEncrypted: _isEncrypted,
            filecoinCID: filecoinCID,
            contentType: _contentType,
            chainId: _dstChainId
        });

        // Update chat info
        if (!chats[msg.sender][_recipient].isActive) {
            require(
                activeChatPartners[msg.sender].length < MAX_ACTIVE_CHATS,
                "Too many active chats"
            );
            chats[msg.sender][_recipient].isActive = true;
            activeChatPartners[msg.sender].push(_recipient);
            emit ChatStarted(msg.sender, _recipient);
        }

        chats[msg.sender][_recipient].lastMessageTime = block.timestamp;
        chats[msg.sender][_recipient].messageCount++;
        messageCount[msg.sender]++;

        // Prepare and send cross-chain message
        bytes memory payload = abi.encode(
            messageId,
            msg.sender,
            _recipient,
            _content,
            _isEncrypted,
            filecoinCID,
            _contentType
        );

        _lzSend(
            _dstChainId,
            payload,
            payable(msg.sender),
            address(0x0),
            _adapterParams,
            msg.value
        );

        emit MessageSent(messageId, msg.sender, _recipient, _dstChainId);
    }

    // LayerZero receive function
    function _nonblockingLzReceive(
        uint16 _srcChainId,
        bytes memory, // _srcAddress not used
        uint64,       // _nonce not used
        bytes memory _payload
    ) internal override {
        (
            bytes32 messageId,
            address sender,
            address recipient,
            string memory content,
            bool isEncrypted,
            string memory filecoinCID,
            string memory contentType
        ) = abi.decode(
            _payload,
            (bytes32, address, address, string, bool, string, string)
        );

        // Store received message
        messages[messageId] = Message({
            sender: sender,
            recipient: recipient,
            content: content,
            timestamp: block.timestamp,
            isEncrypted: isEncrypted,
            filecoinCID: filecoinCID,
            contentType: contentType,
            chainId: _srcChainId
        });

        // Update chat info for recipient
        if (!chats[recipient][sender].isActive) {
            chats[recipient][sender].isActive = true;
            activeChatPartners[recipient].push(sender);
            emit ChatStarted(recipient, sender);
        }

        chats[recipient][sender].lastMessageTime = block.timestamp;
        chats[recipient][sender].messageCount++;

        emit MessageReceived(messageId, sender, recipient);
    }

    // Get active chats
    function getActiveChats(address user) 
        external 
        view 
        returns (
            address[] memory partners,
            uint256[] memory lastMessageTimes,
            uint256[] memory messageCounts
        ) 
    {
        address[] memory activePartners = activeChatPartners[user];
        uint256 count = activePartners.length;

        lastMessageTimes = new uint256[](count);
        messageCounts = new uint256[](count);

        for (uint256 i = 0; i < count; i++) {
            address partner = activePartners[i];
            ChatInfo memory chatInfo = chats[user][partner];
            lastMessageTimes[i] = chatInfo.lastMessageTime;
            messageCounts[i] = chatInfo.messageCount;
        }

        return (activePartners, lastMessageTimes, messageCounts);
    }

    // Get chat history
    function getChatHistory(
        address user1,
        address user2,
        uint256 offset,
        uint256 limit
    ) external view returns (Message[] memory chatMessages) {
        require(
            msg.sender == user1 || msg.sender == user2,
            "Only chat participants can view history"
        );

        ChatInfo memory chat = chats[user1][user2];
        require(chat.isActive, "No active chat between users");

        uint256 totalMessages = chat.messageCount;
        require(offset < totalMessages, "Invalid offset");

        uint256 count = limit;
        if (offset + limit > totalMessages) {
            count = totalMessages - offset;
        }

        chatMessages = new Message[](count);
        uint256 messageIndex = 0;

        for (uint256 i = offset; i < offset + count; i++) {
            bytes32 messageId = keccak256(abi.encodePacked(
                user1,
                user2,
                i
            ));
            Message memory msgData = messages[messageId];
            if (
                (msgData.sender == user1 && msgData.recipient == user2) ||
                (msgData.sender == user2 && msgData.recipient == user1)
            ) {
                chatMessages[messageIndex] = msgData;
                messageIndex++;
            }
        }
    }

    // End chat
    function endChat(address partner) external {
        require(chats[msg.sender][partner].isActive, "Chat not active");

        // Remove from active chats
        address[] storage partners = activeChatPartners[msg.sender];
        for (uint256 i = 0; i < partners.length; i++) {
            if (partners[i] == partner) {
                partners[i] = partners[partners.length - 1];
                partners.pop();
                break;
            }
        }

        chats[msg.sender][partner].isActive = false;
        emit ChatEnded(msg.sender, partner);
    }
}
