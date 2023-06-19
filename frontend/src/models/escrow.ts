import { parseUnits } from "viem"

export const ESCROW_ADDRESS: `0x${string}` = "0x6ec034FaBccb5AF17b5eC2460bf36A39D797425c"
export const CONFIRMATIONS: number = 10

export const ESCROW_ABI = [
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "unlockTime_",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "flat_fees_",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "admin_",
        "type": "address"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "tradeId",
            "type": "uint256"
          },
          {
            "internalType": "address",
            "name": "owner",
            "type": "address"
          },
          {
            "components": [
              {
                "internalType": "uint256",
                "name": "assetId",
                "type": "uint256"
              },
              {
                "internalType": "enum Escrow.AssetTypes",
                "name": "assetType",
                "type": "uint8"
              },
              {
                "internalType": "address",
                "name": "assetAddress",
                "type": "address"
              },
              {
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
              }
            ],
            "internalType": "struct Escrow.Asset",
            "name": "fromAsset",
            "type": "tuple"
          },
          {
            "components": [
              {
                "internalType": "uint256",
                "name": "assetId",
                "type": "uint256"
              },
              {
                "internalType": "enum Escrow.AssetTypes",
                "name": "assetType",
                "type": "uint8"
              },
              {
                "internalType": "address",
                "name": "assetAddress",
                "type": "address"
              },
              {
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
              }
            ],
            "internalType": "struct Escrow.Asset",
            "name": "toAsset",
            "type": "tuple"
          },
          {
            "internalType": "bool",
            "name": "allowPartial",
            "type": "bool"
          },
          {
            "internalType": "uint256",
            "name": "expireTime",
            "type": "uint256"
          }
        ],
        "indexed": false,
        "internalType": "struct Escrow.Trade",
        "name": "t",
        "type": "tuple"
      }
    ],
    "name": "TradeCreated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "tradeId",
            "type": "uint256"
          },
          {
            "internalType": "address",
            "name": "owner",
            "type": "address"
          },
          {
            "components": [
              {
                "internalType": "uint256",
                "name": "assetId",
                "type": "uint256"
              },
              {
                "internalType": "enum Escrow.AssetTypes",
                "name": "assetType",
                "type": "uint8"
              },
              {
                "internalType": "address",
                "name": "assetAddress",
                "type": "address"
              },
              {
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
              }
            ],
            "internalType": "struct Escrow.Asset",
            "name": "fromAsset",
            "type": "tuple"
          },
          {
            "components": [
              {
                "internalType": "uint256",
                "name": "assetId",
                "type": "uint256"
              },
              {
                "internalType": "enum Escrow.AssetTypes",
                "name": "assetType",
                "type": "uint8"
              },
              {
                "internalType": "address",
                "name": "assetAddress",
                "type": "address"
              },
              {
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
              }
            ],
            "internalType": "struct Escrow.Asset",
            "name": "toAsset",
            "type": "tuple"
          },
          {
            "internalType": "bool",
            "name": "allowPartial",
            "type": "bool"
          },
          {
            "internalType": "uint256",
            "name": "expireTime",
            "type": "uint256"
          }
        ],
        "indexed": false,
        "internalType": "struct Escrow.Trade",
        "name": "t",
        "type": "tuple"
      }
    ],
    "name": "TradeRemoved",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "tradeId",
            "type": "uint256"
          },
          {
            "internalType": "address",
            "name": "owner",
            "type": "address"
          },
          {
            "components": [
              {
                "internalType": "uint256",
                "name": "assetId",
                "type": "uint256"
              },
              {
                "internalType": "enum Escrow.AssetTypes",
                "name": "assetType",
                "type": "uint8"
              },
              {
                "internalType": "address",
                "name": "assetAddress",
                "type": "address"
              },
              {
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
              }
            ],
            "internalType": "struct Escrow.Asset",
            "name": "fromAsset",
            "type": "tuple"
          },
          {
            "components": [
              {
                "internalType": "uint256",
                "name": "assetId",
                "type": "uint256"
              },
              {
                "internalType": "enum Escrow.AssetTypes",
                "name": "assetType",
                "type": "uint8"
              },
              {
                "internalType": "address",
                "name": "assetAddress",
                "type": "address"
              },
              {
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
              }
            ],
            "internalType": "struct Escrow.Asset",
            "name": "toAsset",
            "type": "tuple"
          },
          {
            "internalType": "bool",
            "name": "allowPartial",
            "type": "bool"
          },
          {
            "internalType": "uint256",
            "name": "expireTime",
            "type": "uint256"
          }
        ],
        "indexed": false,
        "internalType": "struct Escrow.Trade",
        "name": "ta",
        "type": "tuple"
      },
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "tradeId",
            "type": "uint256"
          },
          {
            "internalType": "address",
            "name": "owner",
            "type": "address"
          },
          {
            "components": [
              {
                "internalType": "uint256",
                "name": "assetId",
                "type": "uint256"
              },
              {
                "internalType": "enum Escrow.AssetTypes",
                "name": "assetType",
                "type": "uint8"
              },
              {
                "internalType": "address",
                "name": "assetAddress",
                "type": "address"
              },
              {
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
              }
            ],
            "internalType": "struct Escrow.Asset",
            "name": "fromAsset",
            "type": "tuple"
          },
          {
            "components": [
              {
                "internalType": "uint256",
                "name": "assetId",
                "type": "uint256"
              },
              {
                "internalType": "enum Escrow.AssetTypes",
                "name": "assetType",
                "type": "uint8"
              },
              {
                "internalType": "address",
                "name": "assetAddress",
                "type": "address"
              },
              {
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
              }
            ],
            "internalType": "struct Escrow.Asset",
            "name": "toAsset",
            "type": "tuple"
          },
          {
            "internalType": "bool",
            "name": "allowPartial",
            "type": "bool"
          },
          {
            "internalType": "uint256",
            "name": "expireTime",
            "type": "uint256"
          }
        ],
        "indexed": false,
        "internalType": "struct Escrow.Trade",
        "name": "tb",
        "type": "tuple"
      }
    ],
    "name": "TradesMatched",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "tradeId",
            "type": "uint256"
          },
          {
            "internalType": "address",
            "name": "owner",
            "type": "address"
          },
          {
            "components": [
              {
                "internalType": "uint256",
                "name": "assetId",
                "type": "uint256"
              },
              {
                "internalType": "enum Escrow.AssetTypes",
                "name": "assetType",
                "type": "uint8"
              },
              {
                "internalType": "address",
                "name": "assetAddress",
                "type": "address"
              },
              {
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
              }
            ],
            "internalType": "struct Escrow.Asset",
            "name": "fromAsset",
            "type": "tuple"
          },
          {
            "components": [
              {
                "internalType": "uint256",
                "name": "assetId",
                "type": "uint256"
              },
              {
                "internalType": "enum Escrow.AssetTypes",
                "name": "assetType",
                "type": "uint8"
              },
              {
                "internalType": "address",
                "name": "assetAddress",
                "type": "address"
              },
              {
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
              }
            ],
            "internalType": "struct Escrow.Asset",
            "name": "toAsset",
            "type": "tuple"
          },
          {
            "internalType": "bool",
            "name": "allowPartial",
            "type": "bool"
          },
          {
            "internalType": "uint256",
            "name": "expireTime",
            "type": "uint256"
          }
        ],
        "indexed": false,
        "internalType": "struct Escrow.Trade",
        "name": "ta",
        "type": "tuple"
      },
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "tradeId",
            "type": "uint256"
          },
          {
            "internalType": "address",
            "name": "owner",
            "type": "address"
          },
          {
            "components": [
              {
                "internalType": "uint256",
                "name": "assetId",
                "type": "uint256"
              },
              {
                "internalType": "enum Escrow.AssetTypes",
                "name": "assetType",
                "type": "uint8"
              },
              {
                "internalType": "address",
                "name": "assetAddress",
                "type": "address"
              },
              {
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
              }
            ],
            "internalType": "struct Escrow.Asset",
            "name": "fromAsset",
            "type": "tuple"
          },
          {
            "components": [
              {
                "internalType": "uint256",
                "name": "assetId",
                "type": "uint256"
              },
              {
                "internalType": "enum Escrow.AssetTypes",
                "name": "assetType",
                "type": "uint8"
              },
              {
                "internalType": "address",
                "name": "assetAddress",
                "type": "address"
              },
              {
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
              }
            ],
            "internalType": "struct Escrow.Asset",
            "name": "toAsset",
            "type": "tuple"
          },
          {
            "internalType": "bool",
            "name": "allowPartial",
            "type": "bool"
          },
          {
            "internalType": "uint256",
            "name": "expireTime",
            "type": "uint256"
          }
        ],
        "indexed": false,
        "internalType": "struct Escrow.Trade",
        "name": "tb",
        "type": "tuple"
      }
    ],
    "name": "TradesPartialyMatched",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "administrator",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "availableFees",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "assetId",
            "type": "uint256"
          },
          {
            "internalType": "enum Escrow.AssetTypes",
            "name": "assetType",
            "type": "uint8"
          },
          {
            "internalType": "address",
            "name": "assetAddress",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
          }
        ],
        "internalType": "struct Escrow.Asset",
        "name": "a",
        "type": "tuple"
      },
      {
        "internalType": "uint256[]",
        "name": "fromAssetTokensIds",
        "type": "uint256[]"
      }
    ],
    "name": "checkFromAssetValid",
    "outputs": [],
    "stateMutability": "pure",
    "type": "function"
  },
  {
    "inputs": [
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "assetId",
            "type": "uint256"
          },
          {
            "internalType": "enum Escrow.AssetTypes",
            "name": "assetType",
            "type": "uint8"
          },
          {
            "internalType": "address",
            "name": "assetAddress",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
          }
        ],
        "internalType": "struct Escrow.Asset",
        "name": "a",
        "type": "tuple"
      }
    ],
    "name": "checkToAssetValid",
    "outputs": [],
    "stateMutability": "pure",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "collectedFees",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "owner_",
        "type": "address"
      },
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "assetId",
            "type": "uint256"
          },
          {
            "internalType": "enum Escrow.AssetTypes",
            "name": "assetType",
            "type": "uint8"
          },
          {
            "internalType": "address",
            "name": "assetAddress",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
          }
        ],
        "internalType": "struct Escrow.Asset",
        "name": "fromAsset_",
        "type": "tuple"
      },
      {
        "internalType": "uint256[]",
        "name": "fromAssetTokensIds",
        "type": "uint256[]"
      },
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "assetId",
            "type": "uint256"
          },
          {
            "internalType": "enum Escrow.AssetTypes",
            "name": "assetType",
            "type": "uint8"
          },
          {
            "internalType": "address",
            "name": "assetAddress",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
          }
        ],
        "internalType": "struct Escrow.Asset",
        "name": "toAsset_",
        "type": "tuple"
      },
      {
        "internalType": "bool",
        "name": "allowPartial_",
        "type": "bool"
      },
      {
        "internalType": "uint256",
        "name": "duration",
        "type": "uint256"
      }
    ],
    "name": "createTrade",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "flat_fee",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "assetId",
        "type": "uint256"
      }
    ],
    "name": "getNftTokensIds",
    "outputs": [
      {
        "internalType": "uint256[]",
        "name": "",
        "type": "uint256[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getTrades",
    "outputs": [
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "tradeId",
            "type": "uint256"
          },
          {
            "internalType": "address",
            "name": "owner",
            "type": "address"
          },
          {
            "components": [
              {
                "internalType": "uint256",
                "name": "assetId",
                "type": "uint256"
              },
              {
                "internalType": "enum Escrow.AssetTypes",
                "name": "assetType",
                "type": "uint8"
              },
              {
                "internalType": "address",
                "name": "assetAddress",
                "type": "address"
              },
              {
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
              }
            ],
            "internalType": "struct Escrow.Asset",
            "name": "fromAsset",
            "type": "tuple"
          },
          {
            "components": [
              {
                "internalType": "uint256",
                "name": "assetId",
                "type": "uint256"
              },
              {
                "internalType": "enum Escrow.AssetTypes",
                "name": "assetType",
                "type": "uint8"
              },
              {
                "internalType": "address",
                "name": "assetAddress",
                "type": "address"
              },
              {
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
              }
            ],
            "internalType": "struct Escrow.Asset",
            "name": "toAsset",
            "type": "tuple"
          },
          {
            "internalType": "bool",
            "name": "allowPartial",
            "type": "bool"
          },
          {
            "internalType": "uint256",
            "name": "expireTime",
            "type": "uint256"
          }
        ],
        "internalType": "struct Escrow.Trade[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "lastAssetIndex",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "lastTradeIndex",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "minLockTime",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "nftData",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      },
      {
        "internalType": "bytes",
        "name": "",
        "type": "bytes"
      }
    ],
    "name": "onERC721Received",
    "outputs": [
      {
        "internalType": "bytes4",
        "name": "",
        "type": "bytes4"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "flat_fee_",
        "type": "uint256"
      }
    ],
    "name": "setFee",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "trades",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "tradeId",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "owner",
        "type": "address"
      },
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "assetId",
            "type": "uint256"
          },
          {
            "internalType": "enum Escrow.AssetTypes",
            "name": "assetType",
            "type": "uint8"
          },
          {
            "internalType": "address",
            "name": "assetAddress",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
          }
        ],
        "internalType": "struct Escrow.Asset",
        "name": "fromAsset",
        "type": "tuple"
      },
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "assetId",
            "type": "uint256"
          },
          {
            "internalType": "enum Escrow.AssetTypes",
            "name": "assetType",
            "type": "uint8"
          },
          {
            "internalType": "address",
            "name": "assetAddress",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
          }
        ],
        "internalType": "struct Escrow.Asset",
        "name": "toAsset",
        "type": "tuple"
      },
      {
        "internalType": "bool",
        "name": "allowPartial",
        "type": "bool"
      },
      {
        "internalType": "uint256",
        "name": "expireTime",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "tradesIds",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "seller",
        "type": "address"
      }
    ],
    "name": "tradesOf",
    "outputs": [
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "tradeId",
            "type": "uint256"
          },
          {
            "internalType": "address",
            "name": "owner",
            "type": "address"
          },
          {
            "components": [
              {
                "internalType": "uint256",
                "name": "assetId",
                "type": "uint256"
              },
              {
                "internalType": "enum Escrow.AssetTypes",
                "name": "assetType",
                "type": "uint8"
              },
              {
                "internalType": "address",
                "name": "assetAddress",
                "type": "address"
              },
              {
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
              }
            ],
            "internalType": "struct Escrow.Asset",
            "name": "fromAsset",
            "type": "tuple"
          },
          {
            "components": [
              {
                "internalType": "uint256",
                "name": "assetId",
                "type": "uint256"
              },
              {
                "internalType": "enum Escrow.AssetTypes",
                "name": "assetType",
                "type": "uint8"
              },
              {
                "internalType": "address",
                "name": "assetAddress",
                "type": "address"
              },
              {
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
              }
            ],
            "internalType": "struct Escrow.Asset",
            "name": "toAsset",
            "type": "tuple"
          },
          {
            "internalType": "bool",
            "name": "allowPartial",
            "type": "bool"
          },
          {
            "internalType": "uint256",
            "name": "expireTime",
            "type": "uint256"
          }
        ],
        "internalType": "struct Escrow.Trade[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "newAdmin",
        "type": "address"
      }
    ],
    "name": "transferOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address payable",
        "name": "to",
        "type": "address"
      }
    ],
    "name": "withdrawFees",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "seller",
        "type": "address"
      }
    ],
    "name": "withdrawTrades",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const

export const FLAT_FEES = parseUnits("1.0", 12)


export type AssetContract = {
  assetId: bigint,
  assetType: number,
  assetAddress: `0x${string}`
  amount: bigint
}

export interface Trade {
  key?:number;
  tradeId: bigint;
  owner: `0x${string}`;
  fromAsset:AssetContract;
  allowPartial: boolean; 
  toAsset: AssetContract;
  expireTime: bigint;
}