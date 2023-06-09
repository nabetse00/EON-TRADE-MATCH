import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "hardhat-gas-reporter"
import 'solidity-coverage'
import dotenv from "dotenv"

dotenv.config()

const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY
const MNEMONIC = process.env.MNEMONIC
const ADDRESS = process.env.ADDRESS
const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.18",
    settings: {
      optimizer: {
        enabled: true,
        runs: 1000,
      },
    },
  },
  defaultNetwork: "hardhat", 
  networks: {
    tzen: {
      url: 'https://gobi-testnet.horizenlabs.io/ethv1',
      accounts: {mnemonic: `${MNEMONIC}`},
      from: ADDRESS,
      gasPrice: "auto",
      
    },
    hardhat: {
      from: ADDRESS,
      accounts: {mnemonic: `${MNEMONIC}`},
      forking:{
        url: `https://eth-sepolia.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
        blockNumber: 3199644
      }
    }
  }, 
  gasReporter: {
    currency: 'EUR',
    coinmarketcap: COINMARKETCAP_API_KEY,
    enabled: false
  }
};

export default config;
