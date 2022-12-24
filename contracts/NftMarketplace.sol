// SPDX-License-Identifier: MIT

pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

error NftMarketplace__priceZero();
error NftMarketplace__alreadyListed(address nftAddress, uint256 tokenId);
error NftMarketplace__notOwner();
error NftMarketplace__notListed(address nftAddress, uint256 tokenId);
error NftMarketplace__itemPriceNotMet(
    address nftAddress,
    uint256 tokenId,
    uint256 price
);
error NftMarketplace__notApprovedForMarketplace();
error NftMarketplace__notSeller(
    address nftAddress,
    uint256 tokenId,
    address seller
);
error NftMarketplace__noProceeds();
error NftMarketplace__transferFailed();

contract NftMarketplace is ReentrancyGuard {
    // Type declarations
    struct Listing {
        uint256 price;
        address seller;
    }

    /////// Events ////////
    event ItemListed(
        address seller,
        address nftAddress,
        uint256 tokenId,
        uint256 price
    );

    event ItemBought(
        address buyer,
        address nftAddress,
        uint256 tokenId,
        uint256 price
    );

    event ListingCancelled(address seller, address nftAddress, uint256 tokenId);

    // market variables
    // NftAddress => tokenId => Listing
    mapping(address => mapping(uint256 => Listing)) private s_listings;
    mapping(address => uint256) private s_proceeds;

    //////// Modifiers ////////////
    modifier notListed(address nftAddress, uint256 tokenId) {
        Listing memory listing = s_listings[nftAddress][tokenId];
        if (listing.price > 0) {
            revert NftMarketplace__alreadyListed(nftAddress, tokenId);
        }
        _;
    }

    modifier isOwner(
        address nftAddress,
        uint256 tokenId,
        address spender
    ) {
        IERC721 nft = IERC721(nftAddress);
        address owner = nft.ownerOf(tokenId);
        if (spender != owner) {
            revert NftMarketplace__notOwner();
        }
        _;
    }

    modifier isListed(address nftAddress, uint256 tokenId) {
        Listing memory listing = s_listings[nftAddress][tokenId];
        if (listing.price <= 0) {
            revert NftMarketplace__notListed(nftAddress, tokenId);
        }
        _;
    }

    //////////// Main functions /////////////
    function listItem(
        address nftAddress,
        uint256 tokenId,
        uint256 price
    )
        external
        notListed(nftAddress, tokenId)
        isOwner(nftAddress, tokenId, msg.sender)
    {
        if (price <= 0) {
            revert NftMarketplace__priceZero();
        }

        //check for approaval
        if (IERC721(nftAddress).getApproved(tokenId) != address(this)) {
            revert NftMarketplace__notApprovedForMarketplace();
        }
        //update listings mapping
        s_listings[nftAddress][tokenId] = Listing(price, msg.sender);
        emit ItemListed(msg.sender, nftAddress, tokenId, price);
    }

    function buyItem(
        address nftAddress,
        uint256 tokenId
    ) external payable isListed(nftAddress, tokenId) nonReentrant {
        Listing memory listing = s_listings[nftAddress][tokenId];
        uint256 price = listing.price;

        if (msg.value < price) {
            revert NftMarketplace__itemPriceNotMet(nftAddress, tokenId, price);
        }

        s_proceeds[listing.seller] = msg.value;
        delete (s_listings[nftAddress][tokenId]);
        IERC721(nftAddress).safeTransferFrom(
            listing.seller,
            msg.sender,
            tokenId
        );

        emit ItemBought(msg.sender, nftAddress, tokenId, price);
    }

    function cancelListing(
        address nftAddress,
        uint256 tokenId
    )
        external
        isOwner(nftAddress, tokenId, msg.sender)
        isListed(nftAddress, tokenId)
    {
        delete (s_listings[nftAddress][tokenId]);
        emit ListingCancelled(msg.sender, nftAddress, tokenId);
    }

    function updatePrice(
        address nftAddress,
        uint256 tokenId,
        uint256 newPrice
    )
        external
        isOwner(nftAddress, tokenId, msg.sender)
        isListed(nftAddress, tokenId)
    {
        if (newPrice <= 0) {
            revert NftMarketplace__priceZero();
        }
        s_listings[nftAddress][tokenId].price = newPrice;
        emit ItemListed(msg.sender, nftAddress, tokenId, newPrice);
    }

    function withdrawProceeds() external {
        uint256 proceeds = s_proceeds[msg.sender];
        if (proceeds <= 0) {
            revert NftMarketplace__noProceeds();
        }

        s_proceeds[msg.sender] = 0;
        (bool success, ) = payable(msg.sender).call{value: proceeds}("");
        if (!success) {
            revert NftMarketplace__transferFailed();
        }
    }

    //////////////// Getter functions ////////////
    function getListing(
        address nftAddress,
        uint256 tokenId
    ) external view returns (Listing memory) {
        return s_listings[nftAddress][tokenId];
    }

    function getProceeds(address seller) external view returns (uint256) {
        return s_proceeds[seller];
    }
}
