const { Contract, ContractFactory, utils, BigNumber, constants } = require("ethers")

const WETH9 = require("../WETH9.json")

const factoryArtifact = require('@uniswap/v2-core/build/UniswapV2Factory.json')
const routerArtifact = require('@uniswap/v2-periphery/build/UniswapV2Router02.json')
const pairArtifact = require('@uniswap/v2-periphery/build/IUniswapV2Pair.json')
const questFactoryArtifact = require("../artifacts/contracts/QuestFactory.sol/QuestFactory.json");
const SimpleTokenABI = require("../artifacts/contracts/SimpleToken.sol/SimpleToken.json");

async function main() { 
    const [owner] = await ethers.getSigners()
    console.log('owner', owner.address)

    const Factory = new ContractFactory(factoryArtifact.abi, factoryArtifact.bytecode, owner)
    const factory = await Factory.deploy(owner.address)
    console.log('factory', factory.address)

    const QuestFactory = new ContractFactory(questFactoryArtifact.abi, questFactoryArtifact.bytecode, owner);
    const questFactory = await QuestFactory.deploy();
    console.log("questFactory", questFactory.address);

        // Create a new token using the QuestFactory contract
    const name = "Test Token";
    const symbol = "TST";
    const totalSupply = utils.parseUnits("1000", 18);
    const kind = "Example";
    const content = "This is a test token";

    const tx = await questFactory.createToken(name, symbol, totalSupply, owner.address, kind, content);
    const receipt = await tx.wait();
    const tokenCreatedEvent = receipt.events.find((event) => event.event === "TokenCreated");
    const tokenAddress = tokenCreatedEvent.args.tokenAddress;
    console.log(`Token created with address: ${tokenAddress}`);

    const Usdt = await ethers.getContractFactory('Tether', owner)
    const usdt = await Usdt.deploy()
    console.log('usdt', usdt.address)

    const Usdc = await ethers.getContractFactory('UsdCoin', owner)
    const usdc = await Usdc.deploy()
    console.log('usdc', usdc.address)

    await usdt.connect(owner).mint(
      owner.address,
      utils.parseEther('100000')
    )

    await usdc.connect(owner).mint(
      owner.address,
      utils.parseEther('100000')
    )

    const tx1 = await factory.createPair(usdt.address, tokenAddress);
    await tx1.wait();
    
    const pairAddress = await factory.getPair(usdt.address, tokenAddress);
    console.log('pairAddress', pairAddress);

    const tokenArtifact = SimpleTokenABI; // Assuming the token has the same ABI as QuestFactory
    const token = new Contract(tokenAddress, tokenArtifact.abi, owner);
    console.log("Token Instance:", token.address);

    const pair = new Contract(pairAddress, pairArtifact.abi, owner)
    let reserves
    reserves = await pair.getReserves()
    console.log('reserves', reserves)

    const Weth = new ContractFactory(WETH9.abi, WETH9.bytecode, owner)
    const weth = await Weth.deploy()
    console.log('weth', weth.address)

    const Router = new ContractFactory(routerArtifact.abi, routerArtifact.bytecode, owner)
    const router = await Router.deploy(factory.address, weth.address)
    console.log('router', router.address)

    const approval1 = await usdt.approve(router.address, constants.MaxUint256)
    approval1.wait()

    const approvalToken = await token.approve(router.address, constants.MaxUint256);
    await approvalToken.wait();

    const token0Amount = utils.parseUnits('200')
    const token1Amount = utils.parseUnits('200')

    const deadline = Math.floor(Date.now()/1000 + (10*60))

    const addLiquidityTx = await router.connect(owner).addLiquidity(
        usdt.address,
        tokenAddress, // Replace usdc.address with tokenAddress
        token0Amount,
        token1Amount,
        0,
        0,
        owner.address,
        deadline,
        { gasLimit: utils.hexlify(10000000) }
      );
      await addLiquidityTx.wait();

    reserves = await pair.getReserves()
    console.log('reserves', reserves)

 
  }

// Run the script
// npx hardhat run --network localhost scripts/01_deployContracts.js

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });