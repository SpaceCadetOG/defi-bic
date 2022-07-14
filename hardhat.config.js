require("@nomicfoundation/hardhat-toolbox");

const DEFAULT_COMPILER_SETTINGS = {
  version: '0.7.6', 
  settings: {
    evmVersion: 'istanbul',
    optimizer: {
      enabled: true,
      runs: 1_000_000,
    },
    metadata: {
      bytecodeHash: 'none',
    },
  },
}

const DEFAULTv2_COMPILER_SETTINGS = {
  version: '0.7.0', 
  settings: {
    evmVersion: 'istanbul',
    optimizer: {
      enabled: true,
      runs: 1_000_000,
    },
    metadata: {
      bytecodeHash: 'none',
    },
  },
}

module.exports = {
  solidity: {
    compilers: [DEFAULT_COMPILER_SETTINGS],
    overrides: {
      'contracts/SwapV2.sol': DEFAULTv2_COMPILER_SETTINGS,
    },
  },
  vyper: {
    compilers: [{ version: "0.2.1" }, { version: "0.3.0" }],
  },
  networks: {
    hardhat: {
      forking: {
        url: "https://eth-mainnet.g.alchemy.com/v2/vsFDGKdtpoZd19zlv3F7Z_x5EXTol_zr",
      },
    },
  },
  // mocha: {
  //   timeout: 100000000,
  // },
};
