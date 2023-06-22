echo "==========================="
npx hardhat run .\scripts\deployLocalTests.ts  --network localhost
echo "==========================="
# run front end 
cd ./frontend
npm run dev


