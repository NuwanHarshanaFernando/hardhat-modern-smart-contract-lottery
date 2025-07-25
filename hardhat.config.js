require("@nomicfoundation/hardhat-toolbox");
// require("@nomicfoundation/hardhat-chai-matchers");
require("@nomicfoundation/hardhat-verify");
require("hardhat-deploy")
require("hardhat-contract-sizer")
require("dotenv").config();

const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL
const PRIVATE_KEY = process.env.PRIVATE_KEY
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY
const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY

/** @type import('hardhat/config').HardhatUserConfig */

module.exports = {
     defaultNetwork: "hardhat",
   networks: {
      hardhat: {
        chainId: 31337,
        blockConfirmations: 1,
      }, 
      sepolia: {
        chainId: 11155111,
        blockConfirmations: 6,
        url: SEPOLIA_RPC_URL,
        accounts: [PRIVATE_KEY]
      }
   },
 etherscan: {
    // Your API key for Etherscan
    // Obtain one at https://etherscan.io/
    apiKey: ETHERSCAN_API_KEY
  },
  solidity: "0.8.28",
   namedAccounts: {
    deployer: {
      default: 0,
    },
    player: {
      default: 1,
    }
  }
};
