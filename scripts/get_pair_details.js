const { Contract } = require("ethers");
const pairArtifact = require("@uniswap/v2-periphery/build/IUniswapV2Pair.json");

async function main() {
  // Replace this with the address of your deployed Uniswap pair
  const pairAddress = "0xcbeFca48A4f2d99CDeaaf89Ad073D65b5Ae87fD2";

  const [owner] = await ethers.getSigners();

  const pair = new Contract(pairAddress, pairArtifact.abi, owner);
  const reserves = await pair.getReserves();
  console.log("Reserves:", reserves);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
