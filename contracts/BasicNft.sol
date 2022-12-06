// SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract BasicNft is ERC721 {
    uint256 private s_tokenCounter;
    string private constant TOKEN_URI =
        "ipfs://bafybeic63kowpblh2ducjb3pmmjnr5yb4v7qliwig22tvggsdar7osccca";

    constructor() ERC721("Raskutty", "RAS") {
        s_tokenCounter = 0;
    }

    function mintBasicNft() public {
        s_tokenCounter++;
        _safeMint(msg.sender, s_tokenCounter);
    }

    /* View and pure functions */
    function tokenURI(
        uint256 /*tokenId*/
    ) public pure override returns (string memory) {
        return TOKEN_URI;
    }

    function getTokenCounter() public view returns (uint256) {
        return s_tokenCounter;
    }
}
