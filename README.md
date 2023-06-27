# Eon Trade Match
![](./frontend/public/logo.png)

Welcome to Eon TradeMatch, the premier platform for automated trades between users without the need for a direct counterparty. Our innovative system matches users based on their desired assets, enabling seamless and secure transactions.

With EonTradeMatch, you have the power to take control of your investments and unlock the potential of your assets. Say goodbye to the limitations of traditional trading methods and embrace the convenience and flexibility of automated trades.

Experience a new era of automated trading with EonTrade. Join our community of traders, eliminate the hassle of finding a direct counterparty, and unlock the full potential of your assets. Embrace the future of trading with EonTrade – where seamless and secure transactions become a reality.

# Design

## Trade Match system


# Tests 

## Tests with localhost network with
Configure hardhat mining to auto, comment this line in [hardhat.config.ts](./hardhat.config.ts):
```ts
// line 38:
      // mining: {
      //   auto: false,
      //   interval: [3000, 6000]
      // },
```
then
```console
npx hardhat test
```

## Tests coverage:
```console
npx hardhat coverage
```

File              |  % Stmts | % Branch |  % Funcs |  % Lines |Uncovered Lines |
------------------|----------|----------|----------|----------|----------------|
 contracts\       |    98.54 |    81.03 |      100 |    96.82 |                |
  Escrow.sol      |    98.54 |    81.03 |      100 |    96.82 |... 554,618,619 |
 contracts\mocks\ |    78.57 |       50 |    66.67 |    78.57 |                |
  Erc20Mock.sol   |      100 |      100 |      100 |      100 |                |
  Erc721Mock.sol  |       75 |       50 |    57.14 |       75 |       46,50,56 |
All files         |    97.26 |    80.68 |     92.5 |    95.96 |                |

# Sample Hardhat Project

This project demonstrates a basic Hardhat use case. It comes with a sample contract, a test for that contract, and a script that deploys that contract.

Try running some of the following tasks:

```shell
npx hardhat help
npx hardhat test
REPORT_GAS=true npx hardhat test
npx hardhat node
npx hardhat run scripts/deploy.ts
```
