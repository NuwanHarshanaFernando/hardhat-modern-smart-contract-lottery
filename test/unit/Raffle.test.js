const { network, getNamedAccounts, deployments, ethers } = require("hardhat");
const {developmentChains, networkConfig} = require("../../helper-hardhat-config");
const { assert, expect } = require("chai");




!developmentChains.includes(network.name) 
? describe.skip 
: describe("Raffle Unit Tests", async function () {
    let raffle, vrfCoordinatorV2Mock
    const chainId = network.config.chainId

    beforeEach(async function () {
        // const deployer = await getNamedAccounts()
        // await deployments.fixture(["all"])
        // raffle = await ethers.getContractAt("Raffle", deployer)
        // vrfCoordinatorV2Mock = await ethers.getContractAt("VRFCoordinatorV2_5Mock", deployer)
       
        const { deployer } = await getNamedAccounts()
        await deployments.fixture(["all"])
        const signer = await ethers.getSigner(deployer)
        raffle = await ethers.getContract("Raffle", signer)
        vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2_5Mock", signer)
    
    })

    describe("constructor", async function(){
        it("initializes the raffle correctly", async function(){
            // Ideally we make our tests have just 1 assert per "it"
             const raffleState = await raffle.getRaffleState()
             const interval = await raffle.getInterval()
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

    })
})