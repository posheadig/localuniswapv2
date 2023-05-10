// SPDX-License-Identifier: MIT
pragma solidity =0.8.17;

import '@openzeppelin/contracts/token/ERC20/ERC20.sol';

contract SimpleToken is ERC20 {
  constructor(
    string memory name,
    string memory symbol,
    uint256 totalSupply,
    address _owner
  ) ERC20(name, symbol) {
    _mint(_owner, totalSupply);
  }
}