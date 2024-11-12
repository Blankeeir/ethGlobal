// contracts/ServareMarketplace.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;


import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract ServareMarketplace is ReentrancyGuard, AccessControl {
    IERC721 public nftContract;
    IERC20 public vetToken;
    
    struct Listing {
        uint256 tokenId;
        address seller;
        uint256 price;
        bool isActive;
        uint256 listedAt;
        ListingType listingType;
        uint256 auctionEndTime;
        address highestBidder;
        uint256 highestBid;
    }

    enum ListingType { FixedPrice, Auction }

    mapping(uint256 => Listing) public listings;
    mapping(uint256 => mapping(address => uint256)) public bids;
    
    uint256 public platformFee = 250; // 2.5% in basis points
    address public feeCollector;

    event Listed(
        uint256 indexed tokenId,
        address indexed seller,
        uint256 price,
        ListingType listingType
    );
    
    event Sale(
        uint256 indexed tokenId,
        address indexed seller,
        address indexed buyer,
        uint256 price
    );
    
    event BidPlaced(
        uint256 indexed tokenId,
        address indexed bidder,
        uint256 amount
    );
    
    event AuctionFinalized(
        uint256 indexed tokenId,
        address indexed winner,
        uint256 amount
    );

    constructor(
        address _nftContract,
        address _vetToken,
        address _feeCollector
    ) {
        nftContract = IERC721(_nftContract);
        vetToken = IERC20(_vetToken);
        feeCollector = _feeCollector;
        grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    function listItem(
        uint256 tokenId,
        uint256 price,
        ListingType listingType,
        uint256 auctionDuration
    ) external nonReentrant {
        require(
            nftContract.ownerOf(tokenId) == msg.sender,
            "Not token owner"
        );
        require(
            nftContract.getApproved(tokenId) == address(this),
            "Marketplace not approved"
        );
        
        listings[tokenId] = Listing({
            tokenId: tokenId,
            seller: msg.sender,
            price: price,
            isActive: true,
            listedAt: block.timestamp,
            listingType: listingType,
            auctionEndTime: listingType == ListingType.Auction ? 
                block.timestamp + auctionDuration : 0,
            highestBidder: address(0),
            highestBid: 0
        });

        nftContract.transferFrom(msg.sender, address(this), tokenId);
        
        emit Listed(tokenId, msg.sender, price, listingType);
    }

    function buyItem(uint256 tokenId) external nonReentrant {
        Listing storage listing = listings[tokenId];
        require(listing.isActive, "Listing not active");
        require(
            listing.listingType == ListingType.FixedPrice,
            "Not a fixed price listing"
        );

        uint256 price = listing.price;
        address seller = listing.seller;

        // Calculate platform fee
        uint256 fee = (price * platformFee) / 10000;
        uint256 sellerAmount = price - fee;

        // Process payment
        require(
            vetToken.transferFrom(msg.sender, feeCollector, fee),
            "Fee transfer failed"
        );
        require(
            vetToken.transferFrom(msg.sender, seller, sellerAmount),
            "Payment failed"
        );

        // Transfer NFT
        nftContract.transferFrom(address(this), msg.sender, tokenId);
        
        listing.isActive = false;
        
        emit Sale(tokenId, seller, msg.sender, price);
    }

    function placeBid(uint256 tokenId, uint256 amount) external nonReentrant {
        Listing storage listing = listings[tokenId];
        require(listing.isActive, "Listing not active");
        require(
            listing.listingType == ListingType.Auction,
            "Not an auction"
        );
        require(
            block.timestamp < listing.auctionEndTime,
            "Auction ended"
        );
        require(
            amount > listing.highestBid,
            "Bid too low"
        );

        // Refund previous highest bidder
        if (listing.highestBidder != address(0)) {
            require(
                vetToken.transfer(listing.highestBidder, listing.highestBid),
                "Refund failed"
            );
        }

        // Process new bid
        require(
            vetToken.transferFrom(msg.sender, address(this), amount),
            "Bid transfer failed"
        );

        listing.highestBidder = msg.sender;
        listing.highestBid = amount;

        emit BidPlaced(tokenId, msg.sender, amount);
    }

    function finalizeAuction(uint256 tokenId) external nonReentrant {
        Listing storage listing = listings[tokenId];
        require(listing.isActive, "Listing not active");
        require(
            listing.listingType == ListingType.Auction,
            "Not an auction"
        );
        require(
            block.timestamp >= listing.auctionEndTime,
            "Auction not ended"
        );

        listing.isActive = false;

        if (listing.highestBidder != address(0)) {
            // Calculate and transfer platform fee
            uint256 fee = (listing.highestBid * platformFee) / 10000;
            uint256 sellerAmount = listing.highestBid - fee;

            require(
                vetToken.transfer(feeCollector, fee),
                "Fee transfer failed"
            );
            require(
                vetToken.transfer(listing.seller, sellerAmount),
                "Payment failed"
            );

            // Transfer NFT to winner
            nftContract.transferFrom(
                address(this),
                listing.highestBidder,
                tokenId
            );

            emit AuctionFinalized(
                tokenId,
                listing.highestBidder,
                listing.highestBid
            );
        } else {
            // Return NFT to seller if no bids
            nftContract.transferFrom(
                address(this),
                listing.seller,
                tokenId
            );
        }
    }

    function cancelListing(uint256 tokenId) external nonReentrant {
        Listing storage listing = listings[tokenId];
        require(listing.isActive, "Listing not active");
        require(
            msg.sender == listing.seller || hasRole(DEFAULT_ADMIN_ROLE, msg.sender),
            "Not authorized"
            // Completing the ServareMarketplace contract with additional functionality

    // Continue from cancelListing function
    );
        
        // Return NFT to seller
        nftContract.transferFrom(address(this), listing.seller, tokenId);
        listing.isActive = false;

        // Refund highest bidder if auction
        if (listing.listingType == ListingType.Auction && listing.highestBidder != address(0)) {
            require(
                vetToken.transfer(listing.highestBidder, listing.highestBid),
                "Refund failed"
            );
        }
    }

    function updatePlatformFee(uint256 newFee) external {
        require(hasRole(DEFAULT_ADMIN_ROLE, msg.sender), "Not admin");
        require(newFee <= 1000, "Fee too high"); // Max 10%
        platformFee = newFee;
    }

    function updateFeeCollector(address newCollector) external {
        require(hasRole(DEFAULT_ADMIN_ROLE, msg.sender), "Not admin");
        require(newCollector != address(0), "Invalid address");
        feeCollector = newCollector;
    }

    function getListing(uint256 tokenId) external view returns (
        address seller,
        uint256 price,
        bool isActive,
        uint256 listedAt,
        ListingType listingType,
        uint256 auctionEndTime,
        address highestBidder,
        uint256 highestBid
    ) {
        Listing storage listing = listings[tokenId];
        return (
            listing.seller,
            listing.price,
            listing.isActive,
            listing.listedAt,
            listing.listingType,
            listing.auctionEndTime,
            listing.highestBidder,
            listing.highestBid
        );
    }

    function getActiveBids(uint256 tokenId, address bidder) external view returns (uint256) {
        return bids[tokenId][bidder];
    }

    function withdrawBid(uint256 tokenId) external nonReentrant {
        require(
            listings[tokenId].auctionEndTime < block.timestamp,
            "Auction not ended"
        );
        require(
            msg.sender != listings[tokenId].highestBidder,
            "Highest bidder cannot withdraw"
        );
        
        uint256 bidAmount = bids[tokenId][msg.sender];
        require(bidAmount > 0, "No bid to withdraw");
        
        bids[tokenId][msg.sender] = 0;
        require(
            vetToken.transfer(msg.sender, bidAmount),
            "Transfer failed"
        );
    }

    function updateListingPrice(uint256 tokenId, uint256 newPrice) external {
        Listing storage listing = listings[tokenId];
        require(msg.sender == listing.seller, "Not seller");
        require(listing.isActive, "Listing not active");
        require(
            listing.listingType == ListingType.FixedPrice,
            "Cannot update auction price"
        );
        listing.price = newPrice;
    }

    // Required override
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}