const { Contract, utils, constants } = require("ethers");
const pairArtifact = require("@uniswap/v2-periphery/build/IUniswapV2Pair.json");
const routerArtifact = require("@uniswap/v2-periphery/build/UniswapV2Router02.json");
const erc20Artifact = require("@openzeppelin/contracts/build/contracts/IERC20.json");


async function main() {
  // Replace these with the addresses of your deployed contracts
  const ownerAddress = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
  const routerAddress = "0x5fc748f1FEb28d7b76fa1c6B07D8ba2d5535177c";
  const usdtAddress = "0xab16A69A5a8c12C732e0DEFF4BE56A70bb64c926";
  const usdcAddress = "0xE3011A37A904aB90C8881a99BD1F6E21401f1522";
  const pairAddress = "0x317a0b90F666B95848593e24B039854C39432634";

  const [owner] = await ethers.getSigners();

  if (owner.address !== ownerAddress) {
    console.error("The connected account is not the owner.");
    process.exit(1);
  }

  const router = new Contract(routerAddress, routerArtifact.abi, owner);
  const usdt = new Contract(usdtAddress, erc20Artifact.abi, owner);
  const usdc = new Contract(usdcAddress, erc20Artifact.abi, owner);

  const approval1 = await usdt.approve(router.address, constants.MaxUint256);
  await approval1.wait();

  const approval2 = await usdc.approve(router.address, constants.MaxUint256);
  await approval2.wait();

  const token0Amount = utils.parseUnits("200");
  const token1Amount = utils.parseUnits("200");
  const deadline = Math.floor(Date.now() / 1000 + 10 * 60);

  const addLiquidityTx = await router.connect(owner).addLiquidity(
    usdt.address,
    usdc.address,
    token0Amount,
    token1Amount,
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
