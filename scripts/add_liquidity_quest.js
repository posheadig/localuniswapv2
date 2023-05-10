const { Contract, utils, constants } = require("ethers");
const pairArtifact = require("@uniswap/v2-periphery/build/IUniswapV2Pair.json");
const routerArtifact = require("@uniswap/v2-periphery/build/UniswapV2Router02.json");
const erc20Artifact = require("@openzeppelin/contracts/build/contracts/IERC20.json");
const SimpleTokenABI = require("../artifacts/contracts/SimpleToken.sol/SimpleToken.json");

async function main() {
  // Replace these with the addresses of your deployed contracts
  const ownerAddress = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
  const routerAddress = "0xeF31027350Be2c7439C1b0BE022d49421488b72C";
  const token1Address = "0x821f3361D454cc98b7555221A06Be563a7E2E0A6";
  const token2Address = "0xF9F47c1286A58101646c0eFBCf3b680EB9b0272D";
  const pairAddress = "0x8A5DA607651F429c61193746eCD3944C3687d66e";

  const [owner] = await ethers.getSigners();

  if (owner.address !== ownerAddress) {
    console.error("The connected account is not the owner.");
    process.exit(1);
  }

  const router = new Contract(routerAddress, routerArtifact.abi, owner);
  const token1 = new Contract(token1Address, erc20Artifact.abi, owner);
  const tokenArtifact = SimpleTokenABI; // Assuming the token has the same ABI as QuestFactory
  const token2 = new Contract(token2Address, tokenArtifact.abi, owner);
  console.log("Token Instance:", token2.address);

  const approval1 = await token1.approve(router.address, constants.MaxUint256);
  await approval1.wait();

  const approval2 = await token2.approve(router.address, constants.MaxUint256);
  await approval2.wait();

  const token1Amount = utils.parseUnits("200");
  const token2Amount = utils.parseUnits("200");
  const deadline = Math.floor(Date.now() / 1000 + 10 * 60);

  const addLiquidityTx = await router.connect(owner).addLiquidity(
    token1Address,
    token2Address,
    token1Amount,
    token2Amount,
    0,
    0,
    owner.address,
    deadline,
    { gasLimit: utils.hexlify(10000000) }
  );
  await addLiquidityTx.wait();

  const pair = new Contract(pairAddress, pairArtifact.abi, owner);
  const reserves = await pair.getReserves();
  console.log("reserves", reserves);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
