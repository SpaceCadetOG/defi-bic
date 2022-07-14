// SPDX-License-Identifier: MIT
pragma solidity ^0.7.0;

// import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

contract AvaxPrice {
  AggregatorV3Interface internal priceFeed;

  constructor() {
    // ETH / USD
    priceFeed = AggregatorV3Interface(0xFF3EEb22B5E3dE6e705b44749C2559d704923FD7);
  }

  function getLatestPrice() public view returns (int) {
    (
      uint80 roundID,
      int price,
      uint startedAt,
      uint timeStamp,
      uint80 answeredInRound
    ) = priceFeed.latestRoundData();
    // for ETH / USD price is scaled up by 10 ** 8
    return price / 1e8;
  }
}

interface AggregatorV3Interface {
  function latestRoundData()
    external
    view
    returns (
      uint80 roundId,
      int answer,
      uint startedAt,
      uint updatedAt,
      uint80 answeredInRound
    );
}