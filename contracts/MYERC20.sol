// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MYERC20 is ERC20 {
    constructor() ERC20("WETH COIN", "WETH") {
        _mint(msg.sender, 10000000 * (10 ** 18));
    }
}
