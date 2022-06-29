require("@nomiclabs/hardhat-waffle");
require('dotenv').config();

const { PRIVATE_KEY, NFT_URL } = process.env;

module.exports = {
  solidity: "0.8.4",
  defaultNetwork: "polygon_mumbai",
  networks: {
    hardhat: {},
    polygon_mumbai: {
      url: NFT_URL,
      accounts: [`0x${PRIVATE_KEY}`]
    }
  },
  paths: {
    artifacts: "./src/backend/artifacts",
    sources: "./src/backend/contracts",
    cache: "./src/backend/cache",
    tests: "./src/backend/test"
  },
};
