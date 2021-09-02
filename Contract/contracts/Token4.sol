// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract Token4 is ERC20 {
    address payable public owner;
    using SafeMath for uint256;

    constructor(uint256 initialSupply) ERC20("token4", "tk4") {
        _mint(msg.sender, initialSupply);
        owner = payable(msg.sender);
    }
}
