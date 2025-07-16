const { network, getNamedAccounts, deployments, ethers } = require("hardhat");
const {developmentChains, networkConfig} = require("../../helper-hardhat-config");
const { assert, expect } = require("chai");




!developmentChains.includes(network.name) 
? describe.skip 
: describe("Raffle Unit Tests", async function () {
    let raffle, vrfCoordinatorV2Mock, raffleEntranceFee, deployer, interval
    const chainId = network.config.chainId

    beforeEach(async function () {
        // const deployer = await getNamedAccounts()
        // await deployments.fixture(["all"])
        // raffle = await ethers.getContractAt("Raffle", deployer)
        // vrfCoordinatorV2Mock = await ethers.getContractAt("VRFCoordinatorV2_5Mock", deployer)
       
        deployer = (await getNamedAccounts()).deployer
        await deployments.fixture(["all"])
        const signer = await ethers.getSigner(deployer)
        raffle = await ethers.getContract("Raffle", signer)
        vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2_5Mock", signer)

        // Add consumer to subscription
        await vrfCoordinatorV2Mock.addConsumer(await raffle.getSubscriptionId(), raffle.target);

        raffleEntranceFee = await raffle.getEntranceFee()
        interval = await raffle.getInterval()
    })

    describe("constructor", async function(){
        it("initializes the raffle correctly", async function(){
            // Ideally we make our tests have just 1 assert per "it"
             const raffleState = await raffle.getRaffleState()
            //  const interval = await raffle.getInterval()
             assert.equal(raffleState.toString(), "0")
             assert.equal(interval.toString(), networkConfig[chainId]["interval"])
        })
    })

    describe("enterRaffle", async function () {
            it("reverts when you don't pay enough", async () => {
                await expect(raffle.enterRaffle({ value: 0 })).to.be.revertedWithCustomError(raffle,
                "Raffle__SendMoreToEnterRaffle"
                );
            });
    
    // it("allows entry when sending enough ETH", async () => {
    //     const entranceFee = await raffle.getEntranceFee();
    //     await expect(raffle.enterRaffle({ value: entranceFee })).not.to.be.reverted;
    // });

        it("records players when they enter", async function (){
            await raffle.enterRaffle({value: raffleEntranceFee})
            const playerFromContract = await raffle.getPlayer(0)
            assert.equal(playerFromContract, deployer)
        })

        it("emits event on enter", async function(){
            await expect(raffle.enterRaffle({value: raffleEntranceFee})).to.emit(raffle, "RaffleEntered")
        })

        it("doesn't allow entrance when raffle is calculating", async function(){
            await raffle.enterRaffle({value: raffleEntranceFee})
            await network.provider.send("evm_increaseTime", [Number(interval) + 1])
            await network.provider.send("evm_mine", [])
            // We pretend to be a Chainlink Keeper
            await raffle.performUpkeep('0x') // This is the empty calldata
            await expect(raffle.enterRaffle({value: raffleEntranceFee})).to.be.revertedWithCustomError(raffle,
                "Raffle__RaffleNotOpen"
            );
        })

    })

    describe("checkUpkeep", async function(){
      

        it( "returns false if people haven't sent any ETH", async function(){
            await network.provider.send("evm_increaseTime", [Number(interval) + 1])
            await network.provider.send("evm_mine", [])
           // const {upkeepNeeded} = await raffle.callStatic.checkUpkeep("0x"); // callStatic for simulation
            const {upkeepNeeded} = await raffle.checkUpkeep("0x");
            assert(!upkeepNeeded);
        })

          it("returns false if raffle isn't open" , async function(){
            await raffle.enterRaffle({value: raffleEntranceFee})
            await network.provider.send("evm_increaseTime", [Number(interval) + 1])
            await network.provider.send("evm_mine", [])
            await raffle.performUpkeep('0x')
            const raffleState = await raffle.getRaffleState()
           // const {upkeepNeeded} = await raffle.callStatic.checkUpkeep("0x"); // callStatic for simulation
            const {upkeepNeeded} = await raffle.checkUpkeep("0x");
            assert.equal(raffleState.toString(), "1");
            assert.equal(upkeepNeeded, false);
        })

          it("returns false if enough time hasn't passed", async () => {
                  await raffle.enterRaffle({ value: raffleEntranceFee })
                  await network.provider.send("evm_increaseTime", [Number(interval) - 5]) // use a higher number here if this test fails
                  await network.provider.request({ method: "evm_mine", params: [] })
                 // const { upkeepNeeded } = await raffle.callStatic.checkUpkeep("0x") // upkeepNeeded = (timePassed && isOpen && hasBalance && hasPlayers)
                  const { upkeepNeeded } = await raffle.checkUpkeep("0x")
                 assert(!upkeepNeeded)
         })

         it("returns true if enough time has passed, has players, eth, and is open", async () => {
                  await raffle.enterRaffle({ value: raffleEntranceFee })
                  await network.provider.send("evm_increaseTime", [Number(interval) + 1])
                  await network.provider.request({ method: "evm_mine", params: [] })
                //   const { upkeepNeeded } = await raffle.callStatic.checkUpkeep("0x") // upkeepNeeded = (timePassed && isOpen && hasBalance && hasPlayers)
                const { upkeepNeeded } = await raffle.checkUpkeep("0x") 
                assert(upkeepNeeded)
        })

    })


})