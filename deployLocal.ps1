echo "==========================="
npx hardhat run .\scripts\deployERC20_1.ts --network localhost
echo "==========================="
npx hardhat run .\scripts\deployEscrow.ts --network localhost
echo "==========================="
npx hardhat run .\scripts\deployERC20_2.ts --network localhost
echo "==========================="
npx hardhat run .\scripts\deployERC721.ts --network localhost
echo "==========================="
cd ./frontend
npm run dev


