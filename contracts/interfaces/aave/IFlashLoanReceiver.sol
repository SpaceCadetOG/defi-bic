// SPDX-License-Identifier: MIT
pragma solidity ^0.7.0;

interface IFlashLoanReceiver {
  function executeOperation(
    address[] calldata assets,
    uint[] calldata amounts,
    uint[] calldata premiums,
    address initiator,
    bytes calldata params
  ) external returns (bool);
}