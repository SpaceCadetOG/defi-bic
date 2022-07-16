pragma solidity 0.7;

interface AggregatorV3Interface {
  function latestRoundData()
    external
    view
    returns (
      uint80 roundId,
      uint answer,
      uint startedAt,
      uint updatedAt,
      uint80 answeredInRound
    );
}