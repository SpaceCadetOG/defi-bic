const TokenAbi = [
    "function balanceOf(address account) external view returns (uint256)",
    // Authenticated Functions
    "function transfer(address to, uint amount) returns (bool)",
    "function approve(address spender, uint256 amount) external returns (bool)",
    "function transferFrom(address from, address to, uint256 amount) external returns (bool)",
  ];
export const tokenAddress = {
    WETH: {
        eth: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
        avax: "0x49D5c2BdFfac6CE2BFdB6640F4F80f226bc10bAB"
    },
    USDC: {
        eth: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
        avax: "0xA7D7079b0FEaD91F3e65f86E8915Cb59c1a4C664"
    },
    DAI: {
        eth: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
        avax: "0xd586E7F844cEa2F87f50152665BCbc2C279D8d70"
    },
    USDT: {
        eth: "0xdAC17F958D2ee523a2206206994597C13D831ec7"
    },
    WBTC: {
        eth: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599"
    },
    WAVAX: "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7"
}

export const tokenWhale = {
    WETH: {
        eth: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"
    },
    USDC: {
        eth: "0x2FAF487A4414Fe77e2327F0bf4AE2a264a776AD2"
    },
    DAI: {
        eth: "0x2FAF487A4414Fe77e2327F0bf4AE2a264a776AD2"
    },
    USDT: {
        eth: "0x2faf487a4414fe77e2327f0bf4ae2a264a776ad2"
    },
    WBTC: {
        eth: "0x2faf487a4414fe77e2327f0bf4ae2a264a776ad2"
    } 

}

// full tokens
