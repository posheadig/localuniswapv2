const { Contract, ContractFactory, utils, BigNumber, constants } = require("ethers");

const WETH9 = require("../WETH9.json");
const factoryArtifact = require("@uniswap/v2-core/build/UniswapV2Factory.json");
const routerArtifact = require("@uniswap/v2-periphery/build/UniswapV2Router02.json");
const pairArtifact = require("@uniswap/v2-periphery/build/IUniswapV2Pair.json");
const questFactoryArtifact = require("../artifacts/contracts/QuestFactory.sol/QuestFactory.json");

async function main() {
  const [owner] = await ethers.getSigners();
  console.log("owner", owner.address);

  // Deploy the UniswapV2Factory contract
  const Factory = new ContractFactory(factoryArtifact.abi, factoryArtifact.bytecode, owner);
  const factory = await Factory.deploy(owner.address);
  console.log("factory", factory.address);

  // Replace these addresses with the token created from the QuestFactory contract and another token's address (e.g., USDT)
  const token1Address = "0x49fd2BE640DB2910c2fAb69bB8531Ab6E76127ff";
  const token2Address = "0x86A2EE8FAf9A840F7a2c64CA3d51209F9A02081D";

  // Create a pair using the factory contract
  const tx1 = await factory.createPair(token1Address, token2Address);
  await tx1.wait();

  const pairAddress = await factory.getPair(token1Address, token2Address);
  console.log("pairAddress", pairAddress);

  const pair = new Contract(pairAddress, pairArtifact.abi, owner);
  let reserves;
  reserves = await pair.getReserves();
  console.log("reserves", reserves);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
