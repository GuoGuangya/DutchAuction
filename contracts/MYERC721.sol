// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract MYERC721 is ERC721 {
    constructor() ERC721("PICTRUE", "PIC") {
        _safeMint(msg.sender, 0);
    }
}
