const { network } = require("hardhat")
const { developmentChains, networkConfig } = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")


//const VRF_SUB_FUND_AMOUNT = ethers.utils.parseEther("30") // 30 is super overkill, 2 would work
const VRF_SUB_FUND_AMOUNT = ethers.parseEther("2") // 30 is super overkill, 2 would work

module.exports = async function({getNamedAccounts, deployments}){
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId
    let vrfCoordinatorV2Address, subscriptionId

    

     if(developmentChains.includes(network.name)){
        const signer = await ethers.getSigner(deployer)
        const vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2_5Mock")
        // vrfCoordinatorV2Address = vrfCoordinatorV2Mock.address
        vrfCoordinatorV2Address = vrfCoordinatorV2Mock.target
        console.log(vrfCoordinatorV2Address)
        const transactionResponse = await vrfCoordinatorV2Mock.createSubscription()
       // console.log(transactionResponse)
        const transactionReceipt = await transactionResponse.wait(1)
        console.log(transactionReceipt)

        // Logs from receipt
  const logs = transactionReceipt.logs;

  // Use the contract's interface to parse the logs
  const iface = vrfCoordinatorV2Mock.interface;

  for (const log of logs) {
    try {
      const parsed = iface.parseLog(log);
      console.log(`📤 Event Name: ${parsed.name}`);
      console.log(`📦 Event Args:`, parsed.args);

      if (parsed.name === "SubscriptionCreated") {
        subscriptionId = parsed.args.subId;
        console.log("✅ Subscription ID:", subscriptionId.toString());
      }
    } catch (err) {
      // This log is not from this contract (could be from other internal calls)
     // continue;
    }
  }
       // subscriptionId = transactionReceipt.events[0].args.subId

        // const event = transactionReceipt.events.find(
        //     (e) => e.event === "SubscriptionCreated"
        // );

       // const subscriptionId = event.args.subId;

        //   subscriptionId = vrfCoordinatorV2Mock(vrfCoordinatorV2Address)
        //     .createSubscription();

        // Fund the subscription
        // Usually, you'd need the link token on a real network
       //  await vrfCoordinatorV2Mock.fundSubscription(subscriptionId, VRF_SUB_FUND_AMOUNT)

       // await vrfCoordinatorV2Mock.fundSubscription(vrfCoordinatorV2Address, subscriptionId, VRF_SUB_FUND_AMOUNT)
    
    //   const vrfAbi = [
    //     "function fundSubscription(uint64 subId, uint96 amount) external"
    // ];

   // const vrfCoordinator = await ethers.getContract("VRFCoordinatorV2_5Mock");

    const tx = await vrfCoordinatorV2Mock.fundSubscription(subscriptionId, VRF_SUB_FUND_AMOUNT);
    await tx.wait();

    console.log("✅ Funded subscription");
    } else {
        vrfCoordinatorV2Address = networkConfig[chainId]["vrfCoordinatorV2"]
        subscriptionId = networkConfig[chainId]["subscriptionId"]
    }

    const entranceFee = networkConfig[chainId]["entranceFee"]
    const gasLane = networkConfig[chainId]["gasLane"]
    const callbackGasLimit = networkConfig[chainId]["callbackGasLimit"]
    const interval = networkConfig[chainId]["interval"]

    //   uint256 entranceFee,
    //     uint256 interval,
    //     address vrfCoordinator,
    //     bytes32 gasLane,
    //     uint256 subscriptionId,
    //     uint32 callbackGasLimit

  //  const args = [vrfCoordinatorV2Address, entranceFee, gasLane, subscriptionId, callbackGasLimit, interval] 
  const args = [entranceFee, interval, vrfCoordinatorV2Address, gasLane, subscriptionId, callbackGasLimit]
  const raffle = await deploy("Raffle", {
        from: deployer,
        args: args,
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1
    })

    if(!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY){
        log("Verifying...");
        await verify(raffle.address, args)
    }
    log("-------------------------------------")
}

module.exports.tags = ["all", "raffle"]