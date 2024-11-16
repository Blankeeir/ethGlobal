//contracts/PostNFT.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";


// import models
import "./models/post.sol";
import "./models/Comment.sol";

// import interfaces
import "./interfaces/IBuddyVerification.sol";


contract PostNFT is ERC721URIStorage, Ownable(msg.sender), ReentrancyGuard {
    using Strings for uint256;
    
    uint256 private _currentTokenId;
    // Storage
    mapping(uint256 => Post) public posts;
    mapping(uint256 => mapping(address => bool)) public postLikes;
    mapping(uint256 => Comment[]) public comments;
    mapping(uint256 => mapping(address => uint256[])) public userCommentIndexes;
    mapping(address => uint256[]) public userPosts;
    mapping(address => uint256) public userPostCount;
    
    // Buddy verification contract
    IBuddyVerification public buddyVerification;

    // Events
    event PostCreated(uint256 indexed tokenId, address indexed author, string category);
    event PostUpdated(uint256 indexed tokenId, string content, string imageURI);
    event PostDeleted(uint256 indexed tokenId);
    event PostLiked(uint256 indexed tokenId, address indexed liker);
    event PostUnliked(uint256 indexed tokenId, address indexed unliker);
    event CommentAdded(uint256 indexed tokenId, address indexed commenter, uint256 commentIndex);
    event CommentUpdated(uint256 indexed tokenId, uint256 commentIndex, string newContent);
    event CommentDeleted(uint256 indexed tokenId, uint256 commentIndex);
    
    // Errors
    error PostDoesNotExist();
    error UnauthorizedAccess();
    error PostAlreadyLiked();
    error PostNotLiked();
    error EmptyContent();
    error DeletedPost();
    error NotBuddy();
    error InvalidAddress();

    // Constructor with proper initialization of all parent contracts
    constructor(
        address _buddyVerification
    ) ERC721("Mental Health Post", "MHP") {
        if (_buddyVerification == address(0)) revert InvalidAddress();
        buddyVerification = IBuddyVerification(_buddyVerification);
    }

    // Modifiers
    modifier postExists(uint256 tokenId) {
        if (!_exists(tokenId)) revert PostDoesNotExist();
        _;
    }

    modifier notDeleted(uint256 tokenId) {
        if (posts[tokenId].isDeleted) revert DeletedPost();
        _;
    }

    modifier onlyPostAuthor(uint256 tokenId) {
        if (posts[tokenId].author != msg.sender) revert UnauthorizedAccess();
        _;
    }

    modifier onlyBuddy() {
        if (!buddyVerification.isBuddy(msg.sender)) revert NotBuddy();
        _;
    }

    // Internal function to check token existence
    function _exists(uint256 tokenId) internal view virtual returns (bool) {
        return _ownerOf(tokenId) != address(0);
    }

    // Post Management Functions
    function createPost(
        string memory content,
        string memory imageURI,
        bool isBuddyOnly,
        string memory category,
        string memory metadataURI
    ) external nonReentrant returns (uint256) {
        if (bytes(content).length == 0) revert EmptyContent();
        
        _currentTokenId++;
        uint256 newTokenId = _currentTokenId;

        posts[newTokenId] = Post({
            content: content,
            imageURI: imageURI,
            author: msg.sender,
            timestamp: block.timestamp,
            likes: 0,
            isBuddyOnly: isBuddyOnly,
            isDeleted: false,
            category: category,
            commentCount: 0
        });

        userPosts[msg.sender].push(newTokenId);
        userPostCount[msg.sender]++;

        _safeMint(msg.sender, newTokenId);
        _setTokenURI(newTokenId, metadataURI);
        
        emit PostCreated(newTokenId, msg.sender, category);
        return newTokenId;
    }

    function updatePost(
        uint256 tokenId,
        string memory content,
        string memory imageURI,
        string memory metadataURI
    ) external postExists(tokenId) notDeleted(tokenId) onlyPostAuthor(tokenId) {
        if (bytes(content).length == 0) revert EmptyContent();
        
        Post storage post = posts[tokenId];
        post.content = content;
        post.imageURI = imageURI;
        
        _setTokenURI(tokenId, metadataURI);
        
        emit PostUpdated(tokenId, content, imageURI);
    }

    function deletePost(uint256 tokenId) 
        external 
        postExists(tokenId) 
        notDeleted(tokenId) 
        onlyPostAuthor(tokenId) 
    {
        posts[tokenId].isDeleted = true;
        emit PostDeleted(tokenId);
    }

    // Like Management
    function likePost(uint256 tokenId) 
        external 
        postExists(tokenId) 
        notDeleted(tokenId) 
    {
        if (postLikes[tokenId][msg.sender]) revert PostAlreadyLiked();
        
        postLikes[tokenId][msg.sender] = true;
        posts[tokenId].likes++;
        
        emit PostLiked(tokenId, msg.sender);
    }

    function unlikePost(uint256 tokenId) 
        external 
        postExists(tokenId) 
        notDeleted(tokenId) 
    {
        if (!postLikes[tokenId][msg.sender]) revert PostNotLiked();
        
        postLikes[tokenId][msg.sender] = false;
        posts[tokenId].likes--;
        
        emit PostUnliked(tokenId, msg.sender);
    }

    // Comment Management
    function addComment(uint256 tokenId, string memory content) 
        external 
        postExists(tokenId) 
        notDeleted(tokenId) 
    {
        Post storage post = posts[tokenId];
        if (post.isBuddyOnly && !buddyVerification.isBuddy(msg.sender)) revert NotBuddy();
        if (bytes(content).length == 0) revert EmptyContent();

        uint256 commentIndex = comments[tokenId].length;
        comments[tokenId].push(Comment({
            commenter: msg.sender,
            content: content,
            timestamp: block.timestamp,
            isDeleted: false
        }));

        userCommentIndexes[tokenId][msg.sender].push(commentIndex);
        post.commentCount++;
        
        emit CommentAdded(tokenId, msg.sender, commentIndex);
    }

    function updateComment(
        uint256 tokenId, 
        uint256 commentIndex, 
        string memory newContent
    ) external postExists(tokenId) notDeleted(tokenId) {
        if (commentIndex >= comments[tokenId].length) revert UnauthorizedAccess();
        if (comments[tokenId][commentIndex].commenter != msg.sender) revert UnauthorizedAccess();
        if (comments[tokenId][commentIndex].isDeleted) revert DeletedPost();
        if (bytes(newContent).length == 0) revert EmptyContent();

        comments[tokenId][commentIndex].content = newContent;
        
        emit CommentUpdated(tokenId, commentIndex, newContent);
    }

    function deleteComment(uint256 tokenId, uint256 commentIndex) 
        external 
        postExists(tokenId) 
    {
        if (commentIndex >= comments[tokenId].length) revert UnauthorizedAccess();
        if (comments[tokenId][commentIndex].commenter != msg.sender) revert UnauthorizedAccess();
        if (comments[tokenId][commentIndex].isDeleted) revert DeletedPost();

        comments[tokenId][commentIndex].isDeleted = true;
        posts[tokenId].commentCount--;
        
        emit CommentDeleted(tokenId, commentIndex);
    }

    // View Functions
    function getPost(uint256 tokenId) 
        external 
        view 
        postExists(tokenId) 
        returns (
            string memory content,
            string memory imageURI,
            address author,
            uint256 timestamp,
            uint256 likes,
            bool isBuddyOnly,
            string memory category,
            uint256 commentCount
        ) 
    {
        Post memory post = posts[tokenId];
        return (
            post.content,
            post.imageURI,
            post.author,
            post.timestamp,
            post.likes,
            post.isBuddyOnly,
            post.category,
            post.commentCount
        );
    }

    function getUserPosts(address user) 
        external 
        view 
        returns (uint256[] memory) 
    {
        return userPosts[user];
    }

    function getPostComments(uint256 tokenId) 
        external 
        view 
        postExists(tokenId) 
        returns (Comment[] memory) 
    {
        return comments[tokenId];
    }

    function getUserComments(uint256 tokenId, address user) 
        external 
        view 
        returns (uint256[] memory) 
    {
        return userCommentIndexes[tokenId][user];
    }

    // Admin Functions
    function setBuddyVerification(address _buddyVerification) 
        external 
        onlyOwner 
    {
        buddyVerification = IBuddyVerification(_buddyVerification);
    }

    // Override transfer function to handle post ownership
    function _transfer(
        address from,
        address to,
        uint256 tokenId
    ) internal virtual override {
        super._transfer(from, to, tokenId);
        
        // Update post author
        if (!posts[tokenId].isDeleted) {
            posts[tokenId].author = to;
            
            // Update user post tracking
            uint256[] storage fromPosts = userPosts[from];
            uint256[] storage toPosts = userPosts[to];
            
            // Remove from original owner
            for (uint256 i = 0; i < fromPosts.length; i++) {
                if (fromPosts[i] == tokenId) {
                    fromPosts[i] = fromPosts[fromPosts.length - 1];
                    fromPosts.pop();
                    break;
                }
            }
            
            // Add to new owner
            toPosts.push(tokenId);
            
            userPostCount[from]--;
            userPostCount[to]++;
        }
    }

    // Override supportsInterface function
    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}